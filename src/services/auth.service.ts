import { prisma } from '../config/database.js';
import { UserRole, AccountStatus } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from '../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';
import { auditService } from './audit.service.js';

export interface RegisterDto {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  // Student specifics
  enrollmentNumber?: string;
  department?: string;
  course?: string;
  graduationYear?: number;
  cgpa?: number;
  // Alumni specifics
  currentCompany?: string;
  currentRole?: string;
  // Mentor specifics
  expertise?: string[];
  yearsExperience?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDto, ipAddress?: string) {
    // 1. Prevent public registration for privileged roles
    if (data.role === UserRole.ADMIN || data.role === UserRole.PLACEMENT_MANAGER) {
      throw new ForbiddenError('Self-registration for administrative roles is prohibited');
    }

    // 2. Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const emailVerifyToken = uuidv4();

    // 3. Create user and profile within transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: data.role,
          status: AccountStatus.ACTIVE,
          isEmailVerified: false,
          emailVerifyToken,
        },
      });

      if (data.role === UserRole.STUDENT) {
        if (!data.enrollmentNumber || !data.department || !data.graduationYear) {
          throw new BadRequestError('Enrollment number, department, and graduation year are required for students');
        }

        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            fullName: data.fullName,
            phone: data.phone,
            enrollmentNumber: data.enrollmentNumber,
            department: data.department,
            course: data.course || 'B.Tech',
            graduationYear: data.graduationYear,
            cgpa: data.cgpa || 0.0,
            profileCompletion: 40,
          },
        });
      } else if (data.role === UserRole.ALUMNI) {
        if (!data.department || !data.graduationYear) {
          throw new BadRequestError('Department and graduation year are required for alumni');
        }

        await tx.alumniProfile.create({
          data: {
            userId: newUser.id,
            fullName: data.fullName,
            phone: data.phone,
            department: data.department,
            graduationYear: data.graduationYear,
            currentCompany: data.currentCompany,
            currentRole: data.currentRole,
          },
        });
      } else if (data.role === UserRole.MENTOR) {
        await tx.mentorProfile.create({
          data: {
            userId: newUser.id,
            fullName: data.fullName,
            phone: data.phone,
            currentCompany: data.currentCompany,
            currentRole: data.currentRole,
            expertise: data.expertise || [],
            yearsExperience: data.yearsExperience || 0,
          },
        });
      }

      return newUser;
    });

    await auditService.record({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      details: { role: user.role, email: user.email },
      ipAddress,
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens: { accessToken, refreshToken },
      verifyToken: emailVerifyToken,
    };
  }

  async login(data: LoginDto, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        studentProfile: true,
        alumniProfile: true,
        mentorProfile: true,
        managerProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}. Contact administrator.`);
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    await auditService.record({
      actorId: user.id,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
    });

    let profile: any = null;
    if (user.studentProfile) profile = user.studentProfile;
    else if (user.alumniProfile) profile = user.alumniProfile;
    else if (user.mentorProfile) profile = user.mentorProfile;
    else if (user.managerProfile) profile = user.managerProfile;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        profile,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedError('Refresh token required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!savedToken || savedToken.isRevoked || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is invalid or has been revoked');
    }

    // Revoke old token (Refresh Token Rotation)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { isRevoked: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedError('User account not found or inactive');
    }

    // Generate new token pair
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If an account exists, a reset link will be sent.' };
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        resetTokenExpiresAt: expiresAt,
      },
    });

    return {
      message: 'Password reset token generated.',
      resetToken, // for testing / dev convenience
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    // Revoke all existing refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return { message: 'Password has been reset successfully. Please log in.' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        studentProfile: true,
        alumniProfile: true,
        mentorProfile: true,
        managerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export const authService = new AuthService();

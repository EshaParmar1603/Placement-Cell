import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/appError.js';
import { prisma } from '../config/database.js';
import { AccountStatus, UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  studentProfileId?: string;
  mentorProfileId?: string;
  managerProfileId?: string;
  alumniProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let decoded: TokenPayload;

    try {
      decoded = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: { select: { id: true } },
        mentorProfile: { select: { id: true } },
        managerProfile: { select: { id: true } },
        alumniProfile: { select: { id: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedError(`Account is ${user.status.toLowerCase()}`);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      studentProfileId: user.studentProfile?.id,
      mentorProfileId: user.mentorProfile?.id,
      managerProfileId: user.managerProfile?.id,
      alumniProfileId: user.alumniProfile?.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

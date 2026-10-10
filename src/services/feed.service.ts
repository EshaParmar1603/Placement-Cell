import { prisma } from '../config/database.js';
import { PostType, UserRole } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/appError.js';

export interface CreatePostDto {
  postType: PostType;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
}

export class FeedService {
  async createPost(userId: string, role: UserRole, data: CreatePostDto) {
    const isPinned = role === UserRole.PLACEMENT_MANAGER && data.postType === PostType.ANNOUNCEMENT;

    return prisma.feedPost.create({
      data: {
        authorId: userId,
        authorRole: role,
        postType: data.postType,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        tags: data.tags || [],
        isPinned,
        isSpotlight: data.postType === PostType.PLACEMENT_STORY,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            studentProfile: { select: { fullName: true, department: true } },
            alumniProfile: { select: { fullName: true, currentCompany: true } },
            mentorProfile: { select: { fullName: true, currentCompany: true } },
            managerProfile: { select: { fullName: true, designation: true } },
          },
        },
      },
    });
  }

  async listPosts(params: {
    postType?: PostType;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isHidden: false };
    if (params.postType) where.postType = params.postType;
    if (params.tag) where.tags = { has: params.tag };
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.feedPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              role: true,
              studentProfile: { select: { fullName: true, department: true } },
              alumniProfile: { select: { fullName: true, currentCompany: true, isVerified: true } },
              mentorProfile: { select: { fullName: true, currentCompany: true, isVerified: true } },
              managerProfile: { select: { fullName: true, designation: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.feedPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(postId: string) {
    const post = await prisma.feedPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            role: true,
            studentProfile: { select: { fullName: true, department: true } },
            alumniProfile: { select: { fullName: true, currentCompany: true, isVerified: true } },
            mentorProfile: { select: { fullName: true, currentCompany: true, isVerified: true } },
            managerProfile: { select: { fullName: true, designation: true } },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                role: true,
                studentProfile: { select: { fullName: true } },
                alumniProfile: { select: { fullName: true } },
                mentorProfile: { select: { fullName: true } },
                managerProfile: { select: { fullName: true } },
              },
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post || post.isHidden) {
      throw new NotFoundError('Post not found');
    }

    return post;
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await prisma.feedLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.feedLike.delete({
        where: { id: existing.id },
      });
      return { liked: false };
    } else {
      await prisma.feedLike.create({
        data: { postId, userId },
      });
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    const post = await prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    return prisma.feedComment.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            role: true,
            studentProfile: { select: { fullName: true } },
            alumniProfile: { select: { fullName: true } },
            mentorProfile: { select: { fullName: true } },
            managerProfile: { select: { fullName: true } },
          },
        },
      },
    });
  }

  async reportPost(postId: string) {
    const post = await prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    return prisma.feedPost.update({
      where: { id: postId },
      data: { isReported: true },
    });
  }

  async deletePost(postId: string, userId: string, role: UserRole) {
    const post = await prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    if (post.authorId !== userId && role !== UserRole.ADMIN && role !== UserRole.PLACEMENT_MANAGER) {
      throw new ForbiddenError('Unauthorized to delete this post');
    }

    return prisma.feedPost.delete({ where: { id: postId } });
  }
}

export const feedService = new FeedService();

import { z } from 'zod';
import { PostType } from '@prisma/client';

export const createPostSchema = z.object({
  postType: z.nativeEnum(PostType).default(PostType.GENERAL),
  title: z.string().min(3),
  content: z.string().min(10),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const addCommentSchema = z.object({
  content: z.string().min(1),
});

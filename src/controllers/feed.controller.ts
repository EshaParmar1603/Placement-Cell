import { Request, Response, NextFunction } from 'express';
import { feedService } from '../services/feed.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class FeedController {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await feedService.createPost(req.user!.id, req.user!.role, req.body);
      return sendCreated(res, post, 'Post published to alumni feed');
    } catch (error) {
      next(error);
    }
  }

  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { postType, tag, search, page, limit } = req.query as any;
      const result = await feedService.listPosts({
        postType,
        tag,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        userId: req.user?.id,
      });
      return sendSuccess(res, result.posts, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const post = await feedService.getPostById(id);
      return sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const result = await feedService.toggleLike(id, req.user!.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      const comment = await feedService.addComment(id, req.user!.id, req.body.content);
      return sendCreated(res, comment, 'Comment added');
    } catch (error) {
      next(error);
    }
  }

  async reportPost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      await feedService.reportPost(id);
      return sendSuccess(res, { message: 'Post reported for moderation' });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req, 'id');
      await feedService.deletePost(id, req.user!.id, req.user!.role);
      return sendSuccess(res, { message: 'Post deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const feedController = new FeedController();

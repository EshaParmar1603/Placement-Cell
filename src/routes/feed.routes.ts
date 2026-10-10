import { Router } from 'express';
import { feedController } from '../controllers/feed.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createPostSchema, addCommentSchema } from '../validators/feed.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', feedController.listPosts);
router.post('/', validateBody(createPostSchema), feedController.createPost);
router.get('/:id', feedController.getPostById);
router.post('/:id/like', feedController.toggleLike);
router.post('/:id/comments', validateBody(addCommentSchema), feedController.addComment);
router.post('/:id/report', feedController.reportPost);
router.delete('/:id', feedController.deletePost);

export default router;

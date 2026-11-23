import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';

const router = Router();
router.use(userAuthMiddleware);

router.get('/', controller.list);
router.patch('/:id/read', controller.markRead);
router.post('/read-all', controller.markAllRead);

export default router;

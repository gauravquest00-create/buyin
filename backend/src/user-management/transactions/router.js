import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { txQuerySchema } from './validation.js';

const router = Router();
router.use(userAuthMiddleware);
router.get('/', validate(txQuerySchema, 'query'), controller.list);

export default router;

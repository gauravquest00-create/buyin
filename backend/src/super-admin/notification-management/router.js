import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { broadcastNotificationSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('notifications:read'), controller.list);
router.post('/broadcast', requirePermissions('notifications:send'), validate(broadcastNotificationSchema), controller.broadcast);
export default router;

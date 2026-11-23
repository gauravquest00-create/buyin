import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { updateUserStatusSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);

router.get('/', requirePermissions('users:read'), controller.list);
router.get('/:userId', requirePermissions('users:read'), controller.detail);
router.patch('/:userId/status', requirePermissions('users:suspend'), validate(updateUserStatusSchema), controller.updateStatus);
router.post('/:userId/revoke-sessions', requirePermissions('users:suspend'), controller.revokeSessions);

export default router;
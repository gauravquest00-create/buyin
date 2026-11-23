import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('payments:read'), controller.list);
router.get('/events', requirePermissions('payments:read'), controller.events);
router.post('/reconcile', requirePermissions('payments:reconcile'), controller.reconcile);
export default router;

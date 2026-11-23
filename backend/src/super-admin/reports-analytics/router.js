import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/summary', requirePermissions('reports:read'), controller.summary);
export default router;

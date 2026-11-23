import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('dashboard:read'), controller.overview);
export default router;

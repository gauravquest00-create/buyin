import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/overview', requirePermissions('leads:read'), controller.overview);
router.patch('/:leadId/returned-discount', requirePermissions('leads:write'), controller.toggleReturnedDiscount);
export default router;

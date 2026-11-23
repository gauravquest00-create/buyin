import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createAdminSchema, updateAdminSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('admins:read'), controller.list);
router.post('/', requirePermissions('admins:write'), validate(createAdminSchema), controller.create);
router.patch('/:adminId', requirePermissions('admins:write'), validate(updateAdminSchema), controller.update);
export default router;

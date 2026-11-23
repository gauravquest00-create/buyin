import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { upsertRoleSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('roles:read'), controller.list);
router.post('/', requirePermissions('roles:write'), validate(upsertRoleSchema), controller.create);
router.put('/:roleId', requirePermissions('roles:write'), validate(upsertRoleSchema), controller.update);
export default router;

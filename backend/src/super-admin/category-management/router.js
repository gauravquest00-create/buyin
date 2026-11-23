import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createCategorySchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('categories:read'), controller.list);
router.post('/', requirePermissions('categories:write'), validate(createCategorySchema), controller.create);
router.patch('/:categoryId', requirePermissions('categories:write'), controller.toggle);
export default router;

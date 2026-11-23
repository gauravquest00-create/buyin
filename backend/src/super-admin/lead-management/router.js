import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createLeadSchema, updateLeadSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);

router.get('/', requirePermissions('leads:read'), controller.list);
router.get('/:leadId', requirePermissions('leads:read'), controller.detail);
router.post('/', requirePermissions('leads:write'), validate(createLeadSchema), controller.create);
router.patch('/:leadId', requirePermissions('leads:write'), validate(updateLeadSchema), controller.update);
router.post('/:leadId/publish', requirePermissions('leads:publish'), controller.publish);
router.post('/:leadId/archive', requirePermissions('leads:archive'), controller.archive);

export default router;
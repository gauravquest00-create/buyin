import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { updatePricingSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('pricing:read'), controller.get);
router.put('/', requirePermissions('pricing:write'), validate(updatePricingSchema), controller.update);
export default router;

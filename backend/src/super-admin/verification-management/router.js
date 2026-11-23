import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { reviewVerificationSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('verifications:read'), controller.list);
router.patch('/:recordId/review', requirePermissions('verifications:approve'), validate(reviewVerificationSchema), controller.review);
export default router;

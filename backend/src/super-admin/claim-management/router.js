import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { revokeClaimSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('claims:read'), controller.list);
router.post('/:claimId/revoke', requirePermissions('claims:revoke'), validate(revokeClaimSchema), controller.revoke);
export default router;

import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { approveRefundSchema, rejectRefundSchema, requestInfoSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('refunds:read'), controller.list);
router.post('/:refundId/approve', requirePermissions('refunds:approve'), validate(approveRefundSchema), controller.approve);
router.post('/:refundId/reject', requirePermissions('refunds:review'), validate(rejectRefundSchema), controller.reject);
router.post('/:refundId/request-info', requirePermissions('refunds:review'), validate(requestInfoSchema), controller.requestInfo);
export default router;

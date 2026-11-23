import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware, requireVerifiedUser } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createMemoryUpload } from '../../config/storage.js';
import { createRefundSchema, respondInfoSchema } from './validation.js';

const router = Router();
const evidenceUpload = createMemoryUpload('REFUND_EVIDENCE');

router.use(userAuthMiddleware);
router.get('/', controller.list);
router.get('/preview/:claimId', controller.preview);
router.post('/', requireVerifiedUser, evidenceUpload.array('evidence', 5), validate(createRefundSchema), controller.create);
router.post('/:refundId/respond', validate(respondInfoSchema), controller.respondInfo);

export default router;

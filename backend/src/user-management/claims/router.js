import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware, requireVerifiedUser } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createClaimSchema } from './validation.js';

const router = Router();
router.use(userAuthMiddleware);

router.post('/', requireVerifiedUser, validate(createClaimSchema), controller.create);
router.get('/:claimId/extend-preview', requireVerifiedUser, controller.extensionPreview);
router.post('/:claimId/extend', requireVerifiedUser, controller.extend);

export default router;

import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createFollowUpSchema, createSiteVisitSchema, updateLeadStatusSchema, updateSiteVisitSchema } from './validation.js';

const router = Router();
router.use(userAuthMiddleware);

router.get('/', controller.list);
router.get('/:claimId', controller.detail);
router.patch('/:claimId/status', validate(updateLeadStatusSchema), controller.updateStatus);
router.post('/:claimId/follow-ups', validate(createFollowUpSchema), controller.addFollowUp);
router.post('/:claimId/site-visits', validate(createSiteVisitSchema), controller.scheduleVisit);
router.patch('/site-visits/:visitId', validate(updateSiteVisitSchema), controller.updateVisit);

export default router;

import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { leadPoolQuerySchema } from './validation.js';

const router = Router();
router.use(userAuthMiddleware);

router.get('/dashboard-summary', controller.dashboardSummary);
router.get('/', validate(leadPoolQuerySchema, 'query'), controller.list);
router.get('/:leadId', controller.detail);

export default router;

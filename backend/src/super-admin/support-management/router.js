import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { adminReplyTicketSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('support:read'), controller.list);
router.post('/:ticketId/reply', requirePermissions('support:write'), validate(adminReplyTicketSchema), controller.reply);
export default router;

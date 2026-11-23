import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createMemoryUpload } from '../../config/storage.js';
import { createTicketSchema, replyTicketSchema } from './validation.js';

const router = Router();
const upload = createMemoryUpload('SUPPORT_ATTACHMENT');

router.use(userAuthMiddleware);
router.get('/', controller.list);
router.post('/', upload.single('attachment'), validate(createTicketSchema), controller.create);
router.post('/:ticketId/reply', validate(replyTicketSchema), controller.reply);

export default router;

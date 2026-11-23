import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createMemoryUpload } from '../../config/storage.js';
import { submitVerificationSchema } from './validation.js';

const router = Router();
const docUpload = createMemoryUpload('VERIFICATION_DOC');

router.use(userAuthMiddleware);
router.get('/status', controller.getStatus);
router.post('/submit', docUpload.array('documents', 5), validate(submitVerificationSchema), controller.submit);

export default router;

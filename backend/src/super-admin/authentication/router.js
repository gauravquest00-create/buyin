import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { authRateLimiter } from '../../config/security.js';
import { adminLoginSchema, changePasswordSchema, mfaVerifySchema } from './validation.js';

const router = Router();

router.post('/login', authRateLimiter, validate(adminLoginSchema), controller.login);
router.get('/me', adminAuthMiddleware, controller.me);
router.post('/mfa/enroll', adminAuthMiddleware, controller.enrollMfa);
router.post('/mfa/confirm', adminAuthMiddleware, validate(mfaVerifySchema), controller.confirmMfa);
router.post('/change-password', adminAuthMiddleware, validate(changePasswordSchema), controller.changePassword);
router.post('/logout', adminAuthMiddleware, controller.logout);

export default router;

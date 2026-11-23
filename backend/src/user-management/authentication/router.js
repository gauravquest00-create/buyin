import { Router } from 'express';
import * as controller from './controller.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { authRateLimiter, otpRateLimiter } from '../../config/security.js';
import { loginSchema, registerSchema, resetPasswordSchema, sendOtpSchema, verifyOtpSchema } from './validation.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/send-otp', otpRateLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), controller.verifyOtp);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), controller.resetPassword);

router.get('/me', userAuthMiddleware, controller.me);
router.post('/logout', userAuthMiddleware, controller.logout);
router.get('/sessions', userAuthMiddleware, controller.listSessions);
router.post('/sessions/revoke-all', userAuthMiddleware, controller.revokeAllSessions);

export default router;

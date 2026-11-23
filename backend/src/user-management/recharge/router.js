import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createOrderSchema, verifyPaymentSchema } from './validation.js';

const router = Router();

router.get('/packages', controller.packages);
router.post('/create-order', userAuthMiddleware, validate(createOrderSchema), controller.createOrder);
router.post('/verify', userAuthMiddleware, validate(verifyPaymentSchema), controller.verifyPayment);

export default router;

import { Router } from 'express';
import * as controller from './controller.js';
import { userAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { customQuoteSchema } from './validation.js';

const router = Router();
router.use(userAuthMiddleware);

router.get('/', controller.overview);
router.get('/custom-quote', validate(customQuoteSchema, 'query'), controller.quote);

export default router;

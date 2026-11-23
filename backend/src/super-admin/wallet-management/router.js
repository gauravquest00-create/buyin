import { Router } from 'express';
import * as controller from './controller.js';
import { adminAuthMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requirePermissions } from '../../shared/middleware/rbac.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { manualAdjustmentSchema } from './validation.js';

const router = Router();
router.use(adminAuthMiddleware);
router.get('/', requirePermissions('wallets:read'), controller.list);
router.get('/ledger', requirePermissions('wallets:read'), controller.ledger);
router.post('/adjust', requirePermissions('wallets:adjust'), validate(manualAdjustmentSchema), controller.adjust);
export default router;

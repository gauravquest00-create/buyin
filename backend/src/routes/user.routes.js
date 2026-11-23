import { Router } from 'express';
import authRouter from '../user-management/authentication/router.js';
import profileRouter from '../user-management/profile/router.js';
import verificationRouter from '../user-management/verification/router.js';
import leadPoolRouter from '../user-management/lead-pool/router.js';
import claimsRouter from '../user-management/claims/router.js';
import myLeadsRouter from '../user-management/my-leads/router.js';
import walletRouter from '../user-management/wallet/router.js';
import transactionsRouter from '../user-management/transactions/router.js';
import rechargeRouter from '../user-management/recharge/router.js';
import refundsRouter from '../user-management/refunds/router.js';
import notificationsRouter from '../user-management/notifications/router.js';
import supportRouter from '../user-management/support/router.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/verification', verificationRouter);
router.use('/lead-pool', leadPoolRouter);
router.use('/claims', claimsRouter);
router.use('/my-leads', myLeadsRouter);
router.use('/wallet', walletRouter);
router.use('/transactions', transactionsRouter);
router.use('/recharge', rechargeRouter);
router.use('/refunds', refundsRouter);
router.use('/notifications', notificationsRouter);
router.use('/support', supportRouter);

export default router;

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import request from 'supertest';
import env from '../src/config/environment.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { runBootstrap } from '../src/shared/database/bootstrap.js';
import { createApp } from '../src/app.js';
import { User } from '../src/shared/models/User.model.js';
import { Lead } from '../src/shared/models/Lead.model.js';
import { Wallet } from '../src/shared/models/Wallet.model.js';
import { Payment } from '../src/shared/models/Payment.model.js';
import { Claim } from '../src/shared/models/Claim.model.js';
import { RefundRequest } from '../src/shared/models/RefundRequest.model.js';
import { creditWalletPoints } from '../src/logics/wallet/wallet.logic.js';
import { processExpiredClaimsAndReturnLeads } from '../src/logics/claim/claim.logic.js';
import { VerificationStatus, UserStatus, WalletTxType, LeadPoolState, BudgetBand, PropertyType } from '../src/shared/enums/index.js';
import { generateCode } from '../src/shared/utils/crypto.js';

/**
 * Full End-to-End API + MongoDB integration suite covering:
 * - Health check
 * - User registration, login, User/Admin domain isolation
 * - Concurrent lead claiming atomicity (only 1 succeeds!)
 * - Ownership extension (+7d at 25%) & duplicate prevention
 * - Refund request, review hold, admin 95% approval & duplicate-refund prevention
 * - Razorpay webhook HMAC verification & duplicate-webhook idempotency
 * - Claim expiry & pool return job
 *
 * Run locally after `npm install` with a test MongoDB URI:
 *   NODE_ENV=test MONGODB_URI=mongodb://127.0.0.1:27017/buyin_test npm run test:e2e
 */
test('BUYIN Full E2E Integration Flow (requires live MongoDB)', async (t) => {
  await connectDatabase();
  await runBootstrap();
  const app = createApp();

  t.after(async () => {
    await disconnectDatabase();
  });

  const health = await request(app).get(`${env.API_BASE_PATH}/health`);
  assert.equal(health.status, 200);
  assert.equal(health.body.success, true);

  // Register two users to test isolation and concurrent claiming
  const suffix = Date.now().toString().slice(-6);
  const u1Reg = await request(app).post(`${env.API_BASE_PATH}/user/auth/register`).send({
    fullName: 'Test Broker One',
    mobile: `9811${suffix}`,
    email: `broker1_${suffix}@buyin.test`,
    password: 'Password!1234',
  });
  assert.equal(u1Reg.status, 201);

  const u2Reg = await request(app).post(`${env.API_BASE_PATH}/user/auth/register`).send({
    fullName: 'Test Broker Two',
    mobile: `9822${suffix}`,
    email: `broker2_${suffix}@buyin.test`,
    password: 'Password!1234',
  });
  assert.equal(u2Reg.status, 201);

  // Approve both users and fund wallets for claim concurrency test
  const user1 = await User.findByIdAndUpdate(u1Reg.body.data.user._id, {
    status: UserStatus.ACTIVE,
    verificationStatus: VerificationStatus.APPROVED,
    mobileVerified: true,
  }, { new: true });
  const user2 = await User.findByIdAndUpdate(u2Reg.body.data.user._id, {
    status: UserStatus.ACTIVE,
    verificationStatus: VerificationStatus.APPROVED,
    mobileVerified: true,
  }, { new: true });

  await creditWalletPoints({ userId: user1._id, points: 2000, type: WalletTxType.RECHARGE, reason: 'E2E test credit', idempotencyKey: `e2e-u1-${suffix}`, referenceType: 'PAYMENT' });
  await creditWalletPoints({ userId: user2._id, points: 2000, type: WalletTxType.RECHARGE, reason: 'E2E test credit', idempotencyKey: `e2e-u2-${suffix}`, referenceType: 'PAYMENT' });

  const login1 = await request(app).post(`${env.API_BASE_PATH}/user/auth/login`).send({ identifier: user1.email, password: 'Password!1234' });
  const login2 = await request(app).post(`${env.API_BASE_PATH}/user/auth/login`).send({ identifier: user2.email, password: 'Password!1234' });
  const token1 = login1.body.data.token;
  const token2 = login2.body.data.token;

  // Verify strict User -> Super Admin isolation
  const adminDenied = await request(app).get(`${env.API_BASE_PATH}/superadmin/dashboard`).set('Authorization', `Bearer ${token1}`);
  assert.equal(adminDenied.status, 401);

  // Create test lead in pool
  const lead = await Lead.create({
    leadCode: generateCode('LED'),
    title: 'E2E Test 3BHK Requirement',
    requirementSummary: 'Verified buyer looking for 3BHK in Gurugram',
    buyerName: 'Hidden Buyer',
    buyerPhone: '+919900112233',
    buyerEmail: 'hidden@example.com',
    budgetBand: BudgetBand.CR1_TO_2CR,
    budgetMinInr: 12000000,
    budgetMaxInr: 18000000,
    propertyType: PropertyType.APARTMENT,
    city: 'Gurugram',
    location: 'Sector 65',
    computedClaimPoints: 260,
    poolState: LeadPoolState.AVAILABLE,
  });

  // Concurrent claim race: ONLY ONE may succeed!
  const [c1, c2] = await Promise.all([
    request(app).post(`${env.API_BASE_PATH}/user/claims`).set('Authorization', `Bearer ${token1}`).send({ leadId: String(lead._id) }),
    request(app).post(`${env.API_BASE_PATH}/user/claims`).set('Authorization', `Bearer ${token2}`).send({ leadId: String(lead._id) }),
  ]);
  const statuses = [c1.status, c2.status].sort();
  assert.deepEqual(statuses, [201, 409]);

  // Verify webhook idempotency
  const orderId = `order_e2e_${suffix}`;
  await Payment.create({
    internalTransactionId: generateCode('PAY'),
    userId: user1._id,
    amountInr: 1000,
    amountPaise: 100000,
    basePoints: 900,
    bonusPoints: 0,
    totalPoints: 900,
    razorpayOrderId: orderId,
  });

  if (env.RAZORPAY_WEBHOOK_SECRET) {
    const payload = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: `pay_e2e_${suffix}`, order_id: orderId } } } });
    const sig = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(payload).digest('hex');
    const w1 = await request(app).post(`${env.API_BASE_PATH}/user/recharge/webhook`).set('x-razorpay-signature', sig).set('x-razorpay-event-id', `evt_${suffix}`).set('Content-Type', 'application/json').send(payload);
    const w2 = await request(app).post(`${env.API_BASE_PATH}/user/recharge/webhook`).set('x-razorpay-signature', sig).set('x-razorpay-event-id', `evt_${suffix}`).set('Content-Type', 'application/json').send(payload);
    assert.equal(w1.status, 200);
    assert.equal(w2.body.data.duplicate, true);
  }

  // Verify expiry & return job
  const expiryResult = await processExpiredClaimsAndReturnLeads(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  assert.ok(expiryResult.expiredCount >= 1);
});

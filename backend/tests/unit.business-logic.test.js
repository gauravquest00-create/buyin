import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { calculateClaimPricing } from '../src/logics/pricing/pricing.engine.js';
import { serializeLeadForPool, serializeLeadUnlocked, isLeadEligibleForPoolReturn } from '../src/logics/lead/lead.logic.js';
import { canUserClaimLeads } from '../src/logics/user/user.logic.js';
import { hasPermission } from '../src/shared/middleware/rbac.middleware.js';
import {
  hashPassword,
  verifyPassword,
  generateBase32Secret,
  generateTotpCode,
  verifyTotpCode,
} from '../src/shared/utils/crypto.js';
import {
  calculateRefundBreakdown,
  calculateExtensionCost,
  calculateCustomRecharge,
  verifyRazorpayPaymentHmac,
  verifyRazorpayWebhookHmac,
  hashOtpValue,
  verifyOtpValue,
} from '../src/shared/utils/financial-math.js';
import {
  BudgetBand,
  PropertyType,
  SiteVisitStatus,
  LeadPoolState,
  LeadStatus,
  UserStatus,
  VerificationStatus,
  AdminRoleName,
} from '../src/shared/enums/index.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/shared/constants/index.js';

test('Pricing Engine computes base + property + signals + site visit premium accurately', () => {
  const snapshot = calculateClaimPricing({
    budgetBand: BudgetBand.CR2_TO_5CR, // 380
    propertyType: PropertyType.VILLA_LUXURY, // +60
    purchaseTimeline: 'WITHIN_30_DAYS', // +30
    signals: {
      contactVerified: true, // +20
      budgetConfirmed: true, // +20
      exactLocationConfig: true, // +15
      siteVisitRequested: true, // +25
      buyerActivelyResponding: true, // +20
      fundingLoanReadiness: true, // +20
    },
    siteVisitStatus: SiteVisitStatus.COMPLETED_VERIFIED, // +120
    isReturnedLead: false,
  });

  assert.equal(snapshot.basePoints, 380);
  assert.equal(snapshot.propertyAddition, 60);
  assert.equal(snapshot.signalTotal, 150);
  assert.equal(snapshot.siteVisitPremium, 120);
  assert.equal(snapshot.finalPoints, 710);
});

test('Pricing Engine applies returned-lead discount ONLY when approved', () => {
  const unapproved = calculateClaimPricing({
    budgetBand: BudgetBand.L50_TO_1CR, // 180
    propertyType: PropertyType.APARTMENT, // 0
    signals: {},
    isReturnedLead: true,
    returnCount: 1,
    returnedDiscountApproved: false,
  });
  assert.equal(unapproved.discountPercent, 0);
  assert.equal(unapproved.finalPoints, 180);

  const approved = calculateClaimPricing({
    budgetBand: BudgetBand.L50_TO_1CR, // 180
    propertyType: PropertyType.APARTMENT, // 0
    signals: {},
    isReturnedLead: true,
    returnCount: 1,
    returnedDiscountApproved: true,
  });
  assert.equal(approved.discountPercent, 10);
  assert.equal(approved.discountPoints, 18);
  assert.equal(approved.finalPoints, 162);
});

test('Lead Pool serialization masks private buyer PII before claim and unlocks after claim', () => {
  const rawLead = {
    _id: '507f1f77bcf86cd799439011',
    leadCode: 'LED-TEST-001',
    title: '3 BHK Golf Course Road',
    requirementSummary: 'Ready to move',
    buyerName: 'Ananya Sharma',
    buyerPhone: '+919876543210',
    buyerEmail: 'ananya.sharma@example.com',
    budgetBand: BudgetBand.CR2_TO_5CR,
    propertyType: PropertyType.APARTMENT,
    city: 'Gurugram',
    location: 'Golf Course Road',
    computedClaimPoints: 420,
    poolState: LeadPoolState.AVAILABLE,
  };

  const masked = serializeLeadForPool(rawLead);
  assert.equal(masked.contactLocked, true);
  assert.equal(masked.buyerName, undefined);
  assert.equal(masked.buyerPhone, undefined);
  assert.equal(masked.buyerEmail, undefined);
  assert.equal(masked.buyerPreview.name, 'Locked Buyer');
  assert.ok(masked.buyerPreview.phone.includes('******'));

  const unlocked = serializeLeadUnlocked(rawLead);
  assert.equal(unlocked.contactLocked, false);
  assert.equal(unlocked.buyerContact.name, 'Ananya Sharma');
  assert.equal(unlocked.buyerContact.phone, '+919876543210');
});

test('Lead Return eligibility protects closed, archived, bin, and refund-held leads', () => {
  assert.equal(isLeadEligibleForPoolReturn({ poolState: LeadPoolState.CLAIMED, currentLeadStatus: LeadStatus.FOLLOW_UP, isPermanentlyClosed: false }), true);
  assert.equal(isLeadEligibleForPoolReturn({ poolState: LeadPoolState.CLAIMED, currentLeadStatus: LeadStatus.CLOSED, isPermanentlyClosed: false }), false);
  assert.equal(isLeadEligibleForPoolReturn({ poolState: LeadPoolState.REVIEW_HOLD, currentLeadStatus: LeadStatus.CONTACTED, isPermanentlyClosed: false }), false);
  assert.equal(isLeadEligibleForPoolReturn({ poolState: LeadPoolState.LEAD_BIN, isPermanentlyClosed: true }), false);
});

test('Refund math computes exact 5% deduction and 95% nearest whole point credit', () => {
  const r500 = calculateRefundBreakdown(500);
  assert.equal(r500.deductionPoints, 25);
  assert.equal(r500.refundablePoints, 475);

  const r265 = calculateRefundBreakdown(265);
  assert.equal(r265.refundablePoints, Math.round(265 * 0.95));
  assert.equal(r265.deductionPoints + r265.refundablePoints, 265);
});

test('Ownership extension charges 25% of original claim points', () => {
  assert.equal(calculateExtensionCost(400), 100);
  assert.equal(calculateExtensionCost(260), 65);
});

test('Custom wallet recharge enforces ₹500 minimum and 0.9 points/₹ with zero bonus', () => {
  assert.throws(() => calculateCustomRecharge(499), /Minimum custom recharge/);
  const calc = calculateCustomRecharge(1500);
  assert.equal(calc.basePoints, 1350);
  assert.equal(calc.bonusPoints, 0);
  assert.equal(calc.totalPoints, 1350);
  assert.equal(calc.amountPaise, 150000);
});

test('Razorpay payment signature and raw-body webhook HMAC-SHA256 verification', () => {
  const keySecret = 'rzp_test_secret_unit_key';
  const orderId = 'order_Test12345';
  const paymentId = 'pay_Test67890';
  const validSig = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');

  assert.equal(verifyRazorpayPaymentHmac({ orderId, paymentId, signature: validSig, secret: keySecret }), true);
  assert.equal(verifyRazorpayPaymentHmac({ orderId, paymentId, signature: '0'.repeat(64), secret: keySecret }), false);

  const webhookSecret = 'whsec_test_secret_key';
  const rawBody = Buffer.from(JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: paymentId, order_id: orderId } } } }));
  const validWebhookSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

  assert.equal(verifyRazorpayWebhookHmac(rawBody, validWebhookSig, webhookSecret), true);
  assert.equal(verifyRazorpayWebhookHmac(Buffer.from('{"tampered":true}'), validWebhookSig, webhookSecret), false);
});

test('OTP hashing, password hashing, and RFC 6238 Admin TOTP MFA work securely', async () => {
  const hash = await hashPassword('StrongPass!2026');
  assert.equal(await verifyPassword('StrongPass!2026', hash), true);
  assert.equal(await verifyPassword('WrongPass', hash), false);

  const otpHash = hashOtpValue('482910', '+919811223344:REGISTER', 'session-secret');
  assert.notEqual(otpHash, '482910');
  assert.equal(verifyOtpValue('482910', '+919811223344:REGISTER', otpHash, 'session-secret'), true);
  assert.equal(verifyOtpValue('000000', '+919811223344:REGISTER', otpHash, 'session-secret'), false);

  const mfaSecret = generateBase32Secret();
  const code = generateTotpCode(mfaSecret);
  assert.match(code, /^\d{6}$/);
  assert.equal(verifyTotpCode(mfaSecret, code), true);
  assert.equal(verifyTotpCode(mfaSecret, '000000'), false);
});

test('Verification gating and Super Admin RBAC enforce strict authorization', () => {
  assert.equal(canUserClaimLeads({ status: UserStatus.PENDING_VERIFICATION, verificationStatus: VerificationStatus.SUBMITTED }).allowed, false);
  assert.equal(canUserClaimLeads({ status: UserStatus.SUSPENDED, verificationStatus: VerificationStatus.APPROVED }).allowed, false);
  assert.equal(canUserClaimLeads({ status: UserStatus.ACTIVE, verificationStatus: VerificationStatus.APPROVED }).allowed, true);

  const superAdmin = { roleName: AdminRoleName.SUPER_ADMIN, permissions: [] };
  const financeAdmin = { roleName: AdminRoleName.FINANCE_ADMIN, permissions: DEFAULT_ROLE_PERMISSIONS[AdminRoleName.FINANCE_ADMIN] };

  assert.equal(hasPermission(superAdmin, ['roles:write', 'refunds:approve']), true);
  assert.equal(hasPermission(financeAdmin, ['wallets:adjust', 'payments:reconcile']), true);
  assert.equal(hasPermission(financeAdmin, ['refunds:approve']), false);
});

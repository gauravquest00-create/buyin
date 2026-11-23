import env from './environment.js';

export function buildOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'BUYIN Centralized Platform API',
      version: '1.0.0',
      description: 'Production-grade REST API for BUYIN Real Estate Buyer Requirement & Lead Network. Strictly separates /api/v1/user/* and /api/v1/superadmin/* security domains.',
    },
    servers: [{ url: env.API_BASE_PATH, description: 'Configured API Base Path' }],
    components: {
      securitySchemes: {
        UserBearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        AdminBearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string', example: 'RESOURCE_NOT_AVAILABLE' },
          },
        },
      },
    },
    paths: {
      '/health': { get: { tags: ['Health'], summary: 'Liveness & readiness check', responses: { 200: { description: 'Healthy' } } } },
      '/user/auth/register': { post: { tags: ['User Auth'], summary: 'Register real-estate professional and send Fast2SMS OTP', responses: { 201: { description: 'Registered' } } } },
      '/user/auth/verify-otp': { post: { tags: ['User Auth'], summary: 'Verify OTP and activate session', responses: { 200: { description: 'Verified' } } } },
      '/user/auth/login': { post: { tags: ['User Auth'], summary: 'User login (isolated user JWT & HTTP-only cookie)', responses: { 200: { description: 'Authenticated' } } } },
      '/user/profile': { get: { tags: ['User Profile'], security: [{ UserBearerAuth: [] }], summary: 'Get authenticated user profile', responses: { 200: { description: 'Profile' } } } },
      '/user/verification/submit': { post: { tags: ['Verification'], security: [{ UserBearerAuth: [] }], summary: 'Submit professional onboarding and KYC documents', responses: { 201: { description: 'Submitted' } } } },
      '/user/lead-pool': { get: { tags: ['Lead Pool'], security: [{ UserBearerAuth: [] }], summary: 'Browse masked buyer requirements with filters', responses: { 200: { description: 'Lead pool list' } } } },
      '/user/claims': { post: { tags: ['Claims'], security: [{ UserBearerAuth: [] }], summary: 'Atomically claim a buyer requirement using wallet points', responses: { 201: { description: 'Claimed & buyer contact unlocked' } } } },
      '/user/claims/{claimId}/extend': { post: { tags: ['Claims'], security: [{ UserBearerAuth: [] }], summary: 'Extend ownership by 7 days for 25% of original claim points', responses: { 200: { description: 'Extended' } } } },
      '/user/my-leads': { get: { tags: ['My Leads'], security: [{ UserBearerAuth: [] }], summary: 'List owned leads with unlocked buyer contact info and countdown', responses: { 200: { description: 'My leads' } } } },
      '/user/wallet': { get: { tags: ['Wallet'], security: [{ UserBearerAuth: [] }], summary: 'Get wallet balance, summary, and recharge packages', responses: { 200: { description: 'Wallet summary' } } } },
      '/user/recharge/create-order': { post: { tags: ['Recharge & Razorpay'], security: [{ UserBearerAuth: [] }], summary: 'Create Razorpay order for package or custom recharge (min ₹500)', responses: { 201: { description: 'Order created' } } } },
      '/user/recharge/verify': { post: { tags: ['Recharge & Razorpay'], security: [{ UserBearerAuth: [] }], summary: 'Verify Razorpay payment signature server-side and credit wallet', responses: { 200: { description: 'Verified & credited' } } } },
      '/user/recharge/webhook': { post: { tags: ['Recharge & Razorpay'], summary: 'Raw-body HMAC-SHA256 verified idempotent Razorpay webhook', responses: { 200: { description: 'Processed' } } } },
      '/user/transactions': { get: { tags: ['Transactions'], security: [{ UserBearerAuth: [] }], summary: 'List immutable wallet ledger transactions', responses: { 200: { description: 'Transactions' } } } },
      '/user/refunds': { post: { tags: ['Refunds'], security: [{ UserBearerAuth: [] }], summary: 'Submit refund request (95% credit / 5% deduction) and place review hold', responses: { 201: { description: 'Submitted' } } } },
      '/superadmin/auth/login': { post: { tags: ['Super Admin Auth'], summary: 'Isolated Super Admin login with MFA challenge', responses: { 200: { description: 'Authenticated or MFA required' } } } },
      '/superadmin/auth/mfa/verify': { post: { tags: ['Super Admin Auth'], summary: 'Verify RFC 6238 TOTP MFA code', responses: { 200: { description: 'MFA verified' } } } },
      '/superadmin/dashboard': { get: { tags: ['Super Admin Dashboard'], security: [{ AdminBearerAuth: [] }], summary: 'Platform-wide KPIs and analytics', responses: { 200: { description: 'KPIs' } } } },
      '/superadmin/leads': { post: { tags: ['Super Admin Leads'], security: [{ AdminBearerAuth: [] }], summary: 'Create and publish buyer requirements', responses: { 201: { description: 'Created' } } } },
      '/superadmin/pricing': { put: { tags: ['Super Admin Pricing'], security: [{ AdminBearerAuth: [] }], summary: 'Update configurable claim-point pricing rules', responses: { 200: { description: 'Updated' } } } },
      '/superadmin/refunds/{refundId}/approve': { post: { tags: ['Super Admin Refunds'], security: [{ AdminBearerAuth: [] }], summary: 'Approve refund once, credit 95% points, resolve lead outcome', responses: { 200: { description: 'Approved & credited' } } } },
      '/superadmin/audit-logs': { get: { tags: ['Super Admin Audit'], security: [{ AdminBearerAuth: [] }], summary: 'Query immutable administrative audit logs', responses: { 200: { description: 'Audit logs' } } } },
    },
  };
}

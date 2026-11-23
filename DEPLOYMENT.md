# BUYIN Production Deployment Guide

All four BUYIN applications are independently deployable using environment variables alone — **zero source-code edits** are required to switch from localhost to production domains.

## Recommended Production Domains
- Brand Website (`frontend/`): `https://www.your-domain.com`
- User Dashboard (`dashboard/`): `https://app.your-domain.com`
- Super Admin (`superadmin/`): `https://admin.your-domain.com`
- Backend API (`backend/`): `https://api.your-domain.com`

## Routing & Hosting Strategy (Without Nginx)
Do **not** deploy Nginx as an application load balancer or introduce a fifth routing app. Instead:
- Deploy `frontend/` (Next.js) on a managed Next.js host (e.g., Vercel, AWS Amplify, or Cloud Run) with HTTPS/TLS termination and optional `next.config.mjs` rewrites if consolidating public routes.
- Deploy `dashboard/` and `superadmin/` as static Vite builds (`dist/`) on separate subdomains via managed CDN/Edge hosting (Cloudflare Pages, Vercel, or Netlify) with SPA fallback (`index.html`).
- Deploy `backend/` on a managed Node.js runtime (Render, Railway, Fly.io, AWS ECS/App Runner, or Cloud Run) with managed TLS and autoscaling, plus a separate worker process (`npm run worker`) connected to managed Redis for BullMQ background jobs.

## External Service Setup
1. **MongoDB Atlas**: Create a replica-set cluster (M0/M10+), enable IP allowlist / VPC peering, and set `MONGODB_URI`.
2. **Razorpay**:
   - Start in **Test Mode** (`rzp_test_...`).
   - Configure Webhook URL: `https://api.your-domain.com/api/v1/user/recharge/webhook`.
   - Subscribe to events: `payment.captured`, `order.paid`, `payment.failed`.
   - Set `RAZORPAY_WEBHOOK_SECRET` in `backend/.env`.
3. **Cloudinary**: Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Verification documents and refund evidence are uploaded with `type: 'authenticated'` and accessed only via short-lived signed URLs.
4. **Fast2SMS**: Set `FAST2SMS_API_KEY` and `FAST2SMS_SENDER_ID` (complete DLT template approval for production Indian SMS delivery).

## Production Deployment Checklist
- [ ] `NODE_ENV=production` and `COOKIE_SECURE=true` set on `backend/`.
- [ ] Distinct, random 64-char secrets for `JWT_SECRET`, `ADMIN_JWT_SECRET`, `USER_SESSION_SECRET`, and `ADMIN_SESSION_SECRET`.
- [ ] `CLIENT_URL`, `FRONTEND_URL`, `DASHBOARD_URL`, `SUPERADMIN_URL` match exact HTTPS origins for strict CORS allowlist.
- [ ] Initial Super Admin logged in, changed default password, and enrolled TOTP MFA (`/api/v1/superadmin/auth/mfa/enroll`).
- [ ] Health check `GET https://api.your-domain.com/api/v1/health` returns HTTP `200` with `database: "connected"`.
- [ ] End-to-end Razorpay test payment + webhook delivery verified before switching to live keys.
- [ ] Admin recovery process: if Super Admin loses MFA or password, connect directly to MongoDB Atlas via an audited DBA session to set `mfaEnabled: false` or `isBootstrapAdmin: false` to re-run controlled bootstrap.

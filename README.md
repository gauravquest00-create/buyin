# BUYIN — Real Estate Buyer Requirement & Lead Network

BUYIN is a centralized, production-grade real-estate buyer requirement and lead-sharing platform architected as **four independent applications** backed by **one centralized Express.js + MongoDB Atlas API**.

## System Architecture (4 Independent Applications)

| Application | Folder | Tech Stack | Local Port | Production Example |
| :--- | :--- | :--- | :--- | :--- |
| **Public Brand Website** | `frontend/` | Next.js 14, React, Vanilla CSS / CSS Modules | `3000` | `https://www.your-domain.com` |
| **User Dashboard** | `dashboard/` | React 18, Vite, Vanilla CSS | `3001` | `https://app.your-domain.com` |
| **Super Admin Console** | `superadmin/` | React 18, Vite, Vanilla CSS | `3002` | `https://admin.your-domain.com` |
| **Centralized Backend API** | `backend/` | Node.js (ESM), Express, Mongoose, Zod, Razorpay, Fast2SMS, Cloudinary, BullMQ | `5000` | `https://api.your-domain.com` |

## Key Platform Capabilities
- **Strict User vs. Super Admin Separation**: Distinct API prefixes (`/api/v1/user/*` vs `/api/v1/superadmin/*`), distinct JWT signing secrets & audiences, separate session collections (`user_sessions` vs `admin_sessions`), HTTP-only cookies + CSRF double-submit verification, Argon2id password hashing, TOTP RFC 6238 MFA for Super Admin, and granular RBAC permissions.
- **Atomic Single-Owner Lead Claiming**: MongoDB multi-document transactions + conditional updates + partial unique index on `claims({ leadId })` guarantee only one active owner per requirement.
- **20-Day Ownership + 7-Day Extension**: 20-day default ownership, extendable once by 7 days at 25% of original claim points with duplicate-charge protection.
- **Configurable Pricing Engine**: Budget band base points + property type additions + buyer signals + site visit premiums + admin-approved returned-lead discounts. Every claim stores an immutable pricing snapshot.
- **Razorpay Wallet Recharge**: Server-side order creation, Checkout signature verification, raw-body HMAC-SHA256 webhook verification, idempotent wallet credits, and immutable ledger (`wallet_transactions`).
- **95% Refund System**: Places claimed lead in protective `REVIEW_HOLD`, deducts 5%, credits 95% (rounded to nearest whole point) exactly once upon admin approval, and routes lead to `LEAD_BIN`, `RETURN_TO_POOL`, or `PERMANENTLY_CLOSE`.
- **Automated Background Jobs**: BullMQ + Redis (with in-process fallback when `REDIS_URL` is omitted in dev) for 20-day claim expiry, eligible lead pool return, follow-up reminders, and payment reconciliation.

## Prerequisites
- **Node.js** `>= 18.18.0` (Node 20 LTS recommended)
- **MongoDB Atlas** (or local MongoDB replica set for full multi-document transactions)
- **Redis** (optional in dev; recommended for BullMQ in production)
- Accounts/keys for **Razorpay** (test mode first), **Fast2SMS**, and **Cloudinary**

## Quick Installation

### Windows (`cmd.exe`)
```cmd
scripts\install-all.bat
```

### Linux / macOS
```bash
chmod +x scripts/*.sh
./scripts/install-all.sh
```

## Environment Configuration
Copy each `.env.example` file and fill in your credentials (never commit `.env` files):
1. `backend/.env.example` → `backend/.env`
2. `dashboard/.env.example` → `dashboard/.env`
3. `superadmin/.env.example` → `superadmin/.env`
4. `frontend/.env.example` → `frontend/.env.local`

> **Important**: `JWT_SECRET` and `ADMIN_JWT_SECRET` in `backend/.env` **must be different** (minimum 32 characters in production). Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to bootstrap your initial Super Admin automatically on first backend startup.

## Local Startup

### 1. Optional Sample Data Seed (cities + sample buyer requirements)
```bash
cd backend && npm run seed
```

### 2. Start All 4 Applications Independently
- **Windows**: `scripts\dev-all.bat`
- **Linux / macOS**: `./scripts/dev-all.sh`
- **Manual** (4 terminals):
  - `cd backend && npm run dev` → `http://localhost:5000/api/v1/health` & Swagger at `http://localhost:5000/api/v1/docs`
  - `cd frontend && npm run dev` → `http://localhost:3000`
  - `cd dashboard && npm run dev` → `http://localhost:3001`
  - `cd superadmin && npm run dev` → `http://localhost:3002`

## Testing
```bash
cd backend
npm run lint:syntax   # Validates ES Module syntax across all backend JS files
npm test              # Runs pure business-logic, pricing, refund, HMAC, OTP, MFA, RBAC tests
npm run test:e2e      # Runs full HTTP + MongoDB E2E test suite (requires MONGODB_URI)
```

## Production Build
- **Windows**: `scripts\build-all.bat`
- **Linux / macOS**: `./scripts/build-all.sh`

See `DEPLOYMENT.md`, `DATABASE.md`, and `API_DOCS.md` for full operational and deployment documentation.

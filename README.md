# BUYIN - Real Estate Buyer Requirement & Lead Network

BUYIN is a controlled real-estate buyer requirement network built for verified real-estate professionals. Unlike traditional property listing portals or shared lead marketplaces, BUYIN enforces atomic single-owner claiming, masked pre-claim buyer privacy, transparent point-based wallet billing, and fair admin-reviewed refund protection.

---

## Architecture Overview

BUYIN is structured as a modular monorepo containing four independent applications backed by a centralized REST API:

| Application | Folder | Description |
| :--- | :--- | :--- |
| **Backend API** | `backend/` | Centralized Node.js + Express + MongoDB API serving public, user, and isolated admin namespaces |
| **Public Website** | `frontend/` | Next.js App Router marketing and onboarding website (12 SEO-ready pages, zero admin links) |
| **User Dashboard** | `dashboard/` | React + Vite workspace for verified real-estate professionals (Lead Pool, My Leads CRM, Wallet, Support) |
| **Super Admin Console** | `superadmin/` | Isolated React + Vite administrative console for verifications, lead pool control, pricing, refunds, and audits |

---

## Core Platform Features

### Exclusive Buyer Requirement Claiming
- **Single Active Owner:** Atomic database transactions and unique active-claim locking ensure only one verified professional owns a buyer requirement at any time.
- **Masked Pre-Claim Privacy:** Buyer name, mobile number, and email remain masked in the Lead Pool until a claim is confirmed.
- **20-Day Ownership + 7-Day Extension:** Every claimed requirement grants 20 days of exclusive access, with an optional one-time +7-day extension at 25% of the original claim points.
- **Lifecycle Hygiene:** Unclosed expired requirements return cleanly to the pool while preserving status history, follow-ups, and site-visit logs. Closed deals archive permanently with zero brokerage split.

### Transparent Wallet & Refund Protection
- **Pay-As-You-Go Points:** Preset recharge packages with optional bonus tiers plus custom recharge support via Razorpay Checkout and server-side webhook verification.
- **Upfront Balance Previews:** Professionals see their exact current balance, deduction, and expected remaining balance before confirming any claim or extension.
- **95% Invalid-Lead Refund Shield:** Evidence-backed refund requests place claims on `REVIEW_HOLD` (pausing expiry) and credit 95% of original claim points (5% platform deduction) upon admin approval.
- **Immutable Ledger:** Every credit, debit, bonus, and refund is logged permanently and exportable to CSV.

### Security & Governance
- **Strict Role Isolation:** Separate authentication middleware, JWT secrets, audiences, and session stores for Users and Super Admins.
- **Account Protection:** Strong password hashing, HTTP-only cookies, CSRF protection, active session management, and TOTP MFA support for administrators.
- **Private Document Storage:** KYC documents and refund evidence are stored in private authenticated cloud storage and never exposed via open public URLs.

---

## Tech Stack

- **Backend:** Node.js (ES Modules), Express.js, MongoDB & Mongoose, Zod Validation, Razorpay, Cloudinary, Fast2SMS, OpenAPI/Swagger
- **Public Website:** Next.js 14 (App Router), React 18, Vanilla CSS & CSS Modules
- **User Dashboard & Super Admin:** React 18, Vite, React Router, Lucide Icons, Vanilla CSS

---

## Repository Structure

```text
BUYIN/
├── backend/          # Express API, MongoDB models, business logic, background jobs, tests
├── frontend/         # Next.js public brand & onboarding website
├── dashboard/        # React + Vite authenticated professional dashboard
├── superadmin/       # React + Vite isolated super admin console
├── .gitignore        # Root ignore rules (excludes .env, node_modules, build artifacts)
└── README.md

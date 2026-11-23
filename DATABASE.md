# BUYIN Database Architecture (MongoDB Atlas + Mongoose)

Centralized single MongoDB database with 25 collections, strict indexing, partial unique constraints, and immutable financial/audit ledgers.

## Collections Overview
1. `users` — Real-estate professionals, verification status, working locations, preferences, lockout counters.
2. `admins` — Platform administrators, role references, MFA secrets, bootstrap flag.
3. `user_sessions` — Isolated user JWT sessions with TTL auto-expiry and revocation timestamps.
4. `admin_sessions` — Isolated admin JWT sessions with `mfaVerified` flag and TTL auto-expiry.
5. `otp_records` — HMAC-SHA256 hashed OTP codes with TTL auto-expiry, attempt counters, and resend limits.
6. `leads` — Buyer requirements (private buyer PII + public discovery metadata + computed claim points + pricing snapshot).
7. `claims` — Exclusive ownership records with **partial unique index `{ leadId: 1 }` on active/extended/refund-held statuses** enforcing 1 active owner per lead.
8. `lead_status_history` — Timestamped status transitions (`Claimed` → `Closed` / `Lost` / `Cancelled`).
9. `site_visits` — Scheduled/completed site visits with admin verification flag.
10. `follow_ups` — Buyer follow-up logs and reminder timestamps.
11. `wallets` — User claim-point balances and aggregate totals.
12. `wallet_transactions` — **Strictly immutable** financial ledger with unique `idempotencyKey`.
13. `recharge_packages` — Configurable wallet recharge tiers (`₹500`, `₹1,000`, `₹2,000 + bonus`).
14. `payments` — Razorpay orders, payment IDs, verification flags, and wallet credit flags.
15. `payment_events` — Idempotent Razorpay webhook event store (`unique eventId`).
16. `refund_requests` — 5% deduction / 95% credit refund workflow with evidence files and lead outcome.
17. `verification_records` — Professional KYC snapshots and private Cloudinary document references.
18. `pricing_rules` — Versioned claim-point pricing configuration (base tiers, property types, signals, visits, returned-lead discounts).
19. `support_tickets` — User/Admin support threads with private attachments.
20. `notifications` — User & Admin in-app notifications.
21. `categories` — Master data for cities, locations, property types, and configurations.
22. `roles` — RBAC role definitions.
23. `permissions` — Granular `module:action` permission catalog.
24. `system_settings` — Runtime platform controls and emergency switches.
25. `audit_logs` — **Strictly immutable** administrative audit trail.

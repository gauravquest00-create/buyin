# BUYIN REST API Documentation

Interactive Swagger / OpenAPI 3.0.3 documentation is served live by the backend at:
- UI: `GET /api/v1/docs`
- JSON Spec: `GET /api/v1/docs.json`

## Standard Response Envelope
**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```
**Error:**
```json
{
  "success": false,
  "message": "A meaningful error message",
  "code": "RESOURCE_NOT_AVAILABLE"
}
```

## Domain Isolation
- **User API**: `/api/v1/user/*` — Authenticated via `JWT_SECRET` (`audience: buyin:user`, cookie `buyin_user_session`).
- **Super Admin API**: `/api/v1/superadmin/*` — Authenticated via `ADMIN_JWT_SECRET` (`audience: buyin:admin`, cookie `buyin_admin_session`) + TOTP MFA + RBAC permissions.
- **Webhook**: `POST /api/v1/user/recharge/webhook` — Uses raw `Buffer` body parsing BEFORE global JSON parsing for `X-Razorpay-Signature` HMAC-SHA256 verification.

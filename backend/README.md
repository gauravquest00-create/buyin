# BUYIN Backend API

Centralized Express.js + MongoDB Atlas (Mongoose) + ES Modules backend powering BUYIN's Public Brand Website, User Dashboard, and Super Admin application.

## Ports & Prefixes
- Default Port: `5000`
- User API: `/api/v1/user/*`
- Super Admin API: `/api/v1/superadmin/*`
- Health Check: `/api/v1/health`
- Swagger / OpenAPI: `/api/v1/docs`

## Setup & Commands
```bash
cp .env.example .env
# Fill in MongoDB URI, distinct JWT_SECRET & ADMIN_JWT_SECRET, Razorpay, Fast2SMS, Cloudinary keys
npm install
npm run seed      # Optional: seeds sample cities and buyer requirements
npm run dev       # Starts API server with --watch
npm test          # Runs business logic & security unit tests
npm run lint:syntax
```

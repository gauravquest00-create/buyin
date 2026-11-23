const rawApiBase = import.meta.env.VITE_API_BASE_URL;
if (!rawApiBase) {
  throw new Error('Missing VITE_API_BASE_URL environment variable. Configure dashboard/.env from .env.example.');
}

export const APP_CONFIG = Object.freeze({
  apiBaseUrl: rawApiBase.replace(/\/$/, ''),
  userApiBaseUrl: `${rawApiBase.replace(/\/$/, '')}/user`,
  appUrl: (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, ''),
  frontendUrl: (import.meta.env.VITE_FRONTEND_URL || '').replace(/\/$/, ''),
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  requestTimeoutMs: 20000,
});

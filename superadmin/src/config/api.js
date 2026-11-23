const rawApiBase = import.meta.env.VITE_API_BASE_URL;
if (!rawApiBase) {
  throw new Error('Missing VITE_API_BASE_URL environment variable. Configure superadmin/.env from .env.example.');
}

export const ADMIN_CONFIG = Object.freeze({
  apiBaseUrl: rawApiBase.replace(/\/$/, ''),
  adminApiBaseUrl: `${rawApiBase.replace(/\/$/, '')}/superadmin`,
  appUrl: (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, ''),
  requestTimeoutMs: 20000,
});

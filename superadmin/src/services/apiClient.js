import { ADMIN_CONFIG } from '../config/api.js';

const ADMIN_TOKEN_KEY = 'buyin_superadmin_access_token';
export const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (t) => (t ? sessionStorage.setItem(ADMIN_TOKEN_KEY, t) : sessionStorage.removeItem(ADMIN_TOKEN_KEY));

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2]) : null;
}

let onUnauthorized = null;
export const registerAdminUnauthorized = (fn) => { onUnauthorized = fn; };

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`${ADMIN_CONFIG.adminApiBaseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const headers = { 'Content-Type': 'application/json' };
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const csrf = readCookie('buyin_admin_csrf');
  if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = csrf;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ADMIN_CONFIG.requestTimeoutMs);
  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && onUnauthorized) {
        setAdminToken(null);
        onUnauthorized();
      }
      throw new Error(json.message || `Admin API error (${res.status})`);
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export const adminApi = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
};

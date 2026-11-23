import { APP_CONFIG } from '../config/api.js';

const TOKEN_STORAGE_KEY = 'buyin_user_access_token';

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  else sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let onUnauthorizedCallback = null;
export function registerUnauthorizedHandler(fn) {
  onUnauthorizedCallback = fn;
}

async function request(path, { method = 'GET', body, params, isFormData = false, headers = {}, retries = 1 } = {}) {
  const url = new URL(`${APP_CONFIG.userApiBaseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }

  const reqHeaders = { ...headers };
  if (!isFormData) reqHeaders['Content-Type'] = 'application/json';

  const token = getStoredToken();
  if (token) reqHeaders.Authorization = `Bearer ${token}`;

  const csrf = readCookie('buyin_user_csrf');
  if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    reqHeaders['X-CSRF-Token'] = csrf;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APP_CONFIG.requestTimeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: reqHeaders,
      credentials: 'include',
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && onUnauthorizedCallback) {
        setStoredToken(null);
        onUnauthorizedCallback();
      }
      throw new ApiError(
        json.message || `Request failed (${response.status})`,
        response.status,
        json.code || 'REQUEST_FAILED',
        json.details
      );
    }
    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.', 408, 'TIMEOUT');
    }
    const isSafeRetry = method.toUpperCase() === 'GET' && retries > 0 && (!err.status || err.status >= 500);
    if (isSafeRetry) {
      return request(path, { method, body, params, isFormData, headers, retries: retries - 1 });
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body, ...opts }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

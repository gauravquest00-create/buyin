export const SITE_CONFIG = Object.freeze({
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, ''),
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
  dashboardUrl: (process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001').replace(/\/$/, ''),
});

export function getDashboardLoginUrl() {
  return `${SITE_CONFIG.dashboardUrl}/login`;
}

export function getDashboardRegisterUrl() {
  return `${SITE_CONFIG.dashboardUrl}/register`;
}

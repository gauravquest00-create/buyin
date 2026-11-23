import { SITE_CONFIG } from '../config/api.js';

export async function fetchPublicRechargePackages() {
  try {
    const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/user/recharge/packages`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.packages || null;
  } catch {
    return null;
  }
}

export async function submitContactInquiry(payload) {
  const res = await fetch(`${SITE_CONFIG.apiBaseUrl}/public/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Unable to submit inquiry');
  return json;
}

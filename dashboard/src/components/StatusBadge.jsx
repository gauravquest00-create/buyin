import React from 'react';

export function StatusBadge({ status }) {
  const s = String(status || '').toUpperCase();
  let cls = 'badge-gray';
  if (['APPROVED', 'ACTIVE', 'CAPTURED', 'CREDITED', 'CLOSED', 'COMPLETED'].includes(s)) cls = 'badge-green';
  else if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'EXTENDED', 'FOLLOW-UP', 'NEGOTIATION', 'REFUND_HOLD'].includes(s)) cls = 'badge-amber';
  else if (['REJECTED', 'SUSPENDED', 'FAILED', 'EXPIRED', 'REVOKED', 'LOST', 'CANCELLED'].includes(s)) cls = 'badge-red';
  else if (['CLAIMED', 'CONTACTED', 'INTERESTED', 'AVAILABLE'].includes(s)) cls = 'badge-blue';
  return <span className={`badge ${cls}`}>{status}</span>;
}

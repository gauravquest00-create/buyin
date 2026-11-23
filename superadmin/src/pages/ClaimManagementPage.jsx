import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound, CheckCircle2, ShieldAlert, Clock, XCircle,
  RefreshCw, ArrowUpRight, ExternalLink, Ban,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const CLAIM_STATUSES = ['ACTIVE', 'EXTENDED', 'REFUND_HOLD', 'CLOSED', 'EXPIRED', 'REFUNDED', 'REVOKED'];

function claimBadgeClass(status) {
  if (status === 'ACTIVE' || status === 'EXTENDED') return 'badge-blue';
  if (status === 'CLOSED') return 'badge-green';
  if (status === 'REFUND_HOLD') return 'badge-amber';
  if (['EXPIRED', 'REVOKED', 'REFUNDED'].includes(status)) return 'badge-red';
  return 'badge-gray';
}

function daysRemaining(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ClaimManagementPage() {
  const { showToast } = useToast();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Revoke Modal state
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [returnToPool, setReturnToPool] = useState(true);
  const [revoking, setRevoking] = useState(false);

  const loadClaims = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/claims', statusFilter ? { status: statusFilter } : {});
      setClaims(res.data.claims || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadClaims(false);
  }, [loadClaims]);

  const submitRevoke = async (e) => {
    e.preventDefault();
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await adminApi.post(`/claims/${revokeTarget._id}/revoke`, {
        reason: revokeReason.trim(),
        returnLeadToPool: returnToPool,
      });
      showToast('Claim ownership revoked and audit log recorded');
      setRevokeTarget(null);
      setRevokeReason('');
      setReturnToPool(true);
      loadClaims(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRevoking(false);
    }
  };

  const filtered = claims.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [
      c.claimCode,
      c.leadId?.leadCode,
      c.leadId?.title,
      c.leadId?.city,
      c.userId?.fullName,
      c.userId?.email,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const activeCount = claims.filter((c) => ['ACTIVE', 'EXTENDED'].includes(c.status)).length;
  const holdCount = claims.filter((c) => c.status === 'REFUND_HOLD').length;
  const closedCount = claims.filter((c) => c.status === 'CLOSED').length;
  const endedCount = claims.filter((c) => ['EXPIRED', 'REVOKED', 'REFUNDED'].includes(c.status)).length;

  const KPI_CARDS = [
    { label: 'Total Claims', value: claims.length, hint: 'Show all', icon: KeyRound, tone: 'navy', onClick: () => setStatusFilter('') },
    { label: 'Active Ownerships', value: activeCount, hint: 'Filter active', icon: Clock, tone: 'blue', onClick: () => setStatusFilter('ACTIVE') },
    { label: 'Refund Hold', value: holdCount, hint: 'Filter review hold', icon: ShieldAlert, tone: 'amber', onClick: () => setStatusFilter('REFUND_HOLD') },
    { label: 'Closed Deals', value: closedCount, hint: 'Filter closed', icon: CheckCircle2, tone: 'green', onClick: () => setStatusFilter('CLOSED') },
    { label: 'Expired / Revoked', value: endedCount, hint: 'Filter expired', icon: XCircle, tone: 'red', onClick: () => setStatusFilter('EXPIRED') },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Claim & Ownership Management</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Investigate 20-day lead ownerships, 7-day extensions, refund holds, or manually revoke ownership with full audit tracking.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadClaims(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Clickable Filter KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, icon: Icon, tone, onClick }, idx) => (
          <div key={label} onClick={onClick} className="dash-kpi-card" style={{ animationDelay: `${idx * 40}ms` }}>
            <div className="dash-kpi-top">
              <span className={`dash-kpi-icon ${tone}`}><Icon size={16} /></span>
              <ArrowUpRight size={15} className="dash-kpi-arrow" />
            </div>
            <div className="dash-kpi-value">{value}</div>
            <div className="dash-kpi-label">{label}</div>
            <div className="dash-kpi-hint">{hint} →</div>
          </div>
        ))}
      </div>

      {/* Search & Status Filter */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 240px' }}
          placeholder="Search claim code, lead code/title, professional name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ flex: '1 1 180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Claim Statuses</option>
          {CLAIM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Claims Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Buyer Requirement</th>
                <th>Owner</th>
                <th>Points</th>
                <th>Ownership Window</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No claims match these filters.</td></tr>
              ) : (
                filtered.map((c) => {
                  const isLive = ['ACTIVE', 'EXTENDED'].includes(c.status);
                  const daysLeft = daysRemaining(c.expiresAt);
                  return (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.claimCode}</strong>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(c.claimedAt || c.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td>
                        {c.leadId ? (
                          <Link to={`/leads/${c.leadId._id}`} style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {c.leadId.leadCode} <ExternalLink size={11} />
                          </Link>
                        ) : '-'}
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.leadId?.title}</div>
                      </td>
                      <td>
                        {c.userId ? (
                          <Link to={`/users/${c.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {c.userId.fullName}
                          </Link>
                        ) : '-'}
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.userId?.email}</div>
                      </td>
                      <td>
                        <strong>{c.originalClaimPoints} pts</strong>
                        {c.extensionCount > 0 && (
                          <div style={{ fontSize: 11, color: '#047857' }}>+{c.extensionPointsPaid} pts ext</div>
                        )}
                      </td>
                      <td>
                        <div>{new Date(c.expiresAt).toLocaleDateString()}</div>
                        {isLive && (
                          <div style={{ fontSize: 11, color: daysLeft <= 3 ? 'var(--danger)' : 'var(--muted)' }}>
                            {daysLeft} days left
                          </div>
                        )}
                      </td>
                      <td><span className={`badge ${claimBadgeClass(c.status)}`}>{c.status}</span></td>
                      <td>
                        {isLive ? (
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => setRevokeTarget(c)}
                          >
                            <Ban size={12} /> Revoke
                          </button>
                        ) : (
                          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.revocationReason ? 'Revoked' : 'Finalized'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Revoke Ownership Modal */}
      {revokeTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
          }}
          onClick={() => setRevokeTarget(null)}
        >
          <form className="card" style={{ width: '100%', maxWidth: 460, padding: 20 }} onClick={(e) => e.stopPropagation()} onSubmit={submitRevoke}>
            <div className="header-row" style={{ marginBottom: 12 }}>
              <h3>Revoke Ownership — {revokeTarget.claimCode}</h3>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setRevokeTarget(null)}>Close</button>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
              Owner: <strong>{revokeTarget.userId?.fullName}</strong> • Lead: <strong>{revokeTarget.leadId?.leadCode}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Mandatory Audit Reason</label>
              <textarea
                className="textarea"
                rows={3}
                required
                minLength={5}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Explain why ownership is being manually revoked..."
              />
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={returnToPool} onChange={(e) => setReturnToPool(e.target.checked)} />
              <span>Return lead back to the shared BUYIN pool (uncheck to archive)</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setRevokeTarget(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" type="submit" disabled={revoking}>
                {revoking ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
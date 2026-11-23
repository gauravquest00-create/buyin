import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Wallet, KeyRound, CreditCard, RotateCcw, LogOut, RefreshCw, PlusCircle,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const USER_STATUSES = ['ACTIVE', 'PENDING_VERIFICATION', 'RESTRICTED', 'SUSPENDED'];

export function UserDetailPage() {
  const { userId } = useParams();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adj, setAdj] = useState({ direction: 'CREDIT', points: 100, reason: '' });
  const [submittingAdj, setSubmittingAdj] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/users/${userId}`);
      setData(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleStatusChange = async (status) => {
    const reason = window.prompt(`Reason for changing account status to ${status}:`, 'Administrative action');
    if (!reason) return;
    try {
      await adminApi.patch(`/users/${userId}/status`, { status, reason });
      showToast(`User status updated to ${status}`);
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleForceLogout = async () => {
    if (!window.confirm('Revoke all active login sessions for this user?')) return;
    try {
      const res = await adminApi.post(`/users/${userId}/revoke-sessions`);
      showToast(`Revoked ${res.data.revokedCount} active session(s)`);
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleWalletAdjust = async (e) => {
    e.preventDefault();
    setSubmittingAdj(true);
    try {
      await adminApi.post('/wallets/adjust', {
        userId,
        direction: adj.direction,
        points: Number(adj.points),
        reason: adj.reason,
      });
      showToast(`Wallet ${adj.direction.toLowerCase()}ed via immutable ledger`);
      setAdj({ direction: 'CREDIT', points: 100, reason: '' });
      loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingAdj(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="dash-wrap">
        <div className="dash-skeleton" style={{ height: 42, width: 280 }} />
        <div className="dash-kpi-grid">{[1, 2, 3, 4].map((i) => <div key={i} className="dash-skeleton" style={{ height: 92 }} />)}</div>
        <div className="dash-skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  const { user, wallet, transactions, claims, payments, refunds, activeSessionsCount } = data;

  return (
    <div className="dash-wrap">
      {/* Header */}
      <div className="header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/users" className="btn btn-secondary btn-sm"><ArrowLeft size={14} /> Back</Link>
          <div>
            <h1>{user.fullName}</h1>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              {user.email} • {user.mobile} • Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="select"
            style={{ width: 'auto', padding: '6px 10px' }}
            value={user.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-danger btn-sm" type="button" onClick={handleForceLogout}>
            <LogOut size={13} /> Force Logout ({activeSessionsCount})
          </button>
          <button className="btn btn-secondary btn-sm" type="button" onClick={loadDetail}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon blue"><Wallet size={16} /></span></div>
          <div className="dash-kpi-value">{(wallet.balancePoints ?? 0).toLocaleString()} pts</div>
          <div className="dash-kpi-label">Wallet Balance</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon green"><CreditCard size={16} /></span></div>
          <div className="dash-kpi-value">{(wallet.totalRechargedPoints ?? 0).toLocaleString()} pts</div>
          <div className="dash-kpi-label">Total Recharged (+{wallet.totalBonusPoints ?? 0} bonus)</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon amber"><KeyRound size={16} /></span></div>
          <div className="dash-kpi-value">{claims.length}</div>
          <div className="dash-kpi-label">Claimed Leads ({(wallet.totalSpentPoints ?? 0).toLocaleString()} pts spent)</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon red"><RotateCcw size={16} /></span></div>
          <div className="dash-kpi-value">{refunds.length}</div>
          <div className="dash-kpi-label">Refund Requests ({(wallet.totalRefundedPoints ?? 0).toLocaleString()} pts)</div>
        </div>
      </div>

      {/* Profile Info + Manual Wallet Adjustment */}
      <div className="grid-2">
        <div className="card">
          <div className="header-row" style={{ marginBottom: 10 }}>
            <h3>Professional Profile</h3>
            <span className={`badge ${user.verificationStatus === 'APPROVED' ? 'badge-green' : 'badge-amber'}`}>
              KYC: {user.verificationStatus}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
            <div><strong>Role:</strong> {user.professionalRole || '-'}</div>
            <div><strong>Agency:</strong> {user.agencyName || '-'}</div>
            <div><strong>Experience:</strong> {user.experienceYears ?? 0} yrs</div>
            <div><strong>City:</strong> {user.city || '-'}</div>
            <div><strong>RERA No:</strong> {user.reraNumber || 'N/A'}</div>
            <div><strong>Mobile Verified:</strong> {user.mobileVerified ? 'Yes' : 'No'}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Working Locations:</strong> {(user.workingLocations || []).join(', ') || '-'}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Languages:</strong> {(user.languages || []).join(', ') || '-'}</div>
            {user.suspensionReason && (
              <div style={{ gridColumn: '1 / -1', color: 'var(--danger)' }}><strong>Suspension Reason:</strong> {user.suspensionReason}</div>
            )}
          </div>
        </div>

        <form className="card" onSubmit={handleWalletAdjust}>
          <h3 style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={15} /> Quick Wallet Adjustment (Immutable Ledger)
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Direction</label>
              <select className="select" value={adj.direction} onChange={(e) => setAdj({ ...adj, direction: e.target.value })}>
                <option value="CREDIT">Credit (+)</option>
                <option value="DEBIT">Debit (-)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Points</label>
              <input className="input" type="number" min={1} required value={adj.points} onChange={(e) => setAdj({ ...adj, points: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mandatory Audit Reason</label>
            <input className="input" required minLength={5} placeholder="e.g. Goodwill credit / manual reconciliation" value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={submittingAdj}>
            {submittingAdj ? 'Applying...' : `Apply ${adj.direction}`}
          </button>
        </form>
      </div>

      {/* Claims & Wallet Ledger */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Claim History ({claims.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 420 }}>
              <thead><tr><th>Claim</th><th>Lead</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No claims yet.</td></tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.claimCode}</strong></td>
                      <td>
                        {c.leadId ? (
                          <Link to={`/leads/${c.leadId._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {c.leadId.leadCode} — {c.leadId.title}
                          </Link>
                        ) : '-'}
                      </td>
                      <td>{c.originalClaimPoints} pts</td>
                      <td><span className="badge badge-blue">{c.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Recent Wallet Ledger ({transactions.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 420 }}>
              <thead><tr><th>Type</th><th>Points</th><th>After</th><th>Reason</th></tr></thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No transactions yet.</td></tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id}>
                      <td><span className="badge badge-gray">{t.type}</span></td>
                      <td style={{ fontWeight: 700, color: t.direction === 'CREDIT' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.direction === 'CREDIT' ? '+' : '-'}{t.points}
                      </td>
                      <td><strong>{t.balanceAfter}</strong></td>
                      <td>{t.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payments & Refunds */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Razorpay Payments ({payments.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 400 }}>
              <thead><tr><th>Txn ID</th><th>Amount</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No payments yet.</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.internalTransactionId}</strong></td>
                      <td>₹{p.amountInr}</td>
                      <td>{p.totalPoints} pts</td>
                      <td><span className="badge badge-green">{p.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Refund Requests ({refunds.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 400 }}>
              <thead><tr><th>Code</th><th>Lead</th><th>Refundable</th><th>Status</th></tr></thead>
              <tbody>
                {refunds.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No refund requests.</td></tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r._id}>
                      <td><strong>{r.refundCode}</strong></td>
                      <td>{r.leadId?.leadCode || '-'}</td>
                      <td>{r.refundablePoints} pts</td>
                      <td><span className="badge badge-amber">{r.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
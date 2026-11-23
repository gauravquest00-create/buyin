import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw, Clock, HelpCircle, CheckCircle2, XCircle,
  RefreshCw, ArrowUpRight, ExternalLink, FileText,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const REFUND_STATUSES = [
  'Submitted',
  'Under Review',
  'Additional Info Required',
  'Approved',
  'Credited',
  'Rejected',
];

function refundBadgeClass(status) {
  if (status === 'Credited' || status === 'Approved') return 'badge-green';
  if (status === 'Rejected') return 'badge-red';
  if (status === 'Additional Info Required') return 'badge-blue';
  return 'badge-amber';
}

export function RefundManagementPage() {
  const { showToast } = useToast();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Review Modal state
  const [selected, setSelected] = useState(null);
  const [leadOutcome, setLeadOutcome] = useState('LEAD_BIN');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRefunds = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/refunds', statusFilter ? { status: statusFilter } : {});
      setRefunds(res.data.refunds || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadRefunds(false);
  }, [loadRefunds]);

  const openReview = (r) => {
    setSelected(r);
    setAdminRemarks(r.adminRemarks || '');
    setLeadOutcome(r.leadOutcome || 'LEAD_BIN');
  };

  const handleAction = async (action) => {
    if (!selected) return;
    if ((action === 'reject' || action === 'request-info') && adminRemarks.trim().length < 5) {
      showToast('Please enter at least 5 characters of admin remarks.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (action === 'approve') {
        await adminApi.post(`/refunds/${selected._id}/approve`, {
          leadOutcome,
          adminRemarks: adminRemarks.trim() || `Approved (${leadOutcome})`,
        });
        showToast(`Refund approved! +${selected.refundablePoints} pts credited once via ledger.`);
      } else if (action === 'reject') {
        await adminApi.post(`/refunds/${selected._id}/reject`, {
          adminRemarks: adminRemarks.trim(),
        });
        showToast('Refund rejected and lead restored out of review hold.');
      } else if (action === 'request-info') {
        await adminApi.post(`/refunds/${selected._id}/request-info`, {
          adminRemarks: adminRemarks.trim(),
        });
        showToast('Additional information requested from user.');
      }
      setSelected(null);
      loadRefunds(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = refunds.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [
      r.refundCode,
      r.reason,
      r.description,
      r.leadId?.leadCode,
      r.leadId?.title,
      r.userId?.fullName,
      r.userId?.email,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const pendingCount = refunds.filter((r) => ['Submitted', 'Under Review'].includes(r.status)).length;
  const infoCount = refunds.filter((r) => r.status === 'Additional Info Required').length;
  const creditedList = refunds.filter((r) => ['Credited', 'Approved'].includes(r.status));
  const creditedPts = creditedList.reduce((s, r) => s + (r.refundablePoints || 0), 0);
  const rejectedCount = refunds.filter((r) => r.status === 'Rejected').length;

  const KPI_CARDS = [
    { label: 'Total Requests', value: refunds.length, hint: 'Show all', status: '', icon: RotateCcw, tone: 'navy' },
    { label: 'Pending Review', value: pendingCount, hint: 'Filter submitted', status: 'Submitted', icon: Clock, tone: 'amber' },
    { label: 'Info Requested', value: infoCount, hint: 'Filter awaiting user', status: 'Additional Info Required', icon: HelpCircle, tone: 'blue' },
    { label: 'Credited (95%)', value: `${creditedList.length} (${creditedPts} pts)`, hint: 'Filter credited', status: 'Credited', icon: CheckCircle2, tone: 'green' },
    { label: 'Rejected', value: rejectedCount, hint: 'Filter rejected', status: 'Rejected', icon: XCircle, tone: 'red' },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Refund & Dispute Management</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Review evidence for disputed leads, process 95% point refunds (5% deduction) exactly once, and resolve lead outcomes.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadRefunds(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Clickable Filter KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, status, icon: Icon, tone }, idx) => (
          <div
            key={label}
            onClick={() => setStatusFilter(status)}
            className="dash-kpi-card"
            style={{
              animationDelay: `${idx * 40}ms`,
              borderColor: statusFilter === status && status !== '' ? 'var(--primary)' : undefined,
            }}
          >
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

      {/* Search & Filter Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 240px' }}
          placeholder="Search refund code, lead code, user, or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ flex: '1 1 180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Refund Statuses</option>
          {REFUND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Refund</th>
                <th>User & Lead</th>
                <th>Reason</th>
                <th>5% / 95% Breakdown</th>
                <th>Evidence</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No refund requests found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.refundCode}</strong>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      {r.userId ? (
                        <Link to={`/users/${r.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          {r.userId.fullName}
                        </Link>
                      ) : '-'}
                      <div style={{ fontSize: 11.5 }}>
                        {r.leadId ? (
                          <Link to={`/leads/${r.leadId._id}`} style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            {r.leadId.leadCode} <ExternalLink size={10} />
                          </Link>
                        ) : '-'}
                      </div>
                    </td>
                    <td>
                      <strong>{r.reason}</strong>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>Orig: <strong>{r.originalClaimPoints}</strong> | -5%: {r.deductionPoints}</div>
                      <div style={{ color: '#047857', fontWeight: 700 }}>Credit: +{r.refundablePoints} pts</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(r.evidenceFiles || []).length === 0 ? (
                          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>None</span>
                        ) : (
                          r.evidenceFiles.map((f, i) =>
                            f.signedPreviewUrl ? (
                              <a key={i} href={f.signedPreviewUrl} target="_blank" rel="noreferrer" className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <FileText size={11} /> File {i + 1}
                              </a>
                            ) : (
                              <span key={i} className="badge badge-gray">{f.originalName || `File ${i + 1}`}</span>
                            )
                          )
                        )}
                      </div>
                    </td>
                    <td><span className={`badge ${refundBadgeClass(r.status)}`}>{r.status}</span></td>
                    <td>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => openReview(r)}>
                        {['Credited', 'Rejected'].includes(r.status) ? 'View' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Refund Review Modal */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header-row" style={{ marginBottom: 12 }}>
              <div>
                <h3>Refund Review — {selected.refundCode}</h3>
                <span className={`badge ${refundBadgeClass(selected.status)}`}>{selected.status}</span>
              </div>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelected(null)}>Close</button>
            </div>

            {/* Financial Transparency Box */}
            <div style={{ background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Original Claim Points</span><strong>{selected.originalClaimPoints} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Platform Deduction (5%)</span><strong style={{ color: 'var(--danger)' }}>-{selected.deductionPoints} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 5 }}>
                <span>Refund Credit to Wallet (95%)</span><strong style={{ color: 'var(--success)' }}>+{selected.refundablePoints} pts</strong>
              </div>
            </div>

            <div style={{ fontSize: 12.5, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><strong>Reason:</strong> {selected.reason}</div>
              <div><strong>User Explanation:</strong> {selected.description}</div>
              {selected.userAdditionalInfo && (
                <div style={{ background: '#EFF6FF', padding: 8, borderRadius: 6 }}>
                  <strong>User Follow-Up Info:</strong> {selected.userAdditionalInfo}
                </div>
              )}
            </div>

            {!['Credited', 'Rejected'].includes(selected.status) ? (
              <>
                <div className="form-group">
                  <label className="form-label">Lead Outcome on Approval</label>
                  <select className="select" value={leadOutcome} onChange={(e) => setLeadOutcome(e.target.value)}>
                    <option value="LEAD_BIN">Move to Lead Bin (Invalid / Fake / Duplicate)</option>
                    <option value="RETURN_TO_POOL">Return to Shared Pool (Still Valid Buyer)</option>
                    <option value="PERMANENTLY_CLOSE">Permanently Close (Purchased / Fulfilled)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Remarks</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Document review decision or specify additional proof needed..."
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                  <button className="btn btn-secondary btn-sm" type="button" disabled={submitting} onClick={() => handleAction('request-info')}>
                    Request Info
                  </button>
                  <button className="btn btn-danger btn-sm" type="button" disabled={submitting} onClick={() => handleAction('reject')}>
                    Reject
                  </button>
                  <button className="btn btn-success btn-sm" type="button" disabled={submitting} onClick={() => handleAction('approve')}>
                    Approve & Credit +{selected.refundablePoints} pts
                  </button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                <strong>Final Decision Remark:</strong> {selected.adminRemarks || '-'} {selected.leadOutcome ? `• Outcome: ${selected.leadOutcome}` : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
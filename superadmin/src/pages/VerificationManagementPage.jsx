import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, FileSearch, XCircle, Layers,
  RefreshCw, ArrowUpRight, FileText, ExternalLink,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const VERIFICATION_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'MORE_DOCS_REQUIRED',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
];

function statusBadgeClass(status) {
  if (status === 'APPROVED') return 'badge-green';
  if (['REJECTED', 'SUSPENDED'].includes(status)) return 'badge-red';
  if (['UNDER_REVIEW', 'MORE_DOCS_REQUIRED'].includes(status)) return 'badge-blue';
  return 'badge-amber';
}

export function VerificationManagementPage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Review Modal state
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/verifications', statusFilter ? { status: statusFilter } : {});
      setRecords(res.data.records || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadRecords(false);
  }, [loadRecords]);

  const openReviewModal = (rec) => {
    setSelected(rec);
    setRemarks(rec.adminRemarks || '');
  };

  const submitDecision = async (status) => {
    if (!selected) return;
    if (['REJECTED', 'MORE_DOCS_REQUIRED', 'SUSPENDED'].includes(status) && !remarks.trim()) {
      showToast('Please enter admin remarks for this decision.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.patch(`/verifications/${selected._id}/review`, {
        status,
        adminRemarks: remarks.trim() || `Verification marked as ${status}`,
      });
      showToast(`Verification updated to ${status}`);
      setSelected(null);
      setRemarks('');
      loadRecords(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const s = r.submittedSnapshot || {};
    return [s.fullName, s.email, s.mobile, s.city, s.agencyName, s.reraNumber]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const submittedCount = records.filter((r) => r.status === 'SUBMITTED').length;
  const reviewCount = records.filter((r) => ['UNDER_REVIEW', 'MORE_DOCS_REQUIRED'].includes(r.status)).length;
  const approvedCount = records.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = records.filter((r) => ['REJECTED', 'SUSPENDED'].includes(r.status)).length;

  const FILTER_CARDS = [
    { label: 'Total Submissions', value: records.length, hint: 'Show all', icon: Layers, tone: 'navy', onClick: () => setStatusFilter('') },
    { label: 'Awaiting Review', value: submittedCount, hint: 'Filter submitted', icon: Clock, tone: 'amber', onClick: () => setStatusFilter('SUBMITTED') },
    { label: 'Under Review / Docs', value: reviewCount, hint: 'Filter in review', icon: FileSearch, tone: 'blue', onClick: () => setStatusFilter('UNDER_REVIEW') },
    { label: 'Approved', value: approvedCount, hint: 'Filter approved', icon: ShieldCheck, tone: 'green', onClick: () => setStatusFilter('APPROVED') },
    { label: 'Rejected / Suspended', value: rejectedCount, hint: 'Filter rejected', icon: XCircle, tone: 'red', onClick: () => setStatusFilter('REJECTED') },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Professional Verification Queue</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Review submitted onboarding credentials, private KYC documents, and RERA details before unlocking lead claiming.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadRecords(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Clickable KPI Filter Cards */}
      <div className="dash-kpi-grid">
        {FILTER_CARDS.map(({ label, value, hint, icon: Icon, tone, onClick }, idx) => (
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
          placeholder="Search name, email, mobile, city, agency, or RERA number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ flex: '1 1 180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Verification Statuses</option>
          {VERIFICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                <th>Professional</th>
                <th>Role & Agency</th>
                <th>City & RERA</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No verification submissions found.</td></tr>
              ) : (
                filtered.map((r) => {
                  const snap = r.submittedSnapshot || {};
                  const uid = r.userId?._id || r.userId;
                  return (
                    <tr key={r._id}>
                      <td>
                        {uid ? (
                          <Link to={`/users/${uid}`} style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {snap.fullName || r.userId?.fullName} <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <strong>{snap.fullName}</strong>
                        )}
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{snap.email} • {snap.mobile}</div>
                      </td>
                      <td>
                        <div>{snap.professionalRole || '-'}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{snap.agencyName || 'Independent'} • {snap.experienceYears ?? 0} yrs</div>
                      </td>
                      <td>
                        <div>{snap.city || '-'}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>RERA: {snap.reraNumber || 'N/A'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(r.documents || []).length === 0 ? (
                            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>No files</span>
                          ) : (
                            r.documents.map((d, i) =>
                              d.signedPreviewUrl ? (
                                <a key={i} href={d.signedPreviewUrl} target="_blank" rel="noreferrer" className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <FileText size={11} /> Doc {i + 1}
                                </a>
                              ) : (
                                <span key={i} className="badge badge-gray">{d.originalName || `Doc ${i + 1}`}</span>
                              )
                            )
                          )}
                        </div>
                      </td>
                      <td><span className={`badge ${statusBadgeClass(r.status)}`}>{r.status}</span></td>
                      <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" type="button" onClick={() => openReviewModal(r)}>
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Review Modal */}
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
            style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header-row" style={{ marginBottom: 12 }}>
              <div>
                <h3>Review Verification — {selected.submittedSnapshot?.fullName}</h3>
                <p style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                  Current status: <span className={`badge ${statusBadgeClass(selected.status)}`}>{selected.status}</span>
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelected(null)}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5, background: 'var(--canvas)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
              <div><strong>Email:</strong> {selected.submittedSnapshot?.email}</div>
              <div><strong>Mobile:</strong> {selected.submittedSnapshot?.mobile}</div>
              <div><strong>Role:</strong> {selected.submittedSnapshot?.professionalRole}</div>
              <div><strong>Agency:</strong> {selected.submittedSnapshot?.agencyName || '-'}</div>
              <div><strong>Experience:</strong> {selected.submittedSnapshot?.experienceYears ?? 0} yrs</div>
              <div><strong>City:</strong> {selected.submittedSnapshot?.city}</div>
              <div><strong>RERA:</strong> {selected.submittedSnapshot?.reraNumber || 'N/A'}</div>
              <div><strong>Languages:</strong> {(selected.submittedSnapshot?.languages || []).join(', ') || '-'}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Working Locations:</strong> {(selected.submittedSnapshot?.workingLocations || []).join(', ') || '-'}
              </div>
            </div>

            {(selected.documents || []).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="form-label" style={{ marginBottom: 6 }}>Private Uploaded Documents (Signed 5-Min Links)</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selected.documents.map((d, i) =>
                    d.signedPreviewUrl ? (
                      <a key={i} href={d.signedPreviewUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        <FileText size={13} /> {d.originalName || `Document ${i + 1}`}
                      </a>
                    ) : (
                      <span key={i} className="badge badge-gray">{d.originalName}</span>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Admin Remarks (required for Reject / Request Docs / Suspend)</label>
              <textarea
                className="textarea"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter verification notes or list missing documents..."
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" type="button" disabled={submitting} onClick={() => submitDecision('UNDER_REVIEW')}>
                Under Review
              </button>
              <button className="btn btn-secondary btn-sm" type="button" disabled={submitting} onClick={() => submitDecision('MORE_DOCS_REQUIRED')}>
                Request Docs
              </button>
              <button className="btn btn-danger btn-sm" type="button" disabled={submitting} onClick={() => submitDecision('REJECTED')}>
                Reject
              </button>
              <button className="btn btn-danger btn-sm" type="button" disabled={submitting} onClick={() => submitDecision('SUSPENDED')}>
                Suspend
              </button>
              <button className="btn btn-success btn-sm" type="button" disabled={submitting} onClick={() => submitDecision('APPROVED')}>
                Approve Professional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
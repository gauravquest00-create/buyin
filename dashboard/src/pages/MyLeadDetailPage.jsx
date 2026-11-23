import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Copy,
  Clock,
  RefreshCw,
  ShieldAlert,
  Calendar,
  MapPin,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Modal } from '../components/Modal.jsx';
import { FinancialSummaryBox } from '../components/FinancialSummaryBox.jsx';

const LEAD_STATUSES = [
  'Claimed',
  'Contacted',
  'Interested',
  'Follow-up',
  'Site Visit Scheduled',
  'Site Visited',
  'Negotiation',
  'Closed',
  'Lost',
  'Cancelled',
];

const CHANNELS = ['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'OTHER'];

const REFUND_REASONS = [
  'Invalid contact',
  'Fake requirement',
  'Duplicate lead',
  'Buyer already purchased',
  'Requirement fulfilled',
  'Buyer not responding',
  'Other',
];

function cleanDigits(val) {
  return String(val || '').replace(/[^0-9]/g, '');
}

export function MyLeadDetailPage() {
  const { claimId } = useParams();
  const { setWalletBalance } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('followups');

  const [statusForm, setStatusForm] = useState({ status: 'Claimed', remark: '' });
  const [savingStatus, setSavingStatus] = useState(false);

  const [followUpForm, setFollowUpForm] = useState({
    channel: 'CALL',
    nextFollowUpAt: '',
    note: '',
  });
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const [visitForm, setVisitForm] = useState({
    scheduledAt: '',
    propertyAddress: '',
    notes: '',
  });
  const [savingVisit, setSavingVisit] = useState(false);

  const [extendModal, setExtendModal] = useState(null);
  const [extending, setExtending] = useState(false);

  const [refundModal, setRefundModal] = useState(null);
  const [refundForm, setRefundForm] = useState({
    reason: REFUND_REASONS[0],
    description: '',
  });
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/my-leads/${claimId}`);
      setData(res.data);
      if (res.data?.lead?.currentLeadStatus) {
        setStatusForm((prev) => ({ ...prev, status: res.data.lead.currentLeadStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Could not load lead details', 'error');
    } finally {
      setLoading(false);
    }
  }, [claimId, showToast]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const copyText = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied to clipboard`);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      await apiClient.patch(`/my-leads/${claimId}/status`, {
        status: statusForm.status,
        remark: statusForm.remark.trim() || `Status changed to ${statusForm.status}`,
      });
      showToast(`Lead status updated to ${statusForm.status}`);
      setStatusForm((prev) => ({ ...prev, remark: '' }));
      await loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (followUpForm.note.trim().length < 2) {
      showToast('Please enter at least 2 characters for the follow-up note.', 'error');
      return;
    }
    setSavingFollowUp(true);
    try {
      await apiClient.post(`/my-leads/${claimId}/follow-ups`, {
        channel: followUpForm.channel,
        note: followUpForm.note.trim(),
        nextFollowUpAt: followUpForm.nextFollowUpAt
          ? new Date(followUpForm.nextFollowUpAt).toISOString()
          : null,
      });
      showToast('Follow-up logged');
      setFollowUpForm({ channel: 'CALL', nextFollowUpAt: '', note: '' });
      await loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!visitForm.scheduledAt || visitForm.propertyAddress.trim().length < 3) {
      showToast('Please enter visit date/time and property address.', 'error');
      return;
    }
    setSavingVisit(true);
    try {
      await apiClient.post(`/my-leads/${claimId}/site-visits`, {
        scheduledAt: new Date(visitForm.scheduledAt).toISOString(),
        propertyAddress: visitForm.propertyAddress.trim(),
        notes: visitForm.notes.trim(),
      });
      showToast('Site visit scheduled');
      setVisitForm({ scheduledAt: '', propertyAddress: '', notes: '' });
      await loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingVisit(false);
    }
  };

  const handleVisitStatus = async (visitId, nextStatus) => {
    try {
      await apiClient.patch(`/my-leads/site-visits/${visitId}`, { status: nextStatus });
      showToast(`Site visit marked ${nextStatus}`);
      await loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openExtendPreview = async () => {
    try {
      const res = await apiClient.get(`/claims/${claimId}/extend-preview`);
      setExtendModal(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmExtend = async () => {
    if (!extendModal) return;
    setExtending(true);
    try {
      const res = await apiClient.post(`/claims/${claimId}/extend`);
      if (typeof res.data?.walletBalancePoints === 'number') {
        setWalletBalance(res.data.walletBalancePoints);
      }
      showToast('Ownership extended by +7 days');
      setExtendModal(null);
      await loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setExtending(false);
    }
  };

  const openRefundPreview = async () => {
    try {
      const res = await apiClient.get(`/refunds/preview/${claimId}`);
      setRefundModal({ claimId, ...res.data });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (refundForm.description.trim().length < 10) {
      showToast('Please enter at least 10 characters explaining the refund reason.', 'error');
      return;
    }
    setSubmittingRefund(true);
    try {
      await apiClient.post('/refunds', {
        claimId,
        reason: refundForm.reason,
        description: refundForm.description.trim(),
      });
      showToast('Refund request submitted. Lead placed on REVIEW_HOLD.');
      setRefundModal(null);
      setRefundForm({ reason: REFUND_REASONS[0], description: '' });
      await loadDetail();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 28, textAlign: 'center', color: 'var(--color-muted)' }}>
        Loading lead details...
      </div>
    );
  }

  if (!data?.claim || !data?.lead) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <p style={{ marginBottom: 14 }}>Claimed lead not found or no longer accessible.</p>
        <Link to="/my-leads" className="btn btn-secondary">
          <ArrowLeft size={15} /> Back to My Leads
        </Link>
      </div>
    );
  }

  const { claim, lead, statusHistory = [], followUps = [], siteVisits = [] } = data;
  const isActive = ['ACTIVE', 'EXTENDED'].includes(claim.status);
  const canExtend = claim.status === 'ACTIVE' && (claim.extensionCount || 0) === 0;
  const msLeft = Math.max(0, new Date(claim.expiresAt).getTime() - Date.now());
  const daysRemaining = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const contact = lead.buyerContact || {};
  const waNumber = cleanDigits(contact.phone || lead.buyerPhone);

  return (
    <>
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link
            to="/my-leads"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--color-primary)',
              marginBottom: 8,
            }}
          >
            <ArrowLeft size={14} /> Back to My Leads
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 className="page-title">{lead.title || 'Buyer Requirement'}</h1>
            <StatusBadge status={claim.status} />
            <StatusBadge status={lead.currentLeadStatus || 'Claimed'} />
          </div>
          <p className="page-subtitle">
            Lead Code: <strong>{lead.leadCode}</strong> &bull; Claim Code:{' '}
            <strong>{claim.claimCode}</strong> &bull; Claimed on{' '}
            {new Date(claim.claimedAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={loadDetail}>
            <RefreshCw size={14} /> Refresh
          </button>
          {canExtend && (
            <button type="button" className="btn btn-primary" onClick={openExtendPreview}>
              <Clock size={14} /> Extend +7 Days
            </button>
          )}
          {isActive && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={openRefundPreview}
            >
              <ShieldAlert size={14} /> Request 95% Refund
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-label">Ownership Remaining</div>
          <div className="kpi-value">
            {isActive ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}` : claim.status}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Expires {new Date(claim.expiresAt).toLocaleDateString()}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Points Spent</div>
          <div className="kpi-value">{(claim.originalClaimPoints || 0).toLocaleString()} pts</div>
          <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 4 }}>
            {claim.extensionPointsPaid > 0
              ? `+ ${claim.extensionPointsPaid} pts extension`
              : 'No extension used'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Follow-ups Logged</div>
          <div className="kpi-value">{followUps.length}</div>
          <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Calls, WhatsApp &amp; notes
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Site Visits</div>
          <div className="kpi-value">{siteVisits.length}</div>
          <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Scheduled &amp; completed
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column: Contact + Requirement Specs + Status Update */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Buyer Contact Details</h3>
            {lead.contactLocked ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: 13,
                }}
              >
                Buyer contact is locked because this claim is no longer active ({claim.status}).
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Buyer Name</div>
                    <div style={{ fontWeight: 700 }}>{contact.name || lead.buyerName || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Primary Phone</div>
                    <div style={{ fontWeight: 700 }}>{contact.phone || lead.buyerPhone || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Email</div>
                    <div style={{ fontWeight: 600 }}>{contact.email || lead.buyerEmail || 'Not provided'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Alternate Phone</div>
                    <div style={{ fontWeight: 600 }}>{contact.alternatePhone || 'Not provided'}</div>
                  </div>
                </div>

                {contact.notes && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'var(--color-canvas)',
                      border: '1px solid var(--color-border)',
                      fontSize: 12.5,
                      marginBottom: 14,
                    }}
                  >
                    <strong>Buyer Notes:</strong> {contact.notes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {waNumber && (
                    <a href={`tel:${contact.phone || lead.buyerPhone}`} className="btn btn-primary">
                      <Phone size={14} /> Call Buyer
                    </a>
                  )}
                  {waNumber && (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  {(contact.phone || lead.buyerPhone) && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => copyText(contact.phone || lead.buyerPhone, 'Phone number')}
                    >
                      <Copy size={14} /> Copy Phone
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Requirement Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>City &amp; Locality</div>
                <div style={{ fontWeight: 600 }}>
                  {lead.location ? `${lead.location}, ` : ''}
                  {lead.city || '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Budget Band</div>
                <div style={{ fontWeight: 600 }}>{lead.budgetBand || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Property Type</div>
                <div style={{ fontWeight: 600 }}>{lead.propertyType || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Configuration</div>
                <div style={{ fontWeight: 600 }}>{lead.configuration || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Purchase Timeline</div>
                <div style={{ fontWeight: 600 }}>{lead.purchaseTimeline || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>Seriousness Score</div>
                <div style={{ fontWeight: 600 }}>
                  {lead.seriousnessScore ? `${lead.seriousnessScore} / 100` : '-'}
                </div>
              </div>
            </div>

            {lead.requirementSummary && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border)',
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginBottom: 4 }}>
                  Requirement Summary
                </div>
                <div>{lead.requirementSummary}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Update Lead Pipeline Status</h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select
                  className="select"
                  value={statusForm.status}
                  disabled={!isActive}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status Remark</label>
                <textarea
                  className="textarea"
                  rows={2}
                  disabled={!isActive}
                  placeholder="Add a brief update (e.g., Buyer shortlisted 2 projects)..."
                  value={statusForm.remark}
                  onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isActive || savingStatus}
              >
                <CheckCircle2 size={14} /> {savingStatus ? 'Updating...' : 'Save Status Update'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Follow-ups, Site Visits, Status History Tabs */}
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'followups' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('followups')}
            >
              <FileText size={14} /> Follow-ups ({followUps.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('visits')}
            >
              <MapPin size={14} /> Site Visits ({siteVisits.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              <Calendar size={14} /> History ({statusHistory.length})
            </button>
          </div>

          {activeTab === 'followups' && (
            <>
              <form
                onSubmit={handleAddFollowUp}
                style={{
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Channel</label>
                    <select
                      className="select"
                      value={followUpForm.channel}
                      onChange={(e) =>
                        setFollowUpForm({ ...followUpForm, channel: e.target.value })
                      }
                    >
                      {CHANNELS.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Follow-up (Optional)</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={followUpForm.nextFollowUpAt}
                      onChange={(e) =>
                        setFollowUpForm({ ...followUpForm, nextFollowUpAt: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-up Note</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    required
                    minLength={2}
                    placeholder="Log what was discussed with the buyer..."
                    value={followUpForm.note}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, note: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingFollowUp}>
                  {savingFollowUp ? 'Saving...' : 'Add Follow-up Note'}
                </button>
              </form>

              {followUps.length === 0 ? (
                <div className="empty-state">No follow-ups logged yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {followUps.map((f) => (
                    <div
                      key={f._id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-canvas)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11.5,
                          color: 'var(--color-muted)',
                          marginBottom: 4,
                        }}
                      >
                        <strong>{f.channel || 'CALL'}</strong>
                        <span>{new Date(f.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: 13 }}>{f.note}</div>
                      {f.nextFollowUpAt && (
                        <div style={{ fontSize: 11.5, color: 'var(--color-primary)', marginTop: 6 }}>
                          Next reminder: {new Date(f.nextFollowUpAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'visits' && (
            <>
              <form
                onSubmit={handleScheduleVisit}
                style={{
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Visit Date &amp; Time</label>
                  <input
                    className="input"
                    type="datetime-local"
                    required
                    value={visitForm.scheduledAt}
                    onChange={(e) => setVisitForm({ ...visitForm, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Property / Project Address</label>
                  <input
                    className="input"
                    required
                    minLength={3}
                    placeholder="Project name and locality"
                    value={visitForm.propertyAddress}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, propertyAddress: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Notes (Optional)</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    placeholder="Meeting point or key requirements..."
                    value={visitForm.notes}
                    onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingVisit}>
                  {savingVisit ? 'Scheduling...' : 'Schedule Site Visit'}
                </button>
              </form>

              {siteVisits.length === 0 ? (
                <div className="empty-state">No site visits scheduled yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {siteVisits.map((v) => (
                    <div
                      key={v._id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-canvas)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <strong>{v.propertyAddress}</strong>
                        <StatusBadge status={v.status} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>
                        Scheduled: {new Date(v.scheduledAt).toLocaleString()}
                      </div>
                      {v.notes && <div style={{ fontSize: 13, marginBottom: 8 }}>{v.notes}</div>}
                      {v.status === 'SCHEDULED' && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleVisitStatus(v._id, 'COMPLETED')}
                          >
                            Mark Completed
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleVisitStatus(v._id, 'NO_SHOW')}
                          >
                            No Show
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleVisitStatus(v._id, 'CANCELLED')}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {statusHistory.length === 0 ? (
                <div className="empty-state">No status transitions recorded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {statusHistory.map((h) => (
                    <div
                      key={h._id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-canvas)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <strong>
                          {h.previousStatus || 'New'} -&gt; {h.newStatus}
                        </strong>
                        <span style={{ color: 'var(--color-muted)' }}>
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {h.remark && <div style={{ fontSize: 13 }}>{h.remark}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Extend +7 Days Modal */}
      <Modal
        open={Boolean(extendModal)}
        title="Extend Ownership (+7 Days)"
        onClose={() => setExtendModal(null)}
      >
        {extendModal && (
          <>
            <FinancialSummaryBox
              currentBalance={extendModal.currentBalance}
              deltaPoints={extendModal.extensionCost}
              direction="DEBIT"
              reason={`7-day extension at 25% of original ${extendModal.originalClaimPoints} claim points.`}
            />
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setExtendModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!extendModal.hasSufficientBalance || extending}
                onClick={confirmExtend}
              >
                {extending
                  ? 'Extending...'
                  : `Confirm Extension (-${extendModal.extensionCost} pts)`}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Request 95% Refund Modal */}
      <Modal
        open={Boolean(refundModal)}
        title="Request Lead Refund (95% Credit)"
        onClose={() => setRefundModal(null)}
      >
        {refundModal && (
          <form onSubmit={submitRefund}>
            <div className="financial-box" style={{ marginBottom: 16 }}>
              <div className="financial-row">
                <span>Original Claim Cost</span>
                <strong>{refundModal.originalClaimPoints} pts</strong>
              </div>
              <div className="financial-row">
                <span>5% Platform Deduction</span>
                <span style={{ color: 'var(--color-danger)' }}>-{refundModal.deductionPoints} pts</span>
              </div>
              <div className="financial-row total">
                <span>Expected Refund Credit (95%)</span>
                <span style={{ color: 'var(--color-success)' }}>+{refundModal.refundablePoints} pts</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Refund Reason</label>
              <select
                className="select"
                value={refundForm.reason}
                onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
              >
                {REFUND_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Explanation (Min 10 characters)</label>
              <textarea
                className="textarea"
                rows={4}
                required
                minLength={10}
                placeholder="Explain why the contact is invalid or duplicate..."
                value={refundForm.description}
                onChange={(e) => setRefundForm({ ...refundForm, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRefundModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submittingRefund}>
                {submittingRefund ? 'Submitting...' : 'Submit Refund Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
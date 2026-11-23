import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Copy,
  Clock,
  RefreshCw,
  ShieldAlert,
  ExternalLink,
  Search,
  FileText,
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

const FILTER_TABS = [
  'ALL',
  'Claimed',
  'Contacted',
  'Follow-up',
  'Site Visit Scheduled',
  'Negotiation',
  'Closed',
];

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

export function MyLeadsPage() {
  const { setWalletBalance } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [extendModal, setExtendModal] = useState(null);
  const [extending, setExtending] = useState(false);

  const [refundModal, setRefundModal] = useState(null);
  const [refundForm, setRefundForm] = useState({
    reason: REFUND_REASONS[0],
    description: '',
  });
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const [followUpModal, setFollowUpModal] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    note: '',
    nextFollowUpAt: '',
    channel: 'CALL',
  });
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const loadMyLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab === 'ALL' ? {} : { status: activeTab };
      const res = await apiClient.get('/my-leads', params);
      setItems(res.data?.items || []);
    } catch (err) {
      showToast(err.message || 'Failed to load claimed leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    loadMyLeads();
  }, [loadMyLeads]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(({ claim, lead }) => {
      const hay = [
        lead?.title,
        lead?.leadCode,
        claim?.claimCode,
        lead?.city,
        lead?.location,
        lead?.buyerName,
        lead?.buyerPhone,
        lead?.budgetBand,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const stats = useMemo(() => {
    let activeCount = 0;
    let expiringSoon = 0;
    let closedCount = 0;
    let pointsSpent = 0;
    items.forEach(({ claim, lead }) => {
      const isAct = ['ACTIVE', 'EXTENDED'].includes(claim?.status);
      if (isAct) {
        activeCount += 1;
        if ((claim?.daysRemaining ?? 99) <= 5) expiringSoon += 1;
      }
      if (claim?.status === 'CLOSED' || lead?.currentLeadStatus === 'Closed') {
        closedCount += 1;
      }
      pointsSpent += (claim?.originalClaimPoints || 0) + (claim?.extensionPointsPaid || 0);
    });
    return { activeCount, expiringSoon, closedCount, pointsSpent };
  }, [items]);

  const copyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard?.writeText(phone);
    showToast('Buyer phone copied to clipboard');
  };

  const handleStatusChange = async (claimId, status) => {
    try {
      await apiClient.patch(`/my-leads/${claimId}/status`, {
        status,
        remark: `Status changed to ${status}`,
      });
      showToast(`Lead marked as ${status}`);
      loadMyLeads();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openExtendPreview = async (claimId) => {
    try {
      const res = await apiClient.get(`/claims/${claimId}/extend-preview`);
      setExtendModal(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmExtend = async () => {
    if (!extendModal?.claimId) return;
    setExtending(true);
    try {
      const res = await apiClient.post(`/claims/${extendModal.claimId}/extend`);
      if (typeof res.data?.walletBalancePoints === 'number') {
        setWalletBalance(res.data.walletBalancePoints);
      }
      showToast('Ownership extended by +7 days');
      setExtendModal(null);
      loadMyLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setExtending(false);
    }
  };

  const openRefundPreview = async (claimId) => {
    try {
      const res = await apiClient.get(`/refunds/preview/${claimId}`);
      setRefundModal({ claimId, ...res.data });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!refundModal?.claimId) return;
    if (refundForm.description.trim().length < 10) {
      showToast('Please enter at least 10 characters explaining the refund reason.', 'error');
      return;
    }
    setSubmittingRefund(true);
    try {
      await apiClient.post('/refunds', {
        claimId: refundModal.claimId,
        reason: refundForm.reason,
        description: refundForm.description.trim(),
      });
      showToast('Refund request submitted. Claim placed on REVIEW_HOLD.');
      setRefundModal(null);
      setRefundForm({ reason: REFUND_REASONS[0], description: '' });
      loadMyLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const submitFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpModal || followUpForm.note.trim().length < 2) {
      showToast('Please enter at least 2 characters for the follow-up note.', 'error');
      return;
    }
    setSavingFollowUp(true);
    try {
      await apiClient.post(`/my-leads/${followUpModal}/follow-ups`, {
        note: followUpForm.note.trim(),
        channel: followUpForm.channel,
        nextFollowUpAt: followUpForm.nextFollowUpAt
          ? new Date(followUpForm.nextFollowUpAt).toISOString()
          : null,
      });
      showToast('Follow-up logged');
      setFollowUpModal(null);
      setFollowUpForm({ note: '', nextFollowUpAt: '', channel: 'CALL' });
      loadMyLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingFollowUp(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">My Claimed Leads</h1>
          <p className="page-subtitle">
            Manage exclusive 20-day buyer requirements, log follow-ups, schedule site visits, or open full lead details.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={loadMyLeads}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/lead-pool" className="btn btn-primary">
            Browse Lead Pool -&gt;
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-label">Active Exclusive Claims</div>
          <div className="kpi-value">{stats.activeCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Expiring Within 5 Days</div>
          <div className="kpi-value">{stats.expiringSoon}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Closed Deals</div>
          <div className="kpi-value">{stats.closedCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Points Used</div>
          <div className="kpi-value">{stats.pointsSpent.toLocaleString()} pts</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className="card"
        style={{
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 12.5 }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 230, flex: '0 1 280px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted)',
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Search buyer, city, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="card" style={{ padding: 28, textAlign: 'center', color: 'var(--color-muted)' }}>
          Loading your claimed leads...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card empty-state" style={{ padding: 32 }}>
          <p style={{ marginBottom: 12 }}>No claimed leads match this filter yet.</p>
          <Link to="/lead-pool" className="btn btn-primary">
            Explore Masked Lead Pool -&gt;
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredItems.map(({ claim, lead }) => {
            const isActive = ['ACTIVE', 'EXTENDED'].includes(claim.status);
            const canExtend = claim.status === 'ACTIVE' && (claim.extensionCount || 0) === 0;
            const phone = lead.buyerContact?.phone || lead.buyerPhone || '';
            const waNumber = cleanDigits(phone);

            return (
              <div key={claim._id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Link
                        to={`/my-leads/${claim._id}`}
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'var(--color-text)',
                          textDecoration: 'none',
                        }}
                      >
                        {lead.title || 'Buyer Requirement'}
                      </Link>
                      <StatusBadge status={claim.status} />
                      <StatusBadge status={lead.currentLeadStatus || 'Claimed'} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--color-muted)', marginTop: 4 }}>
                      {lead.leadCode} &bull; {lead.location ? `${lead.location}, ` : ''}
                      {lead.city} &bull; Budget: <strong>{lead.budgetBand || '-'}</strong> &bull;{' '}
                      {lead.propertyType || '-'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">
                      {isActive ? `${claim.daysRemaining}d left` : claim.status}
                    </span>
                    <Link to={`/my-leads/${claim._id}`} className="btn btn-primary">
                      View Details <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>

                {/* Buyer Contact & Quick Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 13 }}>
                    <strong>{lead.contactLocked ? 'Contact Locked' : lead.buyerName || 'Buyer'}</strong>
                    {!lead.contactLocked && phone && (
                      <span style={{ color: 'var(--color-muted)', marginLeft: 8 }}>{phone}</span>
                    )}
                    {lead.lastRemarkSummary && (
                      <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
                        Last note: {lead.lastRemarkSummary}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {!lead.contactLocked && waNumber && (
                      <>
                        <a
                          href={`tel:${phone}`}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                        >
                          <Phone size={13} /> Call
                        </a>
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => copyPhone(phone)}
                        >
                          <Copy size={13} /> Copy
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Pipeline:</span>
                    <select
                      className="select"
                      style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                      disabled={!isActive}
                      value={lead.currentLeadStatus || 'Claimed'}
                      onChange={(e) => handleStatusChange(claim._id, e.target.value)}
                    >
                      {LEAD_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: 12.5 }}
                      onClick={() => setFollowUpModal(claim._id)}
                    >
                      <FileText size={13} /> Log Follow-up
                    </button>
                    {canExtend && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 12.5 }}
                        onClick={() => openExtendPreview(claim._id)}
                      >
                        <Clock size={13} /> Extend +7d
                      </button>
                    )}
                    {isActive && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', fontSize: 12.5 }}
                        onClick={() => openRefundPreview(claim._id)}
                      >
                        <ShieldAlert size={13} /> Request Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Extend Modal */}
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

      {/* Follow-up Modal */}
      <Modal
        open={Boolean(followUpModal)}
        title="Log Buyer Follow-Up"
        onClose={() => setFollowUpModal(null)}
      >
        <form onSubmit={submitFollowUp}>
          <div className="form-group">
            <label className="form-label">Channel</label>
            <select
              className="select"
              value={followUpForm.channel}
              onChange={(e) => setFollowUpForm({ ...followUpForm, channel: e.target.value })}
            >
              <option value="CALL">Call</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Next Follow-up Reminder (Optional)</label>
            <input
              className="input"
              type="datetime-local"
              value={followUpForm.nextFollowUpAt}
              onChange={(e) =>
                setFollowUpForm({ ...followUpForm, nextFollowUpAt: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Follow-up Note</label>
            <textarea
              className="textarea"
              rows={3}
              required
              minLength={2}
              placeholder="Summarize call outcome or next step..."
              value={followUpForm.note}
              onChange={(e) => setFollowUpForm({ ...followUpForm, note: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFollowUpModal(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingFollowUp}>
              {savingFollowUp ? 'Saving...' : 'Save Follow-Up'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Refund Modal */}
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
                placeholder="Share details or call outcome..."
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
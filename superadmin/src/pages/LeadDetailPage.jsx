import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, RefreshCw, Coins, KeyRound, CalendarClock,
  MessageSquare, CheckCircle2, Archive, ExternalLink,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const POOL_STATES = ['DRAFT', 'AVAILABLE', 'CLAIMED', 'REVIEW_HOLD', 'CLOSED', 'LEAD_BIN', 'ARCHIVED'];
const LEAD_STATUSES = [
  'Claimed', 'Contacted', 'Interested', 'Follow-up',
  'Site Visit Scheduled', 'Site Visited', 'Negotiation', 'Closed', 'Lost', 'Cancelled',
];

export function LeadDetailPage() {
  const { leadId } = useParams();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadDetail = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get(`/leads/${leadId}`);
      setData(res.data);
      const l = res.data.lead;
      setForm({
        title: l.title || '',
        requirementSummary: l.requirementSummary || '',
        buyerName: l.buyerName || '',
        buyerPhone: l.buyerPhone || '',
        buyerEmail: l.buyerEmail || '',
        buyerNotes: l.buyerNotes || '',
        city: l.city || '',
        location: l.location || '',
        configuration: l.configuration || '',
        budgetBand: l.budgetBand,
        propertyType: l.propertyType,
        purchaseTimeline: l.purchaseTimeline,
        seriousnessScore: l.seriousnessScore ?? 75,
        siteVisitStatus: l.siteVisitStatus || 'None',
        poolState: l.poolState,
        currentLeadStatus: l.currentLeadStatus || '',
        lastRemarkSummary: l.lastRemarkSummary || '',
        returnedDiscountApproved: Boolean(l.returnedDiscountApproved),
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leadId, showToast]);

  useEffect(() => {
    loadDetail(false);
  }, [loadDetail]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.patch(`/leads/${leadId}`, {
        ...form,
        currentLeadStatus: form.currentLeadStatus || null,
      });
      showToast('Lead details & status updated');
      loadDetail(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await adminApi.post(`/leads/${leadId}/publish`);
      showToast('Lead published to shared pool');
      loadDetail(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleArchive = async () => {
    const reason = window.prompt('Archive reason:', 'Archived by admin');
    if (!reason) return;
    try {
      await adminApi.post(`/leads/${leadId}/archive`, { reason });
      showToast('Lead archived');
      loadDetail(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading || !data || !form) {
    return (
      <div className="dash-wrap">
        <div className="dash-skeleton" style={{ height: 38, width: 320 }} />
        <div className="dash-kpi-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="dash-skeleton" style={{ height: 92 }} />)}
        </div>
        <div className="dash-skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  const { lead, claims, statusHistory, followUps, siteVisits } = data;
  const snap = lead.pricingSnapshot || {};

  return (
    <div className="dash-wrap">
      {/* Top Header */}
      <div className="header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/leads" className="btn btn-secondary btn-sm"><ArrowLeft size={14} /> Back</Link>
          <div>
            <h1>{lead.leadCode} — {lead.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              {lead.location}, {lead.city} • {lead.propertyType} • Created {new Date(lead.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">Pool: {lead.poolState}</span>
          {lead.currentLeadStatus && <span className="badge badge-amber">Status: {lead.currentLeadStatus}</span>}
          {['DRAFT', 'ARCHIVED'].includes(lead.poolState) && (
            <button className="btn btn-success btn-sm" type="button" onClick={handlePublish}>
              <CheckCircle2 size={13} /> Publish
            </button>
          )}
          {lead.poolState !== 'ARCHIVED' && (
            <button className="btn btn-danger btn-sm" type="button" onClick={handleArchive}>
              <Archive size={13} /> Archive
            </button>
          )}
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadDetail(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon blue"><Coins size={16} /></span></div>
          <div className="dash-kpi-value">{lead.computedClaimPoints} pts</div>
          <div className="dash-kpi-label">Computed Claim Cost</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon amber"><KeyRound size={16} /></span></div>
          <div className="dash-kpi-value">{claims.length}</div>
          <div className="dash-kpi-label">Total Claims (Returns: {lead.returnCount || 0})</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon green"><MessageSquare size={16} /></span></div>
          <div className="dash-kpi-value">{followUps.length}</div>
          <div className="dash-kpi-label">Follow-Ups Logged</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon navy"><CalendarClock size={16} /></span></div>
          <div className="dash-kpi-value">{siteVisits.length}</div>
          <div className="dash-kpi-label">Site Visits ({lead.siteVisitStatus})</div>
        </div>
      </div>

      {/* Edit Details & Status Form */}
      <form className="card" onSubmit={handleSave}>
        <div className="header-row" style={{ marginBottom: 12 }}>
          <h3>Edit Lead Details & Status</h3>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Pool State</label>
            <select className="select" value={form.poolState} onChange={(e) => setForm({ ...form, poolState: e.target.value })}>
              {POOL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lead Lifecycle Status</label>
            <select className="select" value={form.currentLeadStatus} onChange={(e) => setForm({ ...form, currentLeadStatus: e.target.value })}>
              <option value="">Unassigned</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Configuration</label><input className="input" value={form.configuration} onChange={(e) => setForm({ ...form, configuration: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Buyer Name (Private)</label><input className="input" required value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Buyer Phone (Private)</label><input className="input" required value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Buyer Email</label><input className="input" type="email" value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">City</label><input className="input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Location</label><input className="input" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group">
            <label className="form-label">Budget Band</label>
            <select className="select" value={form.budgetBand} onChange={(e) => setForm({ ...form, budgetBand: e.target.value })}>
              <option value="BELOW_50L">Below ₹50L</option>
              <option value="50L_1CR">₹50L–₹1Cr</option>
              <option value="1CR_2CR">₹1Cr–₹2Cr</option>
              <option value="2CR_5CR">₹2Cr–₹5Cr</option>
              <option value="5CR_10CR">₹5Cr–₹10Cr</option>
              <option value="10CR_PLUS">₹10Cr+</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select className="select" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
              <option>Apartment</option>
              <option>Builder Floor</option>
              <option>Residential Plot</option>
              <option>Independent House</option>
              <option>Villa/Luxury</option>
              <option>Commercial</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Site Visit Status</label>
            <select className="select" value={form.siteVisitStatus} onChange={(e) => setForm({ ...form, siteVisitStatus: e.target.value })}>
              <option>None</option>
              <option>Requested</option>
              <option>Scheduled</option>
              <option>Completed & Verified</option>
              <option>Multiple Verified Visits</option>
            </select>
          </div>
        </div>

        <div className="form-group"><label className="form-label">Requirement Summary</label><textarea className="textarea" rows={3} required value={form.requirementSummary} onChange={(e) => setForm({ ...form, requirementSummary: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Last Remark Summary</label><input className="input" value={form.lastRemarkSummary} onChange={(e) => setForm({ ...form, lastRemarkSummary: e.target.value })} /></div>
      </form>

      {/* Active Ownership & Pricing Breakdown */}
      <div className="grid-2">
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title">Active Ownership</span>
            {lead.activeOwnerId && (
              <Link to={`/users/${lead.activeOwnerId._id}`} className="analysis-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                View User <ExternalLink size={11} />
              </Link>
            )}
          </div>
          {lead.activeOwnerId ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
              <div><strong>Owner:</strong> {lead.activeOwnerId.fullName}</div>
              <div><strong>Email:</strong> {lead.activeOwnerId.email}</div>
              <div><strong>Agency:</strong> {lead.activeOwnerId.agencyName || '-'}</div>
              <div><strong>Claim Code:</strong> {lead.activeClaimId?.claimCode || '-'}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Ownership Expires:</strong> {lead.ownershipExpiresAt ? new Date(lead.ownershipExpiresAt).toLocaleString() : '-'}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>No active owner currently assigned.</p>
          )}
        </div>

        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title">Pricing Snapshot Breakdown</span>
            <Link to="/pricing" className="analysis-link">Pricing Engine →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12.5 }}>
            <div>Base Budget Points: <strong>{snap.basePoints ?? 0}</strong></div>
            <div>Property Addition: <strong>+{snap.propertyAddition ?? 0}</strong></div>
            <div>Buyer Signals: <strong>+{snap.signalTotal ?? 0}</strong></div>
            <div>Site Visit Premium: <strong>+{snap.siteVisitPremium ?? 0}</strong></div>
            <div>Returned Discount: <strong>-{snap.discountPoints ?? 0} ({snap.discountPercent ?? 0}%)</strong></div>
            <div>Final Cost: <span className="badge badge-blue">{lead.computedClaimPoints} pts</span></div>
          </div>
        </div>
      </div>

      {/* Claims & Status History Tables */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Claim History ({claims.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 380 }}>
              <thead><tr><th>Code</th><th>Professional</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No claims yet.</td></tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.claimCode}</strong></td>
                      <td>
                        {c.userId ? (
                          <Link to={`/users/${c.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {c.userId.fullName}
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
          <h3 style={{ marginBottom: 10 }}>Status History ({statusHistory.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 380 }}>
              <thead><tr><th>Transition</th><th>By</th><th>Remark</th><th>Time</th></tr></thead>
              <tbody>
                {statusHistory.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No status transitions yet.</td></tr>
                ) : (
                  statusHistory.map((h) => (
                    <tr key={h._id}>
                      <td><strong>{h.previousStatus || 'New'} → {h.newStatus}</strong></td>
                      <td>{h.userId?.fullName || 'Admin'}</td>
                      <td>{h.remark || '-'}</td>
                      <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(h.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Follow-Ups & Site Visits Tables */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Follow-Ups ({followUps.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 380 }}>
              <thead><tr><th>Channel</th><th>Note</th><th>Logged</th></tr></thead>
              <tbody>
                {followUps.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>No follow-ups recorded.</td></tr>
                ) : (
                  followUps.map((f) => (
                    <tr key={f._id}>
                      <td><span className="badge badge-gray">{f.channel}</span></td>
                      <td>{f.note}</td>
                      <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(f.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Site Visits ({siteVisits.length})</h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 380 }}>
              <thead><tr><th>Status</th><th>Property Address</th><th>Scheduled</th></tr></thead>
              <tbody>
                {siteVisits.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>No site visits scheduled.</td></tr>
                ) : (
                  siteVisits.map((v) => (
                    <tr key={v._id}>
                      <td><span className="badge badge-amber">{v.status}</span></td>
                      <td>{v.propertyAddress}</td>
                      <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(v.scheduledAt).toLocaleString()}</td>
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
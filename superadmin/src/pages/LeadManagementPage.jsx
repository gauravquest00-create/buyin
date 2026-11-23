import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, ExternalLink, RefreshCw, Layers, CheckCircle2, KeyRound,
  FileEdit, Archive, ArrowUpRight,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const POOL_STATES = ['DRAFT', 'AVAILABLE', 'CLAIMED', 'REVIEW_HOLD', 'CLOSED', 'LEAD_BIN', 'ARCHIVED'];
const LEAD_STATUSES = [
  'Claimed', 'Contacted', 'Interested', 'Follow-up',
  'Site Visit Scheduled', 'Site Visited', 'Negotiation', 'Closed', 'Lost', 'Cancelled',
];

const INITIAL_FORM = {
  title: '',
  requirementSummary: '',
  buyerName: '',
  buyerPhone: '',
  buyerEmail: '',
  budgetBand: '1CR_2CR',
  budgetMinInr: 12000000,
  budgetMaxInr: 18000000,
  propertyType: 'Apartment',
  city: 'Gurugram',
  location: '',
  configuration: '3 BHK',
  purchaseTimeline: 'DAYS_31_TO_90',
  seriousnessScore: 80,
  siteVisitStatus: 'None',
  signals: {
    contactVerified: true,
    budgetConfirmed: true,
    exactLocationConfig: false,
    siteVisitRequested: false,
    buyerActivelyResponding: true,
    fundingLoanReadiness: false,
  },
  publishImmediately: true,
};

export function LeadManagementPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState({ search: '', poolState: '', currentLeadStatus: '', city: '' });
  const [form, setForm] = useState(INITIAL_FORM);

  const loadLeads = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/leads', filters);
      setLeads(res.data.leads || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadLeads(false);
  }, [loadLeads]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminApi.post('/leads', form);
      showToast('Buyer requirement created successfully');
      setForm(INITIAL_FORM);
      setShowCreate(false);
      loadLeads(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handlePoolStateChange = async (leadId, poolState) => {
    try {
      await adminApi.patch(`/leads/${leadId}`, { poolState });
      showToast(`Pool state changed to ${poolState}`);
      loadLeads(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLeadStatusChange = async (leadId, currentLeadStatus) => {
    try {
      await adminApi.patch(`/leads/${leadId}`, { currentLeadStatus: currentLeadStatus || null });
      showToast(`Lead status changed to ${currentLeadStatus || 'Unassigned'}`);
      loadLeads(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleQuickAction = async (leadId, action) => {
    try {
      if (action === 'publish') {
        await adminApi.post(`/leads/${leadId}/publish`);
        showToast('Lead published to shared pool');
      } else if (action === 'archive') {
        const reason = window.prompt('Archive reason:', 'Archived by admin');
        if (!reason) return;
        await adminApi.post(`/leads/${leadId}/archive`, { reason });
        showToast('Lead archived');
      }
      loadLeads(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleSignal = (key) => {
    setForm((prev) => ({
      ...prev,
      signals: { ...prev.signals, [key]: !prev.signals[key] },
    }));
  };

  const availableCount = leads.filter((l) => l.poolState === 'AVAILABLE').length;
  const claimedCount = leads.filter((l) => l.poolState === 'CLAIMED').length;
  const draftCount = leads.filter((l) => l.poolState === 'DRAFT').length;
  const closedCount = leads.filter((l) => ['CLOSED', 'ARCHIVED', 'LEAD_BIN'].includes(l.poolState)).length;

  const KPI_CARDS = [
    { label: 'Total Shown', value: leads.length, hint: 'Reset filters', icon: Layers, tone: 'navy', onClick: () => setFilters({ search: '', poolState: '', currentLeadStatus: '', city: '' }) },
    { label: 'Available in Pool', value: availableCount, hint: 'Filter available', icon: CheckCircle2, tone: 'green', onClick: () => setFilters((f) => ({ ...f, poolState: 'AVAILABLE' })) },
    { label: 'Claimed Active', value: claimedCount, hint: 'Filter claimed', icon: KeyRound, tone: 'blue', onClick: () => setFilters((f) => ({ ...f, poolState: 'CLAIMED' })) },
    { label: 'Drafts', value: draftCount, hint: 'Filter drafts', icon: FileEdit, tone: 'amber', onClick: () => setFilters((f) => ({ ...f, poolState: 'DRAFT' })) },
    { label: 'Closed / Archived', value: closedCount, hint: 'Filter closed', icon: Archive, tone: 'red', onClick: () => setFilters((f) => ({ ...f, poolState: 'CLOSED' })) },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Lead Management</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Create requirements, update Pool State & Lead Status inline, or click any lead to open full details.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadLeads(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setShowCreate((v) => !v)}>
            <Plus size={14} /> {showCreate ? 'Close Form' : 'Create Lead'}
          </button>
        </div>
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

      {/* Create Form */}
      {showCreate && (
        <form className="card" onSubmit={handleCreate}>
          <div className="header-row" style={{ marginBottom: 12 }}>
            <h3>Create New Buyer Requirement</h3>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Requirement Title</label>
              <input className="input" required minLength={5} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 3 BHK Apartment in Sector 65" />
            </div>
            <div className="form-group">
              <label className="form-label">Configuration</label>
              <input className="input" value={form.configuration} onChange={(e) => setForm({ ...form, configuration: e.target.value })} placeholder="e.g. 3 BHK + Servant" />
            </div>
            <div className="form-group">
              <label className="form-label">Buyer Full Name (Private)</label>
              <input className="input" required value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Buyer Phone (Private)</label>
              <input className="input" required value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} placeholder="+9198XXXXXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Buyer Email (Private, Optional)</label>
              <input className="input" type="email" value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Micro-Location</label>
              <input className="input" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Golf Course Extension Road" />
            </div>
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
                <option value="Apartment">Apartment</option>
                <option value="Builder Floor">Builder Floor</option>
                <option value="Residential Plot">Residential Plot</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa/Luxury">Villa/Luxury</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Timeline</label>
              <select className="select" value={form.purchaseTimeline} onChange={(e) => setForm({ ...form, purchaseTimeline: e.target.value })}>
                <option value="WITHIN_30_DAYS">Within 30 Days</option>
                <option value="DAYS_31_TO_90">31–90 Days</option>
                <option value="DAYS_90_PLUS">90+ Days</option>
                <option value="EXPLORING">Exploring</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Requirement Summary</label>
            <textarea className="textarea" rows={3} required minLength={10} value={form.requirementSummary} onChange={(e) => setForm({ ...form, requirementSummary: e.target.value })} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 12 }}>
            {Object.entries(form.signals).map(([key, val]) => (
              <label key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={val} onChange={() => toggleSignal(key)} />
                <span>{key}</span>
              </label>
            ))}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={form.publishImmediately} onChange={(e) => setForm({ ...form, publishImmediately: e.target.checked })} />
              <span>Publish Immediately</span>
            </label>
          </div>

          <button className="btn btn-primary btn-sm" type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Save Buyer Requirement'}
          </button>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 210px' }}
          placeholder="Search code, title, buyer name, phone, location..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          className="input"
          style={{ flex: '1 1 130px' }}
          placeholder="City..."
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <select className="select" style={{ flex: '1 1 150px' }} value={filters.poolState} onChange={(e) => setFilters({ ...filters, poolState: e.target.value })}>
          <option value="">All Pool States</option>
          {POOL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" style={{ flex: '1 1 160px' }} value={filters.currentLeadStatus} onChange={(e) => setFilters({ ...filters, currentLeadStatus: e.target.value })}>
          <option value="">All Lead Statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Buyer (Private)</th>
                <th>Location & Type</th>
                <th>Points</th>
                <th>Pool State</th>
                <th>Lead Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No leads match your filters.</td></tr>
              ) : (
                leads.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <Link to={`/leads/${l._id}`} style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {l.leadCode} <ExternalLink size={12} />
                      </Link>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>
                        <Link to={`/leads/${l._id}`}>{l.title}</Link>
                      </div>
                    </td>
                    <td>
                      <strong>{l.buyerName}</strong>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.buyerPhone}</div>
                    </td>
                    <td>
                      <div>{l.location}, {l.city}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.propertyType} • {l.budgetBand}</div>
                    </td>
                    <td><strong>{l.computedClaimPoints} pts</strong></td>
                    <td>
                      <select
                        className="select"
                        style={{ minWidth: 125, padding: '5px 8px', fontSize: 12 }}
                        value={l.poolState}
                        onChange={(e) => handlePoolStateChange(l._id, e.target.value)}
                      >
                        {POOL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select"
                        style={{ minWidth: 145, padding: '5px 8px', fontSize: 12 }}
                        value={l.currentLeadStatus || ''}
                        onChange={(e) => handleLeadStatusChange(l._id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <Link to={`/leads/${l._id}`} className="btn btn-secondary btn-sm">Details</Link>
                        {l.poolState === 'DRAFT' && (
                          <button className="btn btn-success btn-sm" type="button" onClick={() => handleQuickAction(l._id, 'publish')}>
                            Publish
                          </button>
                        )}
                        {l.poolState !== 'ARCHIVED' && (
                          <button className="btn btn-danger btn-sm" type="button" onClick={() => handleQuickAction(l._id, 'archive')}>
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
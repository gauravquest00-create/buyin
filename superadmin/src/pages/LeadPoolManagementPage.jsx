import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, CheckCircle2, RotateCcw, KeyRound, ShieldAlert, FileEdit,
  Trash2, RefreshCw, ArrowUpRight, ExternalLink,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const VIEW_TABS = [
  { key: 'ALL', label: 'All Leads' },
  { key: 'AVAILABLE', label: 'Available Pool' },
  { key: 'RETURNED', label: 'Returned Leads' },
  { key: 'CLAIMED', label: 'Claimed' },
  { key: 'REVIEW_HOLD', label: 'Review Hold' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'LEAD_BIN', label: 'Lead Bin' },
  { key: 'ARCHIVED', label: 'Archived' },
];

function poolBadgeClass(state) {
  if (state === 'AVAILABLE') return 'badge-green';
  if (state === 'CLAIMED') return 'badge-blue';
  if (state === 'REVIEW_HOLD' || state === 'DRAFT') return 'badge-amber';
  if (state === 'LEAD_BIN' || state === 'ARCHIVED') return 'badge-red';
  return 'badge-gray';
}

export function LeadPoolManagementPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('AVAILABLE');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPool = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeTab === 'RETURNED') params.isReturnedLead = 'true';
      else if (activeTab !== 'ALL') params.poolState = activeTab;

      const [ovRes, leadsRes] = await Promise.all([
        adminApi.get('/lead-pool/overview'),
        adminApi.get('/leads', params),
      ]);
      setOverview(ovRes.data);
      setLeads(leadsRes.data.leads || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search, showToast]);

  useEffect(() => {
    loadPool(false);
  }, [loadPool]);

  const toggleReturnedDiscount = async (leadId, approved) => {
    try {
      await adminApi.patch(`/lead-pool/${leadId}/returned-discount`, { approved });
      showToast(approved ? 'Returned-lead discount approved' : 'Returned-lead discount revoked');
      loadPool(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePublish = async (leadId) => {
    try {
      await adminApi.post(`/leads/${leadId}/publish`);
      showToast('Lead published to shared pool');
      loadPool(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleArchive = async (leadId) => {
    const reason = window.prompt('Reason for archiving this lead:', 'Removed from shared pool by admin');
    if (!reason) return;
    try {
      await adminApi.post(`/leads/${leadId}/archive`, { reason });
      showToast('Lead archived');
      loadPool(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const byState = overview?.byState || {};

  const KPI_CARDS = [
    { label: 'Available in Pool', value: byState.AVAILABLE ?? 0, hint: 'View available', tab: 'AVAILABLE', icon: CheckCircle2, tone: 'green' },
    { label: 'Returned in Pool', value: overview?.returnedAvailableCount ?? 0, hint: 'Manage discounts', tab: 'RETURNED', icon: RotateCcw, tone: 'amber' },
    { label: 'Currently Claimed', value: byState.CLAIMED ?? 0, hint: 'View claimed', tab: 'CLAIMED', icon: KeyRound, tone: 'blue' },
    { label: 'Refund Review Hold', value: byState.REVIEW_HOLD ?? 0, hint: 'Protected leads', tab: 'REVIEW_HOLD', icon: ShieldAlert, tone: 'amber' },
    { label: 'Drafts', value: byState.DRAFT ?? 0, hint: 'Ready to publish', tab: 'DRAFT', icon: FileEdit, tone: 'navy' },
    { label: 'Lead Bin', value: byState.LEAD_BIN ?? 0, hint: 'Invalid/duplicate', tab: 'LEAD_BIN', icon: Trash2, tone: 'red' },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Lead Pool Control</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Monitor shared pool availability, approve returned-lead discounts, publish drafts, and inspect Lead Bin items.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/leads" className="btn btn-primary btn-sm"><Layers size={13} /> Create / Manage Leads</Link>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadPool(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Clickable Pool KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, tab, icon: Icon, tone }, idx) => (
          <div
            key={label}
            onClick={() => setActiveTab(tab)}
            className="dash-kpi-card"
            style={{
              animationDelay: `${idx * 40}ms`,
              borderColor: activeTab === tab ? 'var(--primary)' : undefined,
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

      {/* Search + Pool State Filter Tabs */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          className="input"
          placeholder="Search pool leads by code, title, city, location, or buyer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {VIEW_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pool Leads Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Location & Type</th>
                <th>Points</th>
                <th>Pool State</th>
                <th>Returns & Discount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No leads in this pool view.</td></tr>
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
                      <div>{l.location}, {l.city}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{l.propertyType} • {l.budgetBand}</div>
                    </td>
                    <td><strong>{l.computedClaimPoints} pts</strong></td>
                    <td><span className={`badge ${poolBadgeClass(l.poolState)}`}>{l.poolState}</span></td>
                    <td>
                      {l.isReturnedLead ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-amber">Returns: {l.returnCount || 1}</span>
                          <button
                            type="button"
                            className={`btn btn-sm ${l.returnedDiscountApproved ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => toggleReturnedDiscount(l._id, !l.returnedDiscountApproved)}
                          >
                            {l.returnedDiscountApproved ? 'Discount On' : 'Approve Discount'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Fresh lead</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Link to={`/leads/${l._id}`} className="btn btn-secondary btn-sm">Details</Link>
                        {['DRAFT', 'ARCHIVED'].includes(l.poolState) && (
                          <button className="btn btn-success btn-sm" type="button" onClick={() => handlePublish(l._id)}>
                            Publish
                          </button>
                        )}
                        {!['ARCHIVED', 'LEAD_BIN'].includes(l.poolState) && (
                          <button className="btn btn-danger btn-sm" type="button" onClick={() => handleArchive(l._id)}>
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
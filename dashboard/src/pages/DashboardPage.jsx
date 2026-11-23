import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Briefcase, CalendarCheck, CheckCircle2, Wallet,
  ArrowUpRight, RefreshCw, Clock,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function DashboardPage() {
  const { setWalletBalance } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiClient.get('/lead-pool/dashboard-summary');
      setData(res.data);
      if (res.data?.kpis?.walletBalancePoints !== undefined) {
        setWalletBalance(res.data.kpis.walletBalancePoints);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setWalletBalance]);

  useEffect(() => {
    loadSummary(false);
  }, [loadSummary]);

  if (loading) {
    return (
      <div className="dash-wrap">
        <div className="page-header">
          <div className="skeleton" style={{ width: 200, height: 26 }} />
          <div className="skeleton" style={{ width: 120, height: 30 }} />
        </div>
        <div className="kpi-grid">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 96 }} />)}
        </div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 220 }} />
          <div className="skeleton" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const KPI_CARDS = [
    { label: 'Available Leads', value: kpis.availableLeads ?? 0, hint: 'Browse shared pool', to: '/lead-pool', icon: Layers, tone: 'navy' },
    { label: 'My Active Leads', value: kpis.myActiveLeads ?? 0, hint: '20-day ownerships', to: '/my-leads', icon: Briefcase, tone: 'blue' },
    { label: 'Site Visits', value: kpis.siteVisits ?? 0, hint: 'Manage visits', to: '/my-leads', icon: CalendarCheck, tone: 'amber' },
    { label: 'Closed Deals', value: kpis.closedDeals ?? 0, hint: 'Permanent closures', to: '/my-leads', icon: CheckCircle2, tone: 'green' },
    { label: 'Wallet Balance', value: `${(kpis.walletBalancePoints ?? 0).toLocaleString()} pts`, hint: 'Recharge wallet', to: '/wallet', icon: Wallet, tone: 'blue' },
  ];

  return (
    <div className="dash-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Click any metric card to jump straight to your leads, pool, or wallet.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadSummary(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/lead-pool" className="btn btn-primary btn-sm">Browse Lead Pool</Link>
        </div>
      </div>

      {!data?.claimEligibility?.allowed && (
        <div className="card" style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-soft)', fontSize: 12.5 }}>
          <strong>Verification Required for Claiming:</strong> {data?.claimEligibility?.reason}{' '}
          <Link to="/profile" style={{ color: 'var(--color-primary)', fontWeight: 700, marginLeft: 6 }}>Complete Verification →</Link>
        </div>
      )}

      {/* Clickable Animated KPI Cards */}
      <div className="kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, to, icon: Icon, tone }, idx) => (
          <Link key={label} to={to} className="kpi-card clickable" style={{ animationDelay: `${idx * 40}ms` }}>
            <div className="kpi-top">
              <span className={`kpi-icon ${tone}`}><Icon size={15} /></span>
              <ArrowUpRight size={14} className="kpi-arrow" />
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-sub">{hint} →</div>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="page-header" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: 14 }}>Recently Added Leads</h3>
            <Link to="/lead-pool" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>View all →</Link>
          </div>
          {(data?.recentlyAddedLeads || []).length === 0 ? (
            <div className="empty-state">No leads currently available in the pool.</div>
          ) : (
            data.recentlyAddedLeads.map((lead) => (
              <Link
                key={lead._id}
                to="/lead-pool"
                style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>
                    {lead.location}, {lead.city} • {lead.propertyType} • {lead.budgetBand}
                  </div>
                </div>
                <span className="badge badge-blue">{lead.computedClaimPoints} pts</span>
              </Link>
            ))
          )}
        </div>

        <div className="card">
          <div className="page-header" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: 14 }}>Upcoming Follow-Ups</h3>
            <Link to="/my-leads" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>My Leads →</Link>
          </div>
          {(data?.upcomingFollowUps || []).length === 0 ? (
            <div className="empty-state">No upcoming follow-ups scheduled.</div>
          ) : (
            data.upcomingFollowUps.map((f) => (
              <div key={f._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.leadId?.title || f.leadId?.leadCode}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{f.note}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> Due: {new Date(f.nextFollowUpAt).toLocaleString()} • {f.channel}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 14 }}>Recent Lead Activity</h3>
          <Link to="/my-leads" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>All My Leads →</Link>
        </div>
        {(data?.recentLeadActivity || []).length === 0 ? (
          <div className="empty-state">No recent claims yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Claim Code</th><th>Lead</th><th>Location</th><th>Status</th><th>Points</th></tr></thead>
              <tbody>
                {data.recentLeadActivity.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.claimCode}</strong></td>
                    <td>{c.leadId?.title || '-'}</td>
                    <td>{c.leadId?.location}, {c.leadId?.city}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><strong>{c.originalClaimPoints} pts</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
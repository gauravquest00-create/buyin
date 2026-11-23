import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, Layers, KeyRound, RotateCcw, IndianRupee,
  ArrowUpRight, RefreshCw, MapPin, Activity, TrendingUp,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

export function DashboardAnalyticsPage() {
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [dashRes, repRes] = await Promise.all([
        adminApi.get('/dashboard'),
        adminApi.get('/reports/summary').catch(() => ({ data: null })),
      ]);
      setDashboard(dashRes.data);
      setAnalytics(repRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll(false);
  }, [loadAll]);

  if (loading) {
    return (
      <div className="dash-wrap">
        <div className="header-row">
          <div className="dash-skeleton" style={{ width: 220, height: 26 }} />
          <div className="dash-skeleton" style={{ width: 96, height: 30 }} />
        </div>
        <div className="dash-kpi-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="dash-skeleton" style={{ height: 96 }} />
          ))}
        </div>
        <div className="dash-analysis-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-skeleton" style={{ height: 190 }} />
          ))}
        </div>
        <div className="dash-skeleton" style={{ height: 220 }} />
      </div>
    );
  }

  const k = dashboard?.kpis || {};
  const leadsByCity = analytics?.leadsByCity || [];
  const claimsByStatus = analytics?.claimsByStatus || [];
  const revenueByMonth = analytics?.revenueByMonth || [];

  const maxCityCount = Math.max(1, ...leadsByCity.map((c) => c.count || 0));
  const maxClaimCount = Math.max(1, ...claimsByStatus.map((c) => c.count || 0));
  const maxRev = Math.max(1, ...revenueByMonth.map((m) => m.revenueInr || 0));

  const KPI_CARDS = [
    {
      label: 'Registered Professionals',
      value: (k.totalUsers ?? 0).toLocaleString(),
      hint: 'Manage users',
      to: '/users',
      icon: Users,
      tone: 'blue',
    },
    {
      label: 'Pending Verifications',
      value: (k.pendingVerifications ?? 0).toLocaleString(),
      hint: 'Review KYC queue',
      to: '/verifications',
      icon: ShieldCheck,
      tone: 'amber',
    },
    {
      label: 'Available Pool Leads',
      value: (k.availableLeads ?? 0).toLocaleString(),
      hint: 'Open lead pool',
      to: '/lead-pool',
      icon: Layers,
      tone: 'navy',
    },
    {
      label: 'Active Claims',
      value: (k.activeClaims ?? 0).toLocaleString(),
      hint: 'Inspect ownerships',
      to: '/claims',
      icon: KeyRound,
      tone: 'blue',
    },
    {
      label: 'Pending Refunds',
      value: (k.pendingRefunds ?? 0).toLocaleString(),
      hint: 'Review disputes',
      to: '/refunds',
      icon: RotateCcw,
      tone: 'red',
    },
    {
      label: 'Total Revenue (INR)',
      value: `₹${(k.totalRevenueInr ?? 0).toLocaleString()}`,
      hint: `${k.capturedPaymentsCount ?? 0} captured payments`,
      to: '/payments',
      icon: IndianRupee,
      tone: 'green',
    },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Platform Overview & Analytics</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Click any metric card to jump straight into its management queue.
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          disabled={refreshing}
          onClick={() => loadAll(true)}
        >
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Clickable KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, to, icon: Icon, tone }, idx) => (
          <Link
            key={label}
            to={to}
            className="dash-kpi-card"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="dash-kpi-top">
              <span className={`dash-kpi-icon ${tone}`}>
                <Icon size={16} />
              </span>
              <ArrowUpRight size={15} className="dash-kpi-arrow" />
            </div>
            <div className="dash-kpi-value">{value}</div>
            <div className="dash-kpi-label">{label}</div>
            <div className="dash-kpi-hint">{hint} →</div>
          </Link>
        ))}
      </div>

      {/* Visual Analysis Section */}
      <div className="dash-analysis-grid">
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><MapPin size={14} /> Leads by City</span>
            <Link to="/leads" className="analysis-link">Manage Leads</Link>
          </div>
          {leadsByCity.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No city distribution data yet.</p>
          ) : (
            <div className="bar-list">
              {leadsByCity.slice(0, 5).map((c) => (
                <div className="bar-row" key={c._id || 'Unknown'}>
                  <div className="bar-meta">
                    <strong>{c._id || 'Unspecified'}</strong>
                    <span style={{ color: 'var(--muted)' }}>{c.count} leads • avg {Math.round(c.avgPoints || 0)} pts</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.round((c.count / maxCityCount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Activity size={14} /> Claims Distribution</span>
            <Link to="/claims" className="analysis-link">View Claims</Link>
          </div>
          {claimsByStatus.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No claims recorded yet.</p>
          ) : (
            <div className="bar-list">
              {claimsByStatus.map((c) => (
                <div className="bar-row" key={c._id}>
                  <div className="bar-meta">
                    <strong>{c._id}</strong>
                    <span style={{ color: 'var(--muted)' }}>{c.count} ({(c.totalPoints || 0).toLocaleString()} pts)</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill amber" style={{ width: `${Math.round((c.count / maxClaimCount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><TrendingUp size={14} /> Monthly Revenue</span>
            <Link to="/reports" className="analysis-link">Full Reports</Link>
          </div>
          {revenueByMonth.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No captured Razorpay revenue yet.</p>
          ) : (
            <div className="bar-list">
              {revenueByMonth.slice(-5).map((m) => (
                <div className="bar-row" key={m._id}>
                  <div className="bar-meta">
                    <strong>{m._id}</strong>
                    <span style={{ color: 'var(--muted)' }}>₹{(m.revenueInr || 0).toLocaleString()} ({m.paymentsCount})</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill green" style={{ width: `${Math.round((m.revenueInr / maxRev) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="card">
        <div className="header-row" style={{ marginBottom: 10 }}>
          <h3>Recent Administrative Audit Activity</h3>
          <Link to="/settings-audit" className="analysis-link">View Full Audit Trail →</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Module</th>
                <th>Admin</th>
                <th>Reason</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.recentAudits || []).length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>No recent audit events.</td></tr>
              ) : (
                dashboard.recentAudits.map((a) => (
                  <tr key={a._id}>
                    <td><span className="badge badge-blue">{a.action}</span></td>
                    <td>{a.module}</td>
                    <td>{a.actorEmail || 'System'}</td>
                    <td>{a.reason || '-'}</td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
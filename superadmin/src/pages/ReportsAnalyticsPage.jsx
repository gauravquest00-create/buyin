import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Activity, RotateCcw, TrendingUp, IndianRupee, Layers,
  KeyRound, ArrowUpRight, RefreshCw, Download,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

export function ReportsAnalyticsPage() {
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/reports/summary');
      setReport(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReport(false);
  }, [loadReport]);

  const leadsByCity = report?.leadsByCity || [];
  const claimsByStatus = report?.claimsByStatus || [];
  const refundsByStatus = report?.refundsByStatus || [];
  const revenueByMonth = report?.revenueByMonth || [];

  const totalLeads = leadsByCity.reduce((s, x) => s + (x.count || 0), 0);
  const totalClaims = claimsByStatus.reduce((s, x) => s + (x.count || 0), 0);
  const totalClaimPoints = claimsByStatus.reduce((s, x) => s + (x.totalPoints || 0), 0);
  const totalRefunds = refundsByStatus.reduce((s, x) => s + (x.count || 0), 0);
  const totalRefundedPoints = refundsByStatus.reduce((s, x) => s + (x.totalRefundedPoints || 0), 0);
  const totalRevenueInr = revenueByMonth.reduce((s, x) => s + (x.revenueInr || 0), 0);
  const totalPayments = revenueByMonth.reduce((s, x) => s + (x.paymentsCount || 0), 0);

  const maxCity = Math.max(1, ...leadsByCity.map((c) => c.count || 0));
  const maxClaim = Math.max(1, ...claimsByStatus.map((c) => c.count || 0));
  const maxRefund = Math.max(1, ...refundsByStatus.map((r) => r.count || 0));
  const maxRev = Math.max(1, ...revenueByMonth.map((m) => m.revenueInr || 0));

  const exportCsv = () => {
    const rows = [
      ['Section', 'Category', 'Count', 'Secondary Metric'],
      ...leadsByCity.map((c) => ['Leads by City', c._id || 'Unspecified', c.count, `Avg ${Math.round(c.avgPoints || 0)} pts`]),
      ...claimsByStatus.map((c) => ['Claims by Status', c._id, c.count, `${c.totalPoints || 0} pts`]),
      ...refundsByStatus.map((r) => ['Refunds by Status', r._id, r.count, `${r.totalRefundedPoints || 0} pts`]),
      ...revenueByMonth.map((m) => ['Monthly Revenue', m._id, m.paymentsCount, `INR ${m.revenueInr || 0}`]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyin-analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Analytics CSV report downloaded');
  };

  if (loading) {
    return (
      <div className="dash-wrap">
        <div className="header-row">
          <div className="dash-skeleton" style={{ width: 240, height: 26 }} />
          <div className="dash-skeleton" style={{ width: 170, height: 30 }} />
        </div>
        <div className="dash-kpi-grid">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="dash-skeleton" style={{ height: 96 }} />)}
        </div>
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="dash-skeleton" style={{ height: 240 }} />)}
        </div>
      </div>
    );
  }

  const SUMMARY_CARDS = [
    { label: 'Total Leads Tracked', value: totalLeads.toLocaleString(), hint: 'Open lead management', to: '/leads', icon: Layers, tone: 'navy' },
    { label: 'Total Claims Processed', value: totalClaims.toLocaleString(), hint: 'Inspect all claims', to: '/claims', icon: KeyRound, tone: 'blue' },
    { label: 'Claim Points Volume', value: `${totalClaimPoints.toLocaleString()} pts`, hint: 'View pricing engine', to: '/pricing', icon: Activity, tone: 'amber' },
    { label: 'Refunds & Credited Pts', value: `${totalRefunds} (${totalRefundedPoints.toLocaleString()} pts)`, hint: 'Open refund queue', to: '/refunds', icon: RotateCcw, tone: 'red' },
    { label: 'Captured Revenue', value: `₹${totalRevenueInr.toLocaleString()}`, hint: `${totalPayments} payments`, to: '/payments', icon: IndianRupee, tone: 'green' },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Reports & Business Analytics</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Detailed city demand, claim lifecycle, refund rate, and monthly Razorpay revenue breakdown.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadReport(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={exportCsv}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Clickable Summary KPI Cards */}
      <div className="dash-kpi-grid">
        {SUMMARY_CARDS.map(({ label, value, hint, to, icon: Icon, tone }, idx) => (
          <Link key={label} to={to} className="dash-kpi-card" style={{ animationDelay: `${idx * 40}ms` }}>
            <div className="dash-kpi-top">
              <span className={`dash-kpi-icon ${tone}`}><Icon size={16} /></span>
              <ArrowUpRight size={15} className="dash-kpi-arrow" />
            </div>
            <div className="dash-kpi-value">{value}</div>
            <div className="dash-kpi-label">{label}</div>
            <div className="dash-kpi-hint">{hint} →</div>
          </Link>
        ))}
      </div>

      {/* Detailed Visual + Tabular Sections */}
      <div className="grid-2">
        {/* 1. Leads by City */}
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><MapPin size={14} /> Leads by City (Detailed)</span>
            <Link to="/leads" className="analysis-link">View Leads →</Link>
          </div>
          {leadsByCity.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No leads recorded yet.</p>
          ) : (
            <>
              <div className="bar-list">
                {leadsByCity.map((c) => {
                  const pct = totalLeads ? Math.round((c.count / totalLeads) * 100) : 0;
                  return (
                    <div className="bar-row" key={c._id || 'Unknown'}>
                      <div className="bar-meta">
                        <strong>{c._id || 'Unspecified'}</strong>
                        <span style={{ color: 'var(--muted)' }}>{c.count} leads ({pct}%) • avg {Math.round(c.avgPoints || 0)} pts</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${Math.round((c.count / maxCity) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="table-wrap" style={{ marginTop: 6 }}>
                <table className="table" style={{ minWidth: 380 }}>
                  <thead><tr><th>City</th><th>Leads</th><th>Share</th><th>Avg Cost</th></tr></thead>
                  <tbody>
                    {leadsByCity.map((c) => (
                      <tr key={c._id || 'Unknown'}>
                        <td><strong>{c._id || 'Unspecified'}</strong></td>
                        <td>{c.count}</td>
                        <td>{totalLeads ? Math.round((c.count / totalLeads) * 100) : 0}%</td>
                        <td><span className="badge badge-blue">{Math.round(c.avgPoints || 0)} pts</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* 2. Claims by Status */}
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Activity size={14} /> Claims Lifecycle Breakdown</span>
            <Link to="/claims" className="analysis-link">View Claims →</Link>
          </div>
          {claimsByStatus.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No claims recorded yet.</p>
          ) : (
            <>
              <div className="bar-list">
                {claimsByStatus.map((c) => {
                  const pct = totalClaims ? Math.round((c.count / totalClaims) * 100) : 0;
                  return (
                    <div className="bar-row" key={c._id}>
                      <div className="bar-meta">
                        <strong>{c._id}</strong>
                        <span style={{ color: 'var(--muted)' }}>{c.count} ({pct}%) • {(c.totalPoints || 0).toLocaleString()} pts</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill amber" style={{ width: `${Math.round((c.count / maxClaim) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="table-wrap" style={{ marginTop: 6 }}>
                <table className="table" style={{ minWidth: 380 }}>
                  <thead><tr><th>Status</th><th>Claims</th><th>Share</th><th>Total Points</th></tr></thead>
                  <tbody>
                    {claimsByStatus.map((c) => (
                      <tr key={c._id}>
                        <td><span className="badge badge-amber">{c._id}</span></td>
                        <td><strong>{c.count}</strong></td>
                        <td>{totalClaims ? Math.round((c.count / totalClaims) * 100) : 0}%</td>
                        <td>{(c.totalPoints || 0).toLocaleString()} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* 3. Refunds & Disputes Analytics */}
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><RotateCcw size={14} /> Refunds & Disputes Analysis</span>
            <Link to="/refunds" className="analysis-link">View Refunds →</Link>
          </div>
          {refundsByStatus.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No refund requests submitted yet.</p>
          ) : (
            <>
              <div className="bar-list">
                {refundsByStatus.map((r) => (
                  <div className="bar-row" key={r._id}>
                    <div className="bar-meta">
                      <strong>{r._id}</strong>
                      <span style={{ color: 'var(--muted)' }}>{r.count} requests • {(r.totalRefundedPoints || 0).toLocaleString()} pts</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.round((r.count / maxRefund) * 100)}%`, background: 'var(--danger)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-wrap" style={{ marginTop: 6 }}>
                <table className="table" style={{ minWidth: 380 }}>
                  <thead><tr><th>Refund Status</th><th>Count</th><th>Refundable Pts (95%)</th></tr></thead>
                  <tbody>
                    {refundsByStatus.map((r) => (
                      <tr key={r._id}>
                        <td><span className="badge badge-red">{r._id}</span></td>
                        <td><strong>{r.count}</strong></td>
                        <td>{(r.totalRefundedPoints || 0).toLocaleString()} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* 4. Monthly Revenue Analytics */}
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><TrendingUp size={14} /> Monthly Revenue & Payment Volume</span>
            <Link to="/payments" className="analysis-link">View Payments →</Link>
          </div>
          {revenueByMonth.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>No captured Razorpay payments yet.</p>
          ) : (
            <>
              <div className="bar-list">
                {revenueByMonth.map((m) => (
                  <div className="bar-row" key={m._id}>
                    <div className="bar-meta">
                      <strong>{m._id}</strong>
                      <span style={{ color: 'var(--muted)' }}>₹{(m.revenueInr || 0).toLocaleString()} • {m.paymentsCount} payments</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill green" style={{ width: `${Math.round((m.revenueInr / maxRev) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="table-wrap" style={{ marginTop: 6 }}>
                <table className="table" style={{ minWidth: 380 }}>
                  <thead><tr><th>Month</th><th>Payments</th><th>Revenue (INR)</th><th>Avg Ticket</th></tr></thead>
                  <tbody>
                    {revenueByMonth.map((m) => (
                      <tr key={m._id}>
                        <td><strong>{m._id}</strong></td>
                        <td>{m.paymentsCount}</td>
                        <td><span className="badge badge-green">₹{(m.revenueInr || 0).toLocaleString()}</span></td>
                        <td>₹{m.paymentsCount ? Math.round(m.revenueInr / m.paymentsCount).toLocaleString() : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
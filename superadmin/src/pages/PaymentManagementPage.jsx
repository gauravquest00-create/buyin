import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee, CheckCircle2, Clock, XCircle, Webhook,
  RefreshCw, ArrowUpRight, ExternalLink, CreditCard, ShieldCheck,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const PAYMENT_STATUSES = ['CAPTURED', 'PENDING', 'FAILED', 'CANCELLED', 'REFUNDED'];

function payBadgeClass(status) {
  if (status === 'CAPTURED') return 'badge-green';
  if (status === 'PENDING') return 'badge-amber';
  if (['FAILED', 'CANCELLED'].includes(status)) return 'badge-red';
  return 'badge-blue';
}

export function PaymentManagementPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('PAYMENTS');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([
        adminApi.get('/payments', statusFilter ? { status: statusFilter } : {}),
        adminApi.get('/payments/events'),
      ]);
      setPayments(pRes.data.payments || []);
      setEvents(eRes.data.events || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      const res = await adminApi.post('/payments/reconcile');
      const d = res.data || {};
      showToast(d.skipped ? `Reconciliation skipped: ${d.reason}` : `Checked ${d.checked ?? 0} pending order(s), reconciled ${d.reconciled ?? 0}`);
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReconciling(false);
    }
  };

  const capturedList = payments.filter((p) => p.status === 'CAPTURED');
  const capturedRevenue = capturedList.reduce((s, p) => s + (p.amountInr || 0), 0);
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const failedCount = payments.filter((p) => ['FAILED', 'CANCELLED'].includes(p.status)).length;

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [
      p.internalTransactionId,
      p.razorpayOrderId,
      p.razorpayPaymentId,
      p.userId?.fullName,
      p.userId?.email,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const filteredEvents = events.filter((ev) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [ev.eventId, ev.eventType, ev.razorpayOrderId, ev.razorpayPaymentId]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const KPI_CARDS = [
    { label: 'Captured Revenue', value: `₹${capturedRevenue.toLocaleString()}`, hint: 'Filter captured', icon: IndianRupee, tone: 'green', onClick: () => { setActiveTab('PAYMENTS'); setStatusFilter('CAPTURED'); } },
    { label: 'Captured Orders', value: capturedList.length, hint: 'All orders', icon: CheckCircle2, tone: 'blue', onClick: () => { setActiveTab('PAYMENTS'); setStatusFilter(''); } },
    { label: 'Pending Orders', value: pendingCount, hint: 'Filter pending', icon: Clock, tone: 'amber', onClick: () => { setActiveTab('PAYMENTS'); setStatusFilter('PENDING'); } },
    { label: 'Failed / Cancelled', value: failedCount, hint: 'Filter failed', icon: XCircle, tone: 'red', onClick: () => { setActiveTab('PAYMENTS'); setStatusFilter('FAILED'); } },
    { label: 'Webhook Events', value: events.length, hint: 'Inspect webhooks', icon: Webhook, tone: 'navy', onClick: () => setActiveTab('EVENTS') },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Recharge & Razorpay Payments</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Verify Razorpay orders, inspect raw-body webhook events, and reconcile pending wallet credits.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadData(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" type="button" disabled={reconciling} onClick={handleReconcile}>
            <ShieldCheck size={14} /> {reconciling ? 'Reconciling...' : 'Run Reconciliation'}
          </button>
        </div>
      </div>

      {/* Clickable KPI Cards */}
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

      {/* Tabs + Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className={`btn btn-sm ${activeTab === 'PAYMENTS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('PAYMENTS')}>
            <CreditCard size={13} /> Payment Orders ({payments.length})
          </button>
          <button type="button" className={`btn btn-sm ${activeTab === 'EVENTS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('EVENTS')}>
            <Webhook size={13} /> Webhook Events ({events.length})
          </button>
        </div>
        <input
          className="input"
          style={{ flex: '2 1 220px' }}
          placeholder={activeTab === 'PAYMENTS' ? 'Search internal txn ID, Razorpay order/payment ID, user...' : 'Search event ID, type, Razorpay order/payment ID...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {activeTab === 'PAYMENTS' && (
          <select className="select" style={{ flex: '1 1 160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Payment Statuses</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : activeTab === 'PAYMENTS' ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Internal Txn</th>
                <th>User</th>
                <th>Amount & Points</th>
                <th>Razorpay IDs</th>
                <th>Status</th>
                <th>Wallet Credited</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No payment orders found.</td></tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.internalTransactionId}</strong></td>
                    <td>
                      {p.userId ? (
                        <Link to={`/users/${p.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {p.userId.fullName} <ExternalLink size={11} />
                        </Link>
                      ) : '-'}
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.userId?.email}</div>
                    </td>
                    <td>
                      <strong>₹{(p.amountInr || 0).toLocaleString()}</strong>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {p.totalPoints} pts ({p.basePoints} + {p.bonusPoints || 0} bonus)
                      </div>
                    </td>
                    <td style={{ fontSize: 11.5 }}>
                      <div>Order: {p.razorpayOrderId}</div>
                      {p.razorpayPaymentId && <div style={{ color: 'var(--muted)' }}>Pay: {p.razorpayPaymentId}</div>}
                    </td>
                    <td><span className={`badge ${payBadgeClass(p.status)}`}>{p.status}</span></td>
                    <td>
                      <span className={`badge ${p.walletCredited ? 'badge-green' : 'badge-gray'}`}>
                        {p.walletCredited ? 'Credited' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Event ID</th>
                <th>Razorpay Order / Payment</th>
                <th>HMAC Signature</th>
                <th>Processed</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No Razorpay webhook events logged yet.</td></tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev._id}>
                    <td><span className="badge badge-blue">{ev.eventType}</span></td>
                    <td style={{ fontSize: 11.5 }}>{ev.eventId}</td>
                    <td style={{ fontSize: 11.5 }}>
                      <div>{ev.razorpayOrderId || '-'}</div>
                      <div style={{ color: 'var(--muted)' }}>{ev.razorpayPaymentId || '-'}</div>
                    </td>
                    <td>
                      <span className={`badge ${ev.signatureVerified ? 'badge-green' : 'badge-red'}`}>
                        {ev.signatureVerified ? 'Verified' : 'Invalid'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ev.processed ? 'badge-green' : 'badge-amber'}`}>
                        {ev.processed ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(ev.createdAt).toLocaleString()}</td>
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
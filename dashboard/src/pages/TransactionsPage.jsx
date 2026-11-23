import React, { useEffect, useState, useCallback } from 'react';
import {
  Receipt, ArrowDownLeft, ArrowUpRight, RotateCcw,
  RefreshCw, Download,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

const TX_TYPES = [
  'RECHARGE',
  'BONUS_CREDIT',
  'CLAIM_DEDUCTION',
  'EXTENSION_DEDUCTION',
  'REFUND_CREDIT',
  'MANUAL_CREDIT',
  'MANUAL_DEBIT',
];

export function TransactionsPage() {
  const { showToast } = useToast();
  const [txs, setTxs] = useState([]);
  const [type, setType] = useState('');
  const [direction, setDirection] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTxs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiClient.get('/transactions', {
        limit: 100,
        ...(type ? { type } : {}),
        ...(direction ? { direction } : {}),
      });
      setTxs(res.data.transactions || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, direction, showToast]);

  useEffect(() => {
    loadTxs(false);
  }, [loadTxs]);

  const filtered = txs.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [t.txCode, t.type, t.reason]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const totalCredits = txs.filter((t) => t.direction === 'CREDIT').reduce((s, t) => s + (t.points || 0), 0);
  const totalDebits = txs.filter((t) => t.direction === 'DEBIT').reduce((s, t) => s + (t.points || 0), 0);
  const refundCredits = txs.filter((t) => t.type === 'REFUND_CREDIT').reduce((s, t) => s + (t.points || 0), 0);

  const exportCsv = () => {
    const rows = [
      ['Code', 'Type', 'Direction', 'Points', 'Balance Before', 'Balance After', 'Reason', 'Date'],
      ...filtered.map((t) => [
        t.txCode,
        t.type,
        t.direction,
        t.points,
        t.balanceBefore,
        t.balanceAfter,
        t.reason,
        new Date(t.createdAt).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `buyin-wallet-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Wallet ledger CSV downloaded');
  };

  return (
    <div className="dash-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Immutable Wallet Ledger</h1>
          <p className="page-subtitle">Every recharge, claim deduction, extension, bonus, and refund credit is permanently recorded.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadTxs(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Clickable Filter KPI Cards */}
      <div className="kpi-grid">
        <div
          className="kpi-card clickable"
          style={{ borderColor: !type && !direction ? 'var(--color-primary)' : undefined }}
          onClick={() => { setType(''); setDirection(''); }}
        >
          <div className="kpi-top"><span className="kpi-icon navy"><Receipt size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{txs.length}</div>
          <div className="kpi-label">Total Ledger Entries</div>
          <div className="kpi-sub">Show all</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: direction === 'CREDIT' ? 'var(--color-primary)' : undefined }}
          onClick={() => { setType(''); setDirection('CREDIT'); }}
        >
          <div className="kpi-top"><span className="kpi-icon green"><ArrowDownLeft size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">+{totalCredits.toLocaleString()} pts</div>
          <div className="kpi-label">Total Credits</div>
          <div className="kpi-sub">Filter credits</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: direction === 'DEBIT' ? 'var(--color-primary)' : undefined }}
          onClick={() => { setType(''); setDirection('DEBIT'); }}
        >
          <div className="kpi-top"><span className="kpi-icon red"><ArrowUpRight size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">-{totalDebits.toLocaleString()} pts</div>
          <div className="kpi-label">Total Debits</div>
          <div className="kpi-sub">Filter debits</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: type === 'REFUND_CREDIT' ? 'var(--color-primary)' : undefined }}
          onClick={() => { setType('REFUND_CREDIT'); setDirection(''); }}
        >
          <div className="kpi-top"><span className="kpi-icon amber"><RotateCcw size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">+{refundCredits.toLocaleString()} pts</div>
          <div className="kpi-label">Refund Credits</div>
          <div className="kpi-sub">Filter refunds</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="filter-bar">
          <input
            className="input"
            placeholder="Search by transaction code, type, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Transaction Types</option>
            {TX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="select" value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="">All Directions</option>
            <option value="CREDIT">Credits (+)</option>
            <option value="DEBIT">Debits (-)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="skeleton" style={{ height: 260 }} />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Points</th>
                <th>Balance Change</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--color-muted)' }}>No transactions match your filters.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.txCode}</strong></td>
                    <td><StatusBadge status={t.type} /></td>
                    <td style={{ fontWeight: 700, color: t.direction === 'CREDIT' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {t.direction === 'CREDIT' ? '+' : '-'}{t.points} pts
                    </td>
                    <td>{t.balanceBefore} -&gt; <strong>{t.balanceAfter}</strong></td>
                    <td>{t.reason}</td>
                    <td style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>{new Date(t.createdAt).toLocaleString()}</td>
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
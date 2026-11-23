import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, Coins, Gift, TrendingDown, RotateCcw,
  RefreshCw, PlusCircle, ExternalLink, Receipt,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const TX_TYPES = [
  'RECHARGE',
  'BONUS_CREDIT',
  'CLAIM_DEDUCTION',
  'EXTENSION_DEDUCTION',
  'REFUND_CREDIT',
  'MANUAL_CREDIT',
  'MANUAL_DEBIT',
];

export function WalletManagementPage() {
  const { showToast } = useToast();
  const [wallets, setWallets] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [activeTab, setActiveTab] = useState('WALLETS');
  const [search, setSearch] = useState('');
  const [txType, setTxType] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Adjustment Modal
  const [showAdj, setShowAdj] = useState(false);
  const [adj, setAdj] = useState({ userId: '', direction: 'CREDIT', points: 100, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [wRes, lRes] = await Promise.all([
        adminApi.get('/wallets'),
        adminApi.get('/wallets/ledger', txType ? { type: txType } : {}),
      ]);
      setWallets(wRes.data.wallets || []);
      setLedger(lRes.data.transactions || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [txType, showToast]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const openAdjustForUser = (userId = '') => {
    setAdj({ userId, direction: 'CREDIT', points: 100, reason: '' });
    setShowAdj(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.post('/wallets/adjust', {
        userId: adj.userId,
        direction: adj.direction,
        points: Number(adj.points),
        reason: adj.reason.trim(),
      });
      showToast(`Wallet ${adj.direction.toLowerCase()}ed via immutable ledger`);
      setShowAdj(false);
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = wallets.reduce((s, w) => s + (w.balancePoints || 0), 0);
  const totalRecharged = wallets.reduce((s, w) => s + (w.totalRechargedPoints || 0), 0);
  const totalBonus = wallets.reduce((s, w) => s + (w.totalBonusPoints || 0), 0);
  const totalSpent = wallets.reduce((s, w) => s + (w.totalSpentPoints || 0), 0);
  const totalRefunded = wallets.reduce((s, w) => s + (w.totalRefundedPoints || 0), 0);

  const filteredWallets = wallets.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [w.userId?.fullName, w.userId?.email, w.userId?.mobile, w.userId?.agencyName]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const filteredLedger = ledger.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [t.txCode, t.reason, t.type, t.userId?.fullName, t.userId?.email]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const selectedWallet = wallets.find((w) => String(w.userId?._id) === String(adj.userId));
  const currentBal = selectedWallet?.balancePoints ?? 0;
  const ptsNum = Math.max(0, Number(adj.points) || 0);
  const expectedBal = adj.direction === 'CREDIT' ? currentBal + ptsNum : currentBal - ptsNum;

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Wallet Management & Ledger</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Inspect professional point balances, audit the immutable ledger, and apply audited manual adjustments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadData(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => openAdjustForUser('')}>
            <PlusCircle size={14} /> Manual Adjustment
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card" onClick={() => setActiveTab('WALLETS')}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon blue"><Wallet size={16} /></span></div>
          <div className="dash-kpi-value">{totalBalance.toLocaleString()} pts</div>
          <div className="dash-kpi-label">Active Wallet Balances ({wallets.length} users)</div>
        </div>
        <div className="dash-kpi-card" onClick={() => { setActiveTab('LEDGER'); setTxType('RECHARGE'); }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon green"><Coins size={16} /></span></div>
          <div className="dash-kpi-value">{totalRecharged.toLocaleString()} pts</div>
          <div className="dash-kpi-label">Total Recharged</div>
        </div>
        <div className="dash-kpi-card" onClick={() => { setActiveTab('LEDGER'); setTxType('BONUS_CREDIT'); }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon amber"><Gift size={16} /></span></div>
          <div className="dash-kpi-value">{totalBonus.toLocaleString()} pts</div>
          <div className="dash-kpi-label">Bonus Points Issued</div>
        </div>
        <div className="dash-kpi-card" onClick={() => { setActiveTab('LEDGER'); setTxType('CLAIM_DEDUCTION'); }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon navy"><TrendingDown size={16} /></span></div>
          <div className="dash-kpi-value">{totalSpent.toLocaleString()} pts</div>
          <div className="dash-kpi-label">Spent on Claims & Extensions</div>
        </div>
        <div className="dash-kpi-card" onClick={() => { setActiveTab('LEDGER'); setTxType('REFUND_CREDIT'); }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon red"><RotateCcw size={16} /></span></div>
          <div className="dash-kpi-value">{totalRefunded.toLocaleString()} pts</div>
          <div className="dash-kpi-label">Refund Credits Issued</div>
        </div>
      </div>

      {/* Tabs + Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className={`btn btn-sm ${activeTab === 'WALLETS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('WALLETS')}>
            <Wallet size={13} /> User Wallets ({wallets.length})
          </button>
          <button type="button" className={`btn btn-sm ${activeTab === 'LEDGER' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('LEDGER')}>
            <Receipt size={13} /> Immutable Ledger ({ledger.length})
          </button>
        </div>
        <input
          className="input"
          style={{ flex: '2 1 220px' }}
          placeholder={activeTab === 'WALLETS' ? 'Search professional name, email, mobile...' : 'Search tx code, user, or reason...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {activeTab === 'LEDGER' && (
          <select className="select" style={{ flex: '1 1 170px' }} value={txType} onChange={(e) => setTxType(e.target.value)}>
            <option value="">All Transaction Types</option>
            {TX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : activeTab === 'WALLETS' ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Current Balance</th>
                <th>Recharged</th>
                <th>Bonus</th>
                <th>Spent</th>
                <th>Refunded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallets.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No wallets found.</td></tr>
              ) : (
                filteredWallets.map((w) => (
                  <tr key={w._id}>
                    <td>
                      {w.userId ? (
                        <Link to={`/users/${w.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {w.userId.fullName} <ExternalLink size={12} />
                        </Link>
                      ) : '-'}
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{w.userId?.email}</div>
                    </td>
                    <td><span className="badge badge-blue" style={{ fontSize: 12 }}>{(w.balancePoints ?? 0).toLocaleString()} pts</span></td>
                    <td>{(w.totalRechargedPoints ?? 0).toLocaleString()}</td>
                    <td>{(w.totalBonusPoints ?? 0).toLocaleString()}</td>
                    <td>{(w.totalSpentPoints ?? 0).toLocaleString()}</td>
                    <td>{(w.totalRefundedPoints ?? 0).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openAdjustForUser(w.userId?._id || '')}
                      >
                        Adjust
                      </button>
                    </td>
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
                <th>Tx Code</th>
                <th>User</th>
                <th>Type</th>
                <th>Points</th>
                <th>Before → After</th>
                <th>Reason</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No ledger entries found.</td></tr>
              ) : (
                filteredLedger.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.txCode}</strong></td>
                    <td>
                      {t.userId ? (
                        <Link to={`/users/${t.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          {t.userId.fullName}
                        </Link>
                      ) : '-'}
                    </td>
                    <td><span className="badge badge-gray">{t.type}</span></td>
                    <td style={{ fontWeight: 700, color: t.direction === 'CREDIT' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.direction === 'CREDIT' ? '+' : '-'}{t.points} pts
                    </td>
                    <td>{t.balanceBefore} → <strong>{t.balanceAfter}</strong></td>
                    <td>{t.reason}</td>
                    <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Adjustment Modal with Live Balance Transparency */}
      {showAdj && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
          }}
          onClick={() => setShowAdj(false)}
        >
          <form className="card" style={{ width: '100%', maxWidth: 480, padding: 20 }} onClick={(e) => e.stopPropagation()} onSubmit={handleAdjustSubmit}>
            <div className="header-row" style={{ marginBottom: 12 }}>
              <h3>Manual Wallet Adjustment</h3>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdj(false)}>Close</button>
            </div>

            <div className="form-group">
              <label className="form-label">Select Professional</label>
              <select className="select" required value={adj.userId} onChange={(e) => setAdj({ ...adj, userId: e.target.value })}>
                <option value="">Choose user...</option>
                {wallets.map((w) => (
                  <option key={w._id} value={w.userId?._id}>
                    {w.userId?.fullName} ({w.userId?.email}) — {w.balancePoints} pts
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Direction</label>
                <select className="select" value={adj.direction} onChange={(e) => setAdj({ ...adj, direction: e.target.value })}>
                  <option value="CREDIT">Credit (+)</option>
                  <option value="DEBIT">Debit (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Points</label>
                <input className="input" type="number" min={1} max={100000} required value={adj.points} onChange={(e) => setAdj({ ...adj, points: e.target.value })} />
              </div>
            </div>

            {selectedWallet && (
              <div style={{ background: 'var(--canvas)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Balance</span><strong>{currentBal.toLocaleString()} pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Adjustment</span>
                  <strong style={{ color: adj.direction === 'CREDIT' ? 'var(--success)' : 'var(--danger)' }}>
                    {adj.direction === 'CREDIT' ? '+' : '-'}{ptsNum.toLocaleString()} pts
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 4 }}>
                  <span>Expected Final Balance</span>
                  <strong style={{ color: expectedBal < 0 ? 'var(--danger)' : 'var(--navy-dark)' }}>
                    {expectedBal.toLocaleString()} pts
                  </strong>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mandatory Audit Reason</label>
              <input className="input" required minLength={5} placeholder="Reason recorded permanently in audit & ledger..." value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdj(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="submit" disabled={submitting || expectedBal < 0}>
                {submitting ? 'Applying...' : `Confirm ${adj.direction}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
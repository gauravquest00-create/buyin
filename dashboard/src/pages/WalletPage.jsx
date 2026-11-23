import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, Coins, Gift, RotateCcw, RefreshCw, ArrowUpRight,
  CreditCard, ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { FinancialSummaryBox } from '../components/FinancialSummaryBox.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function WalletPage() {
  const { user, setWalletBalance } = useAuth();
  const { showToast } = useToast();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [customInr, setCustomInr] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastPaymentResult, setLastPaymentResult] = useState(null);

  const loadWallet = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiClient.get('/wallet');
      setOverview(res.data);
      setWalletBalance(res.data.wallet?.balancePoints ?? 0);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setWalletBalance, showToast]);

  useEffect(() => {
    loadWallet(false);
  }, [loadWallet]);

  const currentBalance = overview?.wallet?.balancePoints ?? 0;
  const customAmountNum = Number(customInr);
  const activeQuote = selectedPkg
    ? {
        amountInr: selectedPkg.amountInr,
        basePoints: selectedPkg.basePoints,
        bonusPoints: selectedPkg.bonusPoints,
        totalPoints: selectedPkg.totalPoints,
        packageCode: selectedPkg.code,
      }
    : customAmountNum >= 500
    ? {
        amountInr: customAmountNum,
        basePoints: Math.round(customAmountNum * 0.9),
        bonusPoints: 0,
        totalPoints: Math.round(customAmountNum * 0.9),
        customAmountInr: customAmountNum,
      }
    : null;

  const initiateRazorpayCheckout = async () => {
    if (!activeQuote) return;
    setProcessing(true);
    setLastPaymentResult(null);
    try {
      const orderRes = await apiClient.post('/recharge/create-order', {
        packageCode: activeQuote.packageCode,
        customAmountInr: activeQuote.customAmountInr,
      });
      const { checkout } = orderRes.data;

      if (!window.Razorpay) {
        showToast('Razorpay Checkout script not loaded. Check your internet connection.', 'error');
        return;
      }

      const rzp = new window.Razorpay({
        key: checkout.razorpayKeyId,
        amount: checkout.amountPaise,
        currency: checkout.currency,
        name: 'BUYIN',
        description: `Wallet Recharge (${activeQuote.totalPoints} Claim Points)`,
        order_id: checkout.razorpayOrderId,
        prefill: { name: user?.fullName, email: user?.email, contact: user?.mobile },
        handler: async (response) => {
          try {
            await apiClient.post('/recharge/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setLastPaymentResult({
              ok: true,
              message: `Rs. ${activeQuote.amountInr.toLocaleString()} verified! +${activeQuote.totalPoints} claim points credited.`,
            });
            showToast(`Payment verified! +${activeQuote.totalPoints} claim points credited.`);
            await loadWallet(true);
          } catch (verifyErr) {
            setLastPaymentResult({ ok: false, message: verifyErr.message });
            showToast(verifyErr.message, 'error');
          }
        },
      });
      rzp.on('payment.failed', (fail) => {
        const msg = fail.error?.description || 'Payment failed. You can retry anytime.';
        setLastPaymentResult({ ok: false, message: msg });
        showToast(msg, 'error');
      });
      rzp.open();
    } catch (err) {
      setLastPaymentResult({ ok: false, message: err.message });
      showToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-wrap">
        <div className="page-header">
          <div className="skeleton" style={{ width: 200, height: 26 }} />
          <div className="skeleton" style={{ width: 96, height: 30 }} />
        </div>
        <div className="kpi-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 96 }} />)}
        </div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 260 }} />
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Wallet &amp; Recharge</h1>
          <p className="page-subtitle">Transparent claim-point packages powered by Razorpay Checkout.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/transactions" className="btn btn-secondary btn-sm">Full Ledger</Link>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadWallet(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon blue"><Wallet size={15} /></span></div>
          <div className="kpi-value">{currentBalance.toLocaleString()} pts</div>
          <div className="kpi-label">Available Balance</div>
        </div>
        <Link to="/transactions" className="kpi-card clickable">
          <div className="kpi-top"><span className="kpi-icon green"><Coins size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{(overview?.wallet?.totalRechargedPoints ?? 0).toLocaleString()} pts</div>
          <div className="kpi-label">Total Recharged</div>
          <div className="kpi-sub">View ledger</div>
        </Link>
        <Link to="/transactions" className="kpi-card clickable">
          <div className="kpi-top"><span className="kpi-icon amber"><Gift size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{(overview?.wallet?.totalBonusPoints ?? 0).toLocaleString()} pts</div>
          <div className="kpi-label">Bonus Points Earned</div>
          <div className="kpi-sub">View credits</div>
        </Link>
        <Link to="/transactions" className="kpi-card clickable">
          <div className="kpi-top"><span className="kpi-icon red"><RotateCcw size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{(overview?.wallet?.totalRefundedPoints ?? 0).toLocaleString()} pts</div>
          <div className="kpi-label">Total Refunded</div>
          <div className="kpi-sub">View refunds</div>
        </Link>
      </div>

      {lastPaymentResult && (
        <div
          className="card"
          style={{
            borderColor: lastPaymentResult.ok ? 'var(--color-success)' : 'var(--color-danger)',
            background: lastPaymentResult.ok ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
            fontSize: 12.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span><strong>{lastPaymentResult.ok ? 'Recharge Complete:' : 'Payment Unsuccessful:'}</strong> {lastPaymentResult.message}</span>
          {!lastPaymentResult.ok && activeQuote && (
            <button className="btn btn-primary btn-sm" type="button" onClick={initiateRazorpayCheckout}>Retry Payment</button>
          )}
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Select a Recharge Package</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(overview?.packages || []).map((pkg) => {
              const isSelected = selectedPkg?.code === pkg.code;
              return (
                <button
                  key={pkg.code}
                  type="button"
                  onClick={() => { setSelectedPkg(pkg); setCustomInr(''); }}
                  className="card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '11px 14px',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isSelected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{pkg.name} - Rs. {pkg.amountInr.toLocaleString()}</strong>
                      <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>
                        {pkg.basePoints} base pts {pkg.bonusPoints > 0 ? `+ ${pkg.bonusPoints} bonus pts` : ''}
                      </div>
                    </div>
                    <span className="badge badge-blue">{pkg.totalPoints} pts</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="form-group" style={{ marginTop: 14, marginBottom: 0 }}>
            <label className="form-label">Or Custom Recharge (Min Rs. 500 | 0.9 pts per rupee | No bonus)</label>
            <input
              className="input"
              type="number"
              min={500}
              placeholder="Enter amount in INR (e.g. 1500)"
              value={customInr}
              onChange={(e) => { setCustomInr(e.target.value); setSelectedPkg(null); }}
            />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={15} /> Checkout Summary
            </h3>
            {activeQuote ? (
              <FinancialSummaryBox
                currentBalance={currentBalance}
                deltaPoints={activeQuote.totalPoints}
                direction="CREDIT"
                reason={`Buyin wallet recharge of Rs. ${activeQuote.amountInr.toLocaleString()}`}
                extraRows={[
                  { label: 'Recharge Amount', value: `Rs. ${activeQuote.amountInr.toLocaleString()}` },
                  { label: 'Base Points', value: `${activeQuote.basePoints} pts` },
                  { label: 'Bonus Points', value: `+${activeQuote.bonusPoints} pts` },
                ]}
              />
            ) : (
              <div className="empty-state">Choose a package or enter Rs. 500+ to preview your expected wallet balance.</div>
            )}
          </div>

          <div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={!activeQuote || processing}
              onClick={initiateRazorpayCheckout}
              type="button"
            >
              <ShieldCheck size={14} /> {processing ? 'Opening Razorpay...' : activeQuote ? `Pay Rs. ${activeQuote.amountInr.toLocaleString()} with Securely` : 'Select Amount to Continue'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', textAlign: 'center', marginTop: 6 }}>
              Points are credited only after server-side Razorpay signature and webhook verification.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: 14 }}>Recent Recharge Payments</h3>
          <Link to="/transactions" style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>View All Transactions</Link>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Txn ID</th><th>Amount</th><th>Points</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {(overview?.recentPayments || []).length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--color-muted)' }}>No recharge payments yet.</td></tr>
              ) : (
                overview.recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.internalTransactionId}</strong></td>
                    <td>Rs. {p.amountInr.toLocaleString()}</td>
                    <td>{p.totalPoints} pts ({p.basePoints} + {p.bonusPoints || 0} bonus)</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>{new Date(p.createdAt).toLocaleString()}</td>
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
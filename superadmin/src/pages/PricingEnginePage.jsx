import React, { useEffect, useState, useCallback } from 'react';
import {
  Sliders, Save, RefreshCw, Coins, Home, Sparkles,
  CalendarCheck, RotateCcw, Calculator, History,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const BUDGET_LABELS = {
  BELOW_50L: 'Below ₹50L',
  '50L_1CR': '₹50L – ₹1Cr',
  '1CR_2CR': '₹1Cr – ₹2Cr',
  '2CR_5CR': '₹2Cr – ₹5Cr',
  '5CR_10CR': '₹5Cr – ₹10Cr',
  '10CR_PLUS': '₹10Cr+',
};

const SIGNAL_LABELS = {
  contactVerified: 'Contact Verified',
  budgetConfirmed: 'Budget Confirmed',
  exactLocationConfig: 'Exact Location / Config',
  purchaseWithin30Days: 'Purchase Within 30 Days',
  purchaseWithin31To90Days: 'Purchase Within 31–90 Days',
  siteVisitRequested: 'Site Visit Requested',
  buyerActivelyResponding: 'Buyer Actively Responding',
  fundingLoanReadiness: 'Funding / Loan Readiness',
};

const VISIT_LABELS = {
  scheduled: 'Site Visit Scheduled',
  completedVerified: 'Completed & Verified Visit',
  multipleVerified: 'Multiple Verified Visits',
};

export function PricingEnginePage() {
  const { showToast } = useToast();
  const [rule, setRule] = useState(null);
  const [history, setHistory] = useState([]);
  const [changeNotes, setChangeNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live Simulator state
  const [sim, setSim] = useState({
    budgetBand: '2CR_5CR',
    propertyType: 'Apartment',
    visitTier: 'none',
    applyFirstReturnDiscount: false,
  });

  const loadPricing = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/pricing');
      setRule(res.data.active);
      setHistory(res.data.history || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPricing(false);
  }, [loadPricing]);

  const updateGroup = (group, key, value) => {
    setRule((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!rule) return;
    setSaving(true);
    try {
      await adminApi.put('/pricing', {
        budgetBasePoints: rule.budgetBasePoints,
        propertyTypeAdditions: rule.propertyTypeAdditions,
        buyerSignals: rule.buyerSignals,
        siteVisitPremiums: rule.siteVisitPremiums,
        returnedLeadDiscounts: rule.returnedLeadDiscounts,
        changeNotes: changeNotes.trim() || 'Updated via Super Admin Pricing Engine',
      });
      showToast('New pricing version published. Historical claims remain immutable.');
      setChangeNotes('');
      loadPricing(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !rule) {
    return (
      <div className="dash-wrap">
        <div className="dash-skeleton" style={{ height: 38, width: 280 }} />
        <div className="dash-kpi-grid">{[1, 2, 3, 4].map((i) => <div key={i} className="dash-skeleton" style={{ height: 92 }} />)}</div>
        <div className="grid-2">{[1, 2, 3, 4].map((i) => <div key={i} className="dash-skeleton" style={{ height: 220 }} />)}</div>
      </div>
    );
  }

  const baseVals = Object.values(rule.budgetBasePoints || {}).map(Number);
  const minBase = baseVals.length ? Math.min(...baseVals) : 0;
  const maxBase = baseVals.length ? Math.max(...baseVals) : 0;
  const maxVisit = Math.max(0, ...Object.values(rule.siteVisitPremiums || {}).map(Number));

  // Live simulation math
  const simBase = Number(rule.budgetBasePoints?.[sim.budgetBand] ?? 0);
  const simProp = Number(rule.propertyTypeAdditions?.[sim.propertyType] ?? 0);
  const simVisit = sim.visitTier === 'none' ? 0 : Number(rule.siteVisitPremiums?.[sim.visitTier] ?? 0);
  const simGross = simBase + simProp + simVisit;
  const simDiscountPct = sim.applyFirstReturnDiscount ? Number(rule.returnedLeadDiscounts?.firstReturnDiscountPercent ?? 0) : 0;
  const simDiscountPts = Math.round((simGross * simDiscountPct) / 100);
  const simFinal = Math.max(1, simGross - simDiscountPts);

  return (
    <form className="dash-wrap" onSubmit={handleSave}>
      <div className="header-row">
        <div>
          <h1>Pricing & Claim Point Engine</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Configure dynamic claim-point rules. Every claim stores an immutable snapshot—updates only affect future claims.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadPricing(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Publishing...' : `Publish v${(rule.version || 1) + 1}`}
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon blue"><Sliders size={16} /></span></div>
          <div className="dash-kpi-value">v{rule.version}</div>
          <div className="dash-kpi-label">Active Pricing Version</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon navy"><Coins size={16} /></span></div>
          <div className="dash-kpi-value">{minBase} – {maxBase} pts</div>
          <div className="dash-kpi-label">Base Budget Tier Range</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon green"><CalendarCheck size={16} /></span></div>
          <div className="dash-kpi-value">+{maxVisit} pts</div>
          <div className="dash-kpi-label">Max Verified Site Visit Premium</div>
        </div>
        <div className="dash-kpi-card" style={{ cursor: 'default' }}>
          <div className="dash-kpi-top"><span className="dash-kpi-icon amber"><RotateCcw size={16} /></span></div>
          <div className="dash-kpi-value">{rule.returnedLeadDiscounts?.firstReturnDiscountPercent ?? 10}%</div>
          <div className="dash-kpi-label">First-Return Discount ({history.length} saved versions)</div>
        </div>
      </div>

      {/* 5 Configurable Pricing Rule Sections */}
      <div className="grid-2">
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Coins size={14} /> Budget Base Claim Points</span>
          </div>
          {Object.entries(rule.budgetBasePoints || {}).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500 }}>{BUDGET_LABELS[k] || k}</label>
              <input
                className="input"
                type="number"
                min={1}
                style={{ width: 110, textAlign: 'right' }}
                value={v}
                onChange={(e) => updateGroup('budgetBasePoints', k, Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Home size={14} /> Property Type Additions (+)</span>
          </div>
          {Object.entries(rule.propertyTypeAdditions || {}).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500 }}>{k}</label>
              <input
                className="input"
                type="number"
                min={0}
                style={{ width: 110, textAlign: 'right' }}
                value={v}
                onChange={(e) => updateGroup('propertyTypeAdditions', k, Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Sparkles size={14} /> Buyer Intent Signals (+)</span>
          </div>
          {Object.entries(rule.buyerSignals || {}).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500 }}>{SIGNAL_LABELS[k] || k}</label>
              <input
                className="input"
                type="number"
                min={0}
                style={{ width: 110, textAlign: 'right' }}
                value={v}
                onChange={(e) => updateGroup('buyerSignals', k, Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="analysis-card">
            <div className="analysis-head">
              <span className="analysis-title"><CalendarCheck size={14} /> Site Visit Premiums (+)</span>
            </div>
            {Object.entries(rule.siteVisitPremiums || {}).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <label style={{ fontSize: 12.5, fontWeight: 500 }}>{VISIT_LABELS[k] || k}</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  style={{ width: 110, textAlign: 'right' }}
                  value={v}
                  onChange={(e) => updateGroup('siteVisitPremiums', k, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="analysis-card">
            <div className="analysis-head">
              <span className="analysis-title"><RotateCcw size={14} /> Returned Lead Discount Rules</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12.5 }}>First Return Discount (%)</label>
              <input className="input" type="number" min={0} max={80} style={{ width: 110, textAlign: 'right' }} value={rule.returnedLeadDiscounts?.firstReturnDiscountPercent ?? 10} onChange={(e) => updateGroup('returnedLeadDiscounts', 'firstReturnDiscountPercent', Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12.5 }}>Stale Follow-Up Threshold (Days)</label>
              <input className="input" type="number" min={1} style={{ width: 110, textAlign: 'right' }} value={rule.returnedLeadDiscounts?.staleFollowUpDays ?? 10} onChange={(e) => updateGroup('returnedLeadDiscounts', 'staleFollowUpDays', Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12.5 }}>Stale Follow-Up Discount (%)</label>
              <input className="input" type="number" min={0} max={80} style={{ width: 110, textAlign: 'right' }} value={rule.returnedLeadDiscounts?.staleFollowUpDiscountPercent ?? 15} onChange={(e) => updateGroup('returnedLeadDiscounts', 'staleFollowUpDiscountPercent', Number(e.target.value))} />
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 4, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rule.returnedLeadDiscounts?.applyOnlyWhenApproved !== false}
                onChange={(e) => updateGroup('returnedLeadDiscounts', 'applyOnlyWhenApproved', e.target.checked)}
              />
              <span>Apply returned discount only after explicit admin approval</span>
            </label>
          </div>
        </div>
      </div>

      {/* Live Claim-Point Simulator + Publish Notes */}
      <div className="grid-2">
        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Calculator size={14} /> Live Claim-Point Simulator</span>
            <span className="badge badge-blue" style={{ fontSize: 12 }}>{simFinal} pts</span>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Budget Band</label>
              <select className="select" value={sim.budgetBand} onChange={(e) => setSim({ ...sim, budgetBand: e.target.value })}>
                {Object.entries(BUDGET_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select className="select" value={sim.propertyType} onChange={(e) => setSim({ ...sim, propertyType: e.target.value })}>
                {Object.keys(rule.propertyTypeAdditions || {}).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Site Visit Tier</label>
            <select className="select" value={sim.visitTier} onChange={(e) => setSim({ ...sim, visitTier: e.target.value })}>
              <option value="none">No Site Visit (+0)</option>
              <option value="scheduled">Scheduled (+{rule.siteVisitPremiums?.scheduled ?? 0})</option>
              <option value="completedVerified">Completed & Verified (+{rule.siteVisitPremiums?.completedVerified ?? 0})</option>
              <option value="multipleVerified">Multiple Verified (+{rule.siteVisitPremiums?.multipleVerified ?? 0})</option>
            </select>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={sim.applyFirstReturnDiscount} onChange={(e) => setSim({ ...sim, applyFirstReturnDiscount: e.target.checked })} />
            <span>Simulate approved First-Return discount (-{simDiscountPct}%)</span>
          </label>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Base {simBase} + Property {simProp} + Visit {simVisit} − Discount {simDiscountPts} = <strong>{simFinal} pts</strong>
          </div>
        </div>

        <div className="analysis-card">
          <div className="analysis-head">
            <span className="analysis-title"><Save size={14} /> Publish Pricing Update</span>
          </div>
          <div className="form-group">
            <label className="form-label">Change Notes (Logged in Audit Trail)</label>
            <textarea
              className="textarea"
              rows={3}
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="e.g. Adjusted Q4 commercial & luxury villa premiums..."
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Publishing...' : `Save & Activate Version v${(rule.version || 1) + 1}`}
          </button>
        </div>
      </div>

      {/* Version History */}
      <div className="card">
        <h3 style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <History size={14} /> Pricing Rule Version History ({history.length})
        </h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Version</th><th>Status</th><th>Change Notes</th><th>Updated At</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id}>
                  <td><strong>v{h.version}</strong></td>
                  <td><span className={`badge ${h.isActive ? 'badge-green' : 'badge-gray'}`}>{h.isActive ? 'Active' : 'Archived'}</span></td>
                  <td>{h.changeNotes || '-'}</td>
                  <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(h.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
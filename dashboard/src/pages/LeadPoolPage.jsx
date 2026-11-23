import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Lock, Layers, Sparkles, RotateCcw, CalendarCheck, Wallet,
  RefreshCw, ArrowUpRight, ShieldAlert,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { FinancialSummaryBox } from '../components/FinancialSummaryBox.jsx';

export function LeadPoolPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setWalletBalance } = useAuth();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: '',
    budgetBand: '',
    propertyType: '',
    poolFilter: 'ALL',
  });
  const [leads, setLeads] = useState([]);
  const [walletPoints, setWalletPoints] = useState(0);
  const [eligibility, setEligibility] = useState({ allowed: false, reason: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const loadPool = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiClient.get('/lead-pool', filters);
      setLeads(res.data.leads || []);
      const bal = res.data.walletBalancePoints ?? 0;
      setWalletPoints(bal);
      setWalletBalance(bal);
      setEligibility(res.data.claimEligibility || { allowed: false });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, setWalletBalance, showToast]);

  useEffect(() => {
    loadPool(false);
  }, [loadPool]);

  const handleConfirmClaim = async () => {
    if (!selectedLead) return;
    setClaiming(true);
    try {
      const res = await apiClient.post('/claims', { leadId: selectedLead._id });
      setWalletBalance(res.data.walletBalancePoints);
      showToast(`Claimed ${selectedLead.leadCode}! Buyer contact details are now unlocked in My Leads.`);
      setSelectedLead(null);
      navigate('/my-leads');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setClaiming(false);
    }
  };

  const freshCount = leads.filter((l) => !l.isReturnedLead).length;
  const returnedCount = leads.filter((l) => l.isReturnedLead).length;
  const visitedCount = leads.filter((l) => ['Completed & Verified', 'Multiple Verified Visits'].includes(l.siteVisitStatus)).length;

  return (
    <div className="dash-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shared Buyer Requirement Pool</h1>
          <p className="page-subtitle">Buyer contact details stay masked until you claim exclusive 20-day ownership.</p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadPool(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {!loading && !eligibility.allowed && (
        <div className="card" style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-soft)', fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={15} />
            <strong>Claiming Locked:</strong> {eligibility.reason || 'Complete professional verification to claim requirements.'}
          </span>
          <Link to="/profile" className="btn btn-primary btn-sm">Complete Verification →</Link>
        </div>
      )}

      {/* Clickable Filter KPI Cards */}
      <div className="kpi-grid">
        <div
          className="kpi-card clickable"
          style={{ borderColor: filters.poolFilter === 'ALL' ? 'var(--color-primary)' : undefined }}
          onClick={() => setFilters((f) => ({ ...f, poolFilter: 'ALL' }))}
        >
          <div className="kpi-top"><span className="kpi-icon navy"><Layers size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{leads.length}</div>
          <div className="kpi-label">Available Pool Leads</div>
          <div className="kpi-sub">Show all →</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: filters.poolFilter === 'FRESH' ? 'var(--color-primary)' : undefined }}
          onClick={() => setFilters((f) => ({ ...f, poolFilter: 'FRESH' }))}
        >
          <div className="kpi-top"><span className="kpi-icon green"><Sparkles size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{freshCount}</div>
          <div className="kpi-label">Fresh Requirements</div>
          <div className="kpi-sub">Filter fresh →</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: filters.poolFilter === 'RETURNED' ? 'var(--color-primary)' : undefined }}
          onClick={() => setFilters((f) => ({ ...f, poolFilter: 'RETURNED' }))}
        >
          <div className="kpi-top"><span className="kpi-icon amber"><RotateCcw size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{returnedCount}</div>
          <div className="kpi-label">Returned Leads</div>
          <div className="kpi-sub">Filter returned →</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: filters.poolFilter === 'VISITED' ? 'var(--color-primary)' : undefined }}
          onClick={() => setFilters((f) => ({ ...f, poolFilter: 'VISITED' }))}
        >
          <div className="kpi-top"><span className="kpi-icon blue"><CalendarCheck size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{visitedCount}</div>
          <div className="kpi-label">Verified Site Visits</div>
          <div className="kpi-sub">Filter visited →</div>
        </div>
        <Link to="/wallet" className="kpi-card clickable">
          <div className="kpi-top"><span className="kpi-icon blue"><Wallet size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div>
          <div className="kpi-value">{walletPoints.toLocaleString()} pts</div>
          <div className="kpi-label">My Wallet Balance</div>
          <div className="kpi-sub">Recharge wallet →</div>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="filter-bar">
          <input className="input" placeholder="Search requirements, code, or locations..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className="input" placeholder="City (e.g. Gurugram)" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          <select className="select" value={filters.budgetBand} onChange={(e) => setFilters({ ...filters, budgetBand: e.target.value })}>
            <option value="">All Budgets</option>
            <option value="BELOW_50L">Below ₹50L</option>
            <option value="50L_1CR">₹50L–₹1Cr</option>
            <option value="1CR_2CR">₹1Cr–₹2Cr</option>
            <option value="2CR_5CR">₹2Cr–₹5Cr</option>
            <option value="5CR_10CR">₹5Cr–₹10Cr</option>
            <option value="10CR_PLUS">₹10Cr+</option>
          </select>
          <select className="select" value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
            <option value="">All Property Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Builder Floor">Builder Floor</option>
            <option value="Residential Plot">Residential Plot</option>
            <option value="Independent House">Independent House</option>
            <option value="Villa/Luxury">Villa/Luxury</option>
            <option value="Commercial">Commercial</option>
          </select>
          <select className="select" value={filters.poolFilter} onChange={(e) => setFilters({ ...filters, poolFilter: e.target.value })}>
            <option value="ALL">All Pool Leads</option>
            <option value="FRESH">Fresh Leads</option>
            <option value="RETURNED">Returned Leads</option>
            <option value="VISITED">Verified Site Visits</option>
          </select>
        </div>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="grid-2">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 190 }} />)}</div>
      ) : leads.length === 0 ? (
        <div className="card empty-state">No buyer requirements match your filters.</div>
      ) : (
        <div className="grid-2">
          {leads.map((lead) => (
            <div className="card" key={lead._id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-gray">{lead.leadCode}</span>
                    {lead.isReturnedLead && <span className="badge badge-amber">Returned</span>}
                    <span className="badge badge-green">Seriousness {lead.seriousnessScore}/100</span>
                  </div>
                  <h3 style={{ marginTop: 6, fontSize: 14.5 }}>{lead.title}</h3>
                </div>
                <span className="badge badge-blue" style={{ fontSize: 12.5, padding: '4px 10px' }}>
                  {lead.computedClaimPoints} pts
                </span>
              </div>

              <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>{lead.requirementSummary}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11.5, color: 'var(--color-muted)' }}>
                <span><strong>Location:</strong> {lead.location}, {lead.city}</span>
                <span>• <strong>Type:</strong> {lead.propertyType} ({lead.configuration || 'Standard'})</span>
                <span>• <strong>Budget:</strong> {lead.budgetBand}</span>
                <span>• <strong>Site Visit:</strong> {lead.siteVisitStatus}</span>
              </div>

              {lead.lastRemarkSummary && (
                <div style={{ fontSize: 11.5, color: 'var(--color-muted)', background: 'var(--color-canvas)', padding: '6px 9px', borderRadius: 7 }}>
                  Last remark: {lead.lastRemarkSummary}
                </div>
              )}

              <div className="locked-contact-box">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} />
                  Buyer contact masked ({lead.buyerPreview?.phone}) — unlocks on claim
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <button
                  className="btn btn-primary btn-sm"
                  type="button"
                  disabled={!eligibility.allowed}
                  title={!eligibility.allowed ? eligibility.reason : 'Claim exclusive 20-day ownership'}
                  onClick={() => setSelectedLead(lead)}
                >
                  Claim Requirement ({lead.computedClaimPoints} pts)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      <Modal open={Boolean(selectedLead)} title="Confirm Lead Claim" onClose={() => setSelectedLead(null)}>
        {selectedLead && (
          <>
            <p style={{ fontSize: 13, marginBottom: 12 }}>
              <strong>{selectedLead.title}</strong> ({selectedLead.location}, {selectedLead.city})
            </p>
            <FinancialSummaryBox
              currentBalance={walletPoints}
              deltaPoints={selectedLead.computedClaimPoints}
              direction="DEBIT"
              reason={`Exclusive 20-day ownership of ${selectedLead.leadCode}. Buyer contact unlocks immediately.`}
              extraRows={[{ label: 'Ownership Period', value: '20 Days (extendable +7d for 25%)' }]}
            />
            {walletPoints < selectedLead.computedClaimPoints && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Insufficient wallet balance to claim this lead.</span>
                <Link to="/wallet" className="btn btn-secondary btn-sm">Recharge Wallet</Link>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelectedLead(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                disabled={claiming || walletPoints < selectedLead.computedClaimPoints}
                onClick={handleConfirmClaim}
              >
                {claiming ? 'Claiming...' : `Confirm & Deduct ${selectedLead.computedClaimPoints} pts`}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
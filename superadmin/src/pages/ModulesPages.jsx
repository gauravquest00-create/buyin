import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';

// 1. Dashboard & Analytics
export function DashboardAnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { adminApi.get('/dashboard').then((r) => setData(r.data)); }, []);
  const k = data?.kpis || {};
  return (
    <>
      <h1>Platform Dashboard & Analytics</h1>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Registered Professionals</div><div className="kpi-value">{k.totalUsers ?? 0}</div></div>
        <div className="kpi-card"><div className="kpi-label">Pending Verifications</div><div className="kpi-value">{k.pendingVerifications ?? 0}</div></div>
        <div className="kpi-card"><div className="kpi-label">Available Pool Leads</div><div className="kpi-value">{k.availableLeads ?? 0}</div></div>
        <div className="kpi-card"><div className="kpi-label">Active Claims</div><div className="kpi-value">{k.activeClaims ?? 0}</div></div>
        <div className="kpi-card"><div className="kpi-label">Pending Refunds</div><div className="kpi-value">{k.pendingRefunds ?? 0}</div></div>
        <div className="kpi-card"><div className="kpi-label">Total Revenue (INR)</div><div className="kpi-value">₹{(k.totalRevenueInr ?? 0).toLocaleString()}</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Recent Administrative Audit Activity</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Action</th><th>Module</th><th>Admin</th><th>Reason</th><th>Timestamp</th></tr></thead>
            <tbody>
              {(data?.recentAudits || []).map((a) => (
                <tr key={a._id}><td><strong>{a.action}</strong></td><td>{a.module}</td><td>{a.actorEmail}</td><td>{a.reason || '-'}</td><td>{new Date(a.createdAt).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// 2. User Management
export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const load = useCallback(() => adminApi.get('/users', { search }).then((r) => setUsers(r.data.users || [])), [search]);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (userId, status) => {
    const reason = window.prompt(`Reason for setting user to ${status}:`, 'Administrative compliance action');
    if (!reason) return;
    try {
      await adminApi.patch(`/users/${userId}/status`, { status, reason });
      showToast(`User updated to ${status}`);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <>
      <div className="header-row">
        <h1>User Management</h1>
        <input className="input" style={{ width: 280 }} placeholder="Search name, email, mobile, city..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Contact</th><th>City / Agency</th><th>Status</th><th>Verification</th><th>Wallet</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.fullName}</strong></td>
                <td>{u.email}<br /><span style={{ fontSize: 12, color: 'var(--muted)' }}>{u.mobile}</span></td>
                <td>{u.city || '-'} / {u.agencyName || '-'}</td>
                <td><span className="badge badge-blue">{u.status}</span></td>
                <td><span className="badge badge-amber">{u.verificationStatus}</span></td>
                <td><strong>{u.walletBalancePoints} pts</strong></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={() => setStatus(u._id, 'ACTIVE')} type="button">Activate</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setStatus(u._id, 'SUSPENDED')} type="button">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 3. Verification Management
export function VerificationManagementPage() {
  const [records, setRecords] = useState([]);
  const { showToast } = useToast();
  const load = () => adminApi.get('/verifications').then((r) => setRecords(r.data.records || []));
  useEffect(() => { load(); }, []);

  const decide = async (id, status) => {
    const adminRemarks = window.prompt(`Remarks for ${status}:`, status === 'APPROVED' ? 'Verified credentials' : 'Please provide additional details') || '';
    try {
      await adminApi.patch(`/verifications/${id}/review`, { status, adminRemarks });
      showToast(`Verification marked ${status}`);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <>
      <h1>Professional Verification Queue</h1>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Professional</th><th>Role & Agency</th><th>City & RERA</th><th>Status</th><th>Documents</th><th>Actions</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.submittedSnapshot?.fullName}</strong><br /><span style={{ fontSize: 12 }}>{r.submittedSnapshot?.email}</span></td>
                <td>{r.submittedSnapshot?.professionalRole}<br /><span style={{ fontSize: 12 }}>{r.submittedSnapshot?.agencyName}</span></td>
                <td>{r.submittedSnapshot?.city}<br /><span style={{ fontSize: 12 }}>RERA: {r.submittedSnapshot?.reraNumber || 'N/A'}</span></td>
                <td><span className="badge badge-amber">{r.status}</span></td>
                <td>{(r.documents || []).map((d, i) => d.signedPreviewUrl ? <a key={i} href={d.signedPreviewUrl} target="_blank" rel="noreferrer" className="badge badge-blue">Doc {i + 1}</a> : <span key={i} className="badge badge-gray">{d.originalName}</span>)}</td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn btn-success btn-sm" onClick={() => decide(r._id, 'APPROVED')} type="button">Approve</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => decide(r._id, 'MORE_DOCS_REQUIRED')} type="button">Request Docs</button>
                  <button className="btn btn-danger btn-sm" onClick={() => decide(r._id, 'REJECTED')} type="button">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 4. Lead Pool Management
export function LeadPoolManagementPage() {
  const [overview, setOverview] = useState(null);
  const [leads, setLeads] = useState([]);
  const { showToast } = useToast();
  const load = () => {
    adminApi.get('/lead-pool/overview').then((r) => setOverview(r.data));
    adminApi.get('/leads', { isReturnedLead: 'true' }).then((r) => setLeads(r.data.leads || []));
  };
  useEffect(() => { load(); }, []);

  const toggleDiscount = async (id, approved) => {
    await adminApi.patch(`/lead-pool/${id}/returned-discount`, { approved });
    showToast('Returned-lead discount approval updated');
    load();
  };

  return (
    <>
      <h1>Lead Pool Control & Returned Leads</h1>
      <div className="kpi-grid">
        {Object.entries(overview?.byState || {}).map(([state, count]) => (
          <div className="kpi-card" key={state}><div className="kpi-label">{state}</div><div className="kpi-value">{count}</div></div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Returned Leads Discount Approval</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Code</th><th>Title</th><th>Returns</th><th>Points</th><th>Discount Approved</th><th>Action</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l._id}>
                  <td><strong>{l.leadCode}</strong></td><td>{l.title}</td><td>{l.returnCount}</td><td>{l.computedClaimPoints} pts</td>
                  <td><span className={`badge ${l.returnedDiscountApproved ? 'badge-green' : 'badge-amber'}`}>{l.returnedDiscountApproved ? 'Approved' : 'Pending'}</span></td>
                  <td><button className="btn btn-primary btn-sm" type="button" onClick={() => toggleDiscount(l._id, !l.returnedDiscountApproved)}>{l.returnedDiscountApproved ? 'Revoke' : 'Approve Discount'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// 5. Lead Management (Create, Publish, Archive)
export function LeadManagementPage() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({
    title: '', requirementSummary: '', buyerName: '', buyerPhone: '', buyerEmail: '',
    budgetBand: '1CR_2CR', budgetMinInr: 12000000, budgetMaxInr: 18000000,
    propertyType: 'Apartment', city: 'Gurugram', location: '', configuration: '3 BHK',
    purchaseTimeline: 'DAYS_31_TO_90', publishImmediately: true,
  });
  const { showToast } = useToast();
  const load = () => adminApi.get('/leads').then((r) => setLeads(r.data.leads || []));
  useEffect(() => { load(); }, []);

  const createLead = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/leads', form);
      showToast('Buyer requirement created');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <>
      <h1>Lead Management</h1>
      <form className="card" onSubmit={createLead}>
        <h3 style={{ marginBottom: 12 }}>Create New Buyer Requirement</h3>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">Requirement Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Buyer Full Name (Private)</label><input className="input" required value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Buyer Phone (Private)</label><input className="input" required value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Buyer Email (Private)</label><input className="input" type="email" value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">City</label><input className="input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Micro-Location</label><input className="input" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group">
            <label className="form-label">Budget Band</label>
            <select className="select" value={form.budgetBand} onChange={(e) => setForm({ ...form, budgetBand: e.target.value })}>
              <option value="BELOW_50L">Below ₹50L</option><option value="50L_1CR">₹50L–₹1Cr</option><option value="1CR_2CR">₹1Cr–₹2Cr</option>
              <option value="2CR_5CR">₹2Cr–₹5Cr</option><option value="5CR_10CR">₹5Cr–₹10Cr</option><option value="10CR_PLUS">₹10Cr+</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select className="select" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
              <option>Apartment</option><option>Builder Floor</option><option>Residential Plot</option>
              <option>Independent House</option><option>Villa/Luxury</option><option>Commercial</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Requirement Summary</label><textarea className="textarea" rows={3} required value={form.requirementSummary} onChange={(e) => setForm({ ...form, requirementSummary: e.target.value })} /></div>
        <button className="btn btn-primary" type="submit">Create & Publish Requirement</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Code</th><th>Title</th><th>Buyer</th><th>City / Location</th><th>Points</th><th>State</th><th>Actions</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id}>
                <td><strong>{l.leadCode}</strong></td><td>{l.title}</td><td>{l.buyerName}<br /><span style={{ fontSize: 12 }}>{l.buyerPhone}</span></td>
                <td>{l.location}, {l.city}</td><td><strong>{l.computedClaimPoints} pts</strong></td>
                <td><span className="badge badge-blue">{l.poolState}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {l.poolState === 'DRAFT' && <button className="btn btn-success btn-sm" type="button" onClick={() => adminApi.post(`/leads/${l._id}/publish`).then(load)}>Publish</button>}
                  <button className="btn btn-danger btn-sm" type="button" onClick={() => adminApi.post(`/leads/${l._id}/archive`, { reason: 'Archived by admin' }).then(load)}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 6. Claim & Ownership Management
export function ClaimManagementPage() {
  const [claims, setClaims] = useState([]);
  const { showToast } = useToast();
  const load = () => adminApi.get('/claims').then((r) => setClaims(r.data.claims || []));
  useEffect(() => { load(); }, []);

  const revoke = async (claimId) => {
    const reason = window.prompt('Mandatory reason for manual ownership revocation:');
    if (!reason) return;
    await adminApi.post(`/claims/${claimId}/revoke`, { reason, returnLeadToPool: true });
    showToast('Claim ownership revoked and logged');
    load();
  };

  return (
    <>
      <h1>Claim & Ownership Management</h1>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Claim</th><th>Lead</th><th>Owner</th><th>Points</th><th>Expires</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.claimCode}</strong></td><td>{c.leadId?.leadCode} — {c.leadId?.title}</td>
                <td>{c.userId?.fullName} ({c.userId?.email})</td><td>{c.originalClaimPoints} pts</td>
                <td>{new Date(c.expiresAt).toLocaleDateString()}</td><td><span className="badge badge-blue">{c.status}</span></td>
                <td>{['ACTIVE', 'EXTENDED'].includes(c.status) && <button className="btn btn-danger btn-sm" type="button" onClick={() => revoke(c._id)}>Revoke</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 7. Wallet Management
export function WalletManagementPage() {
  const [wallets, setWallets] = useState([]);
  const [adj, setAdj] = useState({ userId: '', direction: 'CREDIT', points: 100, reason: '' });
  const { showToast } = useToast();
  const load = () => adminApi.get('/wallets').then((r) => setWallets(r.data.wallets || []));
  useEffect(() => { load(); }, []);

  const submitAdj = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/wallets/adjust', adj);
      showToast('Wallet adjusted via immutable ledger');
      setAdj({ userId: '', direction: 'CREDIT', points: 100, reason: '' });
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <>
      <h1>Wallet Management & Manual Ledger Adjustments</h1>
      <form className="card" onSubmit={submitAdj}>
        <h3 style={{ marginBottom: 12 }}>Manual Wallet Adjustment (Immutable Ledger)</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select className="select" required value={adj.userId} onChange={(e) => setAdj({ ...adj, userId: e.target.value })}>
              <option value="">Choose professional...</option>
              {wallets.map((w) => <option key={w._id} value={w.userId?._id}>{w.userId?.fullName} ({w.userId?.email}) — {w.balancePoints} pts</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Direction</label>
            <select className="select" value={adj.direction} onChange={(e) => setAdj({ ...adj, direction: e.target.value })}>
              <option value="CREDIT">Credit (+)</option><option value="DEBIT">Debit (-)</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Points</label><input className="input" type="number" min={1} required value={adj.points} onChange={(e) => setAdj({ ...adj, points: Number(e.target.value) })} /></div>
          <div className="form-group"><label className="form-label">Mandatory Audit Reason</label><input className="input" required minLength={5} value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" type="submit">Apply Adjustment</button>
      </form>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Professional</th><th>Balance</th><th>Recharged</th><th>Bonus</th><th>Spent</th><th>Refunded</th></tr></thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w._id}>
                <td><strong>{w.userId?.fullName}</strong> ({w.userId?.email})</td>
                <td><strong>{w.balancePoints} pts</strong></td><td>{w.totalRechargedPoints}</td><td>{w.totalBonusPoints}</td><td>{w.totalSpentPoints}</td><td>{w.totalRefundedPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 8. Pricing & Claim Engine
export function PricingEnginePage() {
  const [rule, setRule] = useState(null);
  const [notes, setNotes] = useState('');
  const { showToast } = useToast();
  useEffect(() => { adminApi.get('/pricing').then((r) => setRule(r.data.active)); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await adminApi.put('/pricing', {
        budgetBasePoints: rule.budgetBasePoints,
        propertyTypeAdditions: rule.propertyTypeAdditions,
        buyerSignals: rule.buyerSignals,
        siteVisitPremiums: rule.siteVisitPremiums,
        returnedLeadDiscounts: rule.returnedLeadDiscounts,
        changeNotes: notes || 'Updated from Super Admin Pricing Engine',
      });
      showToast('Pricing rules updated. Historical claim snapshots remain immutable.');
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (!rule) return <div className="card">Loading pricing rules...</div>;
  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="header-row"><h1>Pricing & Claim Point Engine (v{rule.version})</h1><button className="btn btn-primary" type="submit">Save New Pricing Version</button></div>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Budget Base Points</h3>
          {Object.entries(rule.budgetBasePoints || {}).map(([k, v]) => (
            <div className="form-group" key={k}><label className="form-label">{k}</label><input className="input" type="number" value={v} onChange={(e) => setRule({ ...rule, budgetBasePoints: { ...rule.budgetBasePoints, [k]: Number(e.target.value) } })} /></div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Property Type Additions</h3>
          {Object.entries(rule.propertyTypeAdditions || {}).map(([k, v]) => (
            <div className="form-group" key={k}><label className="form-label">{k}</label><input className="input" type="number" value={v} onChange={(e) => setRule({ ...rule, propertyTypeAdditions: { ...rule.propertyTypeAdditions, [k]: Number(e.target.value) } })} /></div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="form-group"><label className="form-label">Change Notes</label><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe reason for pricing update..." /></div>
      </div>
    </form>
  );
}

// 9. Payment Management
export function PaymentManagementPage() {
  const [payments, setPayments] = useState([]);
  const { showToast } = useToast();
  const load = () => adminApi.get('/payments').then((r) => setPayments(r.data.payments || []));
  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="header-row">
        <h1>Recharge & Razorpay Payment Management</h1>
        <button className="btn btn-primary" type="button" onClick={() => adminApi.post('/payments/reconcile').then((r) => { showToast('Reconciliation executed'); load(); })}>
          Run Payment Reconciliation
        </button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Internal Txn</th><th>User</th><th>Amount</th><th>Points</th><th>Razorpay Order</th><th>Status</th><th>Credited</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.internalTransactionId}</strong></td><td>{p.userId?.fullName}</td><td>₹{p.amountInr}</td>
                <td>{p.totalPoints} pts</td><td style={{ fontSize: 12 }}>{p.razorpayOrderId}</td>
                <td><span className="badge badge-blue">{p.status}</span></td><td>{p.walletCredited ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 10. Refund & Dispute Management
export function RefundManagementPage() {
  const [refunds, setRefunds] = useState([]);
  const { showToast } = useToast();
  const load = () => adminApi.get('/refunds').then((r) => setRefunds(r.data.refunds || []));
  useEffect(() => { load(); }, []);

  const approve = async (id, leadOutcome) => {
    try {
      await adminApi.post(`/refunds/${id}/approve`, { leadOutcome, adminRemarks: `Approved (${leadOutcome})` });
      showToast('Refund approved, 95% points credited once via immutable ledger');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const reject = async (id) => {
    const adminRemarks = window.prompt('Rejection reason:');
    if (!adminRemarks) return;
    await adminApi.post(`/refunds/${id}/reject`, { adminRemarks });
    showToast('Refund rejected and lead restored');
    load();
  };

  return (
    <>
      <h1>Refund & Dispute Management (5% Deduction / 95% Credit)</h1>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Code</th><th>User & Lead</th><th>Reason</th><th>Breakdown</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.refundCode}</strong></td>
                <td>{r.userId?.fullName}<br /><span style={{ fontSize: 12 }}>{r.leadId?.leadCode}</span></td>
                <td><strong>{r.reason}</strong><br /><span style={{ fontSize: 12 }}>{r.description}</span></td>
                <td>Orig: {r.originalClaimPoints} | -5%: {r.deductionPoints} | <strong>Credit: {r.refundablePoints} pts</strong></td>
                <td><span className="badge badge-amber">{r.status}</span></td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!['Credited', 'Rejected'].includes(r.status) && (
                    <>
                      <button className="btn btn-success btn-sm" type="button" onClick={() => approve(r._id, 'LEAD_BIN')}>Approve → Bin</button>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => approve(r._id, 'RETURN_TO_POOL')}>Approve → Pool</button>
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => reject(r._id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 11. Category Management
export function CategoryManagementPage() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ type: 'CITY', name: '', parentName: '' });
  const { showToast } = useToast();
  const load = () => adminApi.get('/categories').then((r) => setCats(r.data.categories || []));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    await adminApi.post('/categories', form);
    showToast('Category added');
    setForm({ type: 'CITY', name: '', parentName: '' });
    load();
  };

  return (
    <>
      <h1>Categories & Master Data</h1>
      <form className="card" onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="select" style={{ flex: 1 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="CITY">City</option><option value="LOCATION">Location</option><option value="PROPERTY_TYPE">Property Type</option><option value="CONFIGURATION">Configuration</option>
        </select>
        <input className="input" style={{ flex: 2 }} required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" style={{ flex: 1 }} placeholder="Parent City (optional)" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
        <button className="btn btn-primary" type="submit">Add Entry</button>
      </form>
      <div className="table-wrap"><table className="table"><thead><tr><th>Type</th><th>Name</th><th>Parent</th><th>Active</th></tr></thead><tbody>{cats.map((c) => <tr key={c._id}><td><span className="badge badge-gray">{c.type}</span></td><td><strong>{c.name}</strong></td><td>{c.parentName || '-'}</td><td>{c.isActive ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>
    </>
  );
}

// 12. Notification Management
export function NotificationManagementPage() {
  const [form, setForm] = useState({ title: '', message: '' });
  const [list, setList] = useState([]);
  const { showToast } = useToast();
  const load = () => adminApi.get('/notifications').then((r) => setList(r.data.notifications || []));
  useEffect(() => { load(); }, []);

  const send = async (e) => {
    e.preventDefault();
    const res = await adminApi.post('/notifications/broadcast', form);
    showToast(`Broadcast sent to ${res.data.sentCount} users`);
    setForm({ title: '', message: '' });
    load();
  };

  return (
    <>
      <h1>Notifications Management</h1>
      <form className="card" onSubmit={send}>
        <div className="form-group"><label className="form-label">Broadcast Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Message</label><textarea className="textarea" rows={3} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        <button className="btn btn-primary" type="submit">Send System Broadcast</button>
      </form>
      <div className="table-wrap"><table className="table"><thead><tr><th>Title</th><th>Type</th><th>Message</th><th>Date</th></tr></thead><tbody>{list.map((n) => <tr key={n._id}><td><strong>{n.title}</strong></td><td>{n.type}</td><td>{n.message}</td><td>{new Date(n.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
    </>
  );
}

// 13. Support Management
export function SupportManagementPage() {
  const [tickets, setTickets] = useState([]);
  const { showToast } = useToast();
  const load = () => adminApi.get('/support').then((r) => setTickets(r.data.tickets || []));
  useEffect(() => { load(); }, []);

  const reply = async (id) => {
    const message = window.prompt('Admin reply:');
    if (!message) return;
    await adminApi.post(`/support/${id}/reply`, { message, status: 'IN_PROGRESS' });
    showToast('Reply sent');
    load();
  };

  return (
    <>
      <h1>Support & Complaints</h1>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Ticket</th><th>User</th><th>Subject</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td><strong>{t.ticketCode}</strong></td><td>{t.userId?.fullName}</td><td>{t.subject}</td><td>{t.category}</td><td><span className="badge badge-amber">{t.status}</span></td>
                <td><button className="btn btn-primary btn-sm" type="button" onClick={() => reply(t._id)}>Reply</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 14. Reports & Business Analytics
export function ReportsAnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { adminApi.get('/reports/summary').then((r) => setData(r.data)); }, []);
  return (
    <>
      <h1>Reports & Business Analytics</h1>
      <div className="grid-2">
        <div className="card"><h3>Leads by City</h3>{(data?.leadsByCity || []).map((c) => <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span>{c._id}</span><strong>{c.count} leads (avg {Math.round(c.avgPoints)} pts)</strong></div>)}</div>
        <div className="card"><h3>Claims by Status</h3>{(data?.claimsByStatus || []).map((c) => <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span>{c._id}</span><strong>{c.count} claims ({c.totalPoints} pts)</strong></div>)}</div>
      </div>
    </>
  );
}

// 15. Roles & Permissions
export function RolesPermissionsPage() {
  const [data, setData] = useState({ roles: [], permissions: [] });
  useEffect(() => { adminApi.get('/roles').then((r) => setData(r.data)); }, []);
  return (
    <>
      <h1>RBAC Roles & Permissions</h1>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Role Name</th><th>Description</th><th>Permissions Count</th><th>System Role</th></tr></thead>
          <tbody>
            {data.roles.map((r) => (
              <tr key={r._id}><td><strong>{r.name}</strong></td><td>{r.description}</td><td><span className="badge badge-blue">{r.permissions?.length || 0} permissions</span></td><td>{r.isSystemRole ? 'Yes' : 'Custom'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 16. System Settings & Audit Logs
export function SystemSettingsAuditPage() {
  const [settings, setSettings] = useState([]);
  const [logs, setLogs] = useState([]);
  const { showToast } = useToast();
  const load = () => {
    adminApi.get('/settings').then((r) => setSettings(r.data.settings || []));
    adminApi.get('/audit-logs').then((r) => setLogs(r.data.logs || []));
  };
  useEffect(() => { load(); }, []);

  const toggleBool = async (s) => {
    await adminApi.put('/settings', { key: s.key, value: !s.value });
    showToast(`Updated ${s.key}`);
    load();
  };

  return (
    <>
      <h1>System Settings, Emergency Controls & Audit Logs</h1>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Platform Controls</h3>
        {settings.map((s) => (
          <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div><strong>{s.key}</strong><div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.description}</div></div>
            {typeof s.value === 'boolean' ? (
              <button className={`btn btn-sm ${s.value ? 'btn-danger' : 'btn-secondary'}`} type="button" onClick={() => toggleBool(s)}>{String(s.value).toUpperCase()}</button>
            ) : (
              <strong>{String(s.value)}</strong>
            )}
          </div>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Action</th><th>Module</th><th>Actor</th><th>Target</th><th>Reason</th><th>Time</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id}><td><strong>{l.action}</strong></td><td>{l.module}</td><td>{l.actorEmail}</td><td>{l.targetType}:{l.targetId}</td><td>{l.reason || '-'}</td><td>{new Date(l.createdAt).toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

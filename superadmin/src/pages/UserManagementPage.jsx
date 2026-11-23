import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Clock, ShieldAlert, RefreshCw, ExternalLink, ArrowUpRight,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const USER_STATUSES = ['ACTIVE', 'PENDING_VERIFICATION', 'PENDING_ONBOARDING', 'PENDING_OTP', 'RESTRICTED', 'SUSPENDED'];
const VERIFICATION_STATUSES = ['APPROVED', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_DOCS_REQUIRED', 'NOT_SUBMITTED', 'REJECTED', 'SUSPENDED'];

export function UserManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', verificationStatus: '' });

  const loadUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/users', filters);
      setUsers(res.data.users || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadUsers(false);
  }, [loadUsers]);

  const handleStatusChange = async (userId, status) => {
    const reason = window.prompt(`Reason for updating user status to ${status}:`, 'Administrative status update');
    if (!reason) return;
    try {
      await adminApi.patch(`/users/${userId}/status`, { status, reason });
      showToast(`User status updated to ${status}`);
      loadUsers(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const pendingCount = users.filter((u) => ['PENDING_VERIFICATION', 'PENDING_ONBOARDING', 'PENDING_OTP'].includes(u.status)).length;
  const suspendedCount = users.filter((u) => ['SUSPENDED', 'RESTRICTED'].includes(u.status)).length;

  const FILTER_CARDS = [
    { label: 'Total Shown', value: users.length, hint: 'Show all users', icon: Users, tone: 'navy', onClick: () => setFilters({ search: '', status: '', verificationStatus: '' }) },
    { label: 'Active Professionals', value: activeCount, hint: 'Filter active', icon: UserCheck, tone: 'green', onClick: () => setFilters((f) => ({ ...f, status: 'ACTIVE' })) },
    { label: 'Pending Onboarding/KYC', value: pendingCount, hint: 'Filter pending', icon: Clock, tone: 'amber', onClick: () => setFilters((f) => ({ ...f, status: 'PENDING_VERIFICATION' })) },
    { label: 'Suspended / Restricted', value: suspendedCount, hint: 'Filter suspended', icon: ShieldAlert, tone: 'red', onClick: () => setFilters((f) => ({ ...f, status: 'SUSPENDED' })) },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>User Management</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Manage registered real-estate professionals, account statuses, and click any user to inspect full history.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadUsers(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Clickable Filter KPI Cards */}
      <div className="dash-kpi-grid">
        {FILTER_CARDS.map(({ label, value, hint, icon: Icon, tone, onClick }, idx) => (
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

      {/* Search & Filter Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 220px' }}
          placeholder="Search by name, email, mobile, city, agency..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select className="select" style={{ flex: '1 1 160px' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Account Statuses</option>
          {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" style={{ flex: '1 1 160px' }} value={filters.verificationStatus} onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}>
          <option value="">All Verification States</option>
          {VERIFICATION_STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Contact</th>
                <th>City & Agency</th>
                <th>Verification</th>
                <th>Wallet</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No users match these filters.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <Link to={`/users/${u._id}`} style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {u.fullName} <ExternalLink size={12} />
                      </Link>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{u.professionalRole || 'Real Estate Professional'}</div>
                    </td>
                    <td>
                      <div>{u.email}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{u.mobile}</div>
                    </td>
                    <td>
                      <div>{u.city || '-'}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{u.agencyName || '-'}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.verificationStatus === 'APPROVED' ? 'badge-green' : u.verificationStatus === 'REJECTED' ? 'badge-red' : 'badge-amber'}`}>
                        {u.verificationStatus}
                      </span>
                    </td>
                    <td><strong>{(u.walletBalancePoints ?? 0).toLocaleString()} pts</strong></td>
                    <td>
                      <select
                        className="select"
                        style={{ minWidth: 145, padding: '5px 8px', fontSize: 12 }}
                        value={u.status}
                        onChange={(e) => handleStatusChange(u._id, e.target.value)}
                      >
                        {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <Link to={`/users/${u._id}`} className="btn btn-secondary btn-sm">Details</Link>
                    </td>
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
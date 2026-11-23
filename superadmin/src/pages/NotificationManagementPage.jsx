import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell, Send, Megaphone, CheckCircle2, Clock,
  RefreshCw, ArrowUpRight,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const NOTIF_TYPES = ['SYSTEM', 'CLAIM', 'EXTENSION', 'EXPIRY', 'LEAD_RETURN', 'WALLET', 'REFUND', 'VERIFICATION', 'FOLLOW_UP'];

function typeBadgeClass(type) {
  if (type === 'SYSTEM') return 'badge-blue';
  if (type === 'WALLET' || type === 'CLAIM') return 'badge-green';
  if (type === 'REFUND' || type === 'EXPIRY') return 'badge-red';
  return 'badge-amber';
}

export function NotificationManagementPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', message: '', targetUserId: '' });

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [nRes, uRes] = await Promise.all([
        adminApi.get('/notifications'),
        adminApi.get('/users', { limit: 100 }).catch(() => ({ data: { users: [] } })),
      ]);
      setNotifications(nRes.data.notifications || []);
      setUsers(uRes.data?.users || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        ...(form.targetUserId ? { targetUserIds: [form.targetUserId] } : {}),
      };
      const res = await adminApi.post('/notifications/broadcast', payload);
      showToast(`Notification sent to ${res.data.sentCount} professional(s)`);
      setForm({ title: '', message: '', targetUserId: '' });
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (typeFilter && n.type !== typeFilter) return false;
    if (readFilter === 'UNREAD' && n.isRead) return false;
    if (readFilter === 'READ' && !n.isRead) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [n.title, n.message, n.type].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  const systemCount = notifications.filter((n) => n.type === 'SYSTEM').length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const KPI_CARDS = [
    { label: 'Total Notifications', value: notifications.length, hint: 'Show all', icon: Bell, tone: 'navy', onClick: () => { setTypeFilter(''); setReadFilter(''); } },
    { label: 'System Broadcasts', value: systemCount, hint: 'Filter broadcasts', icon: Megaphone, tone: 'blue', onClick: () => { setTypeFilter('SYSTEM'); setReadFilter(''); } },
    { label: 'Unread', value: unreadCount, hint: 'Filter unread', icon: Clock, tone: 'amber', onClick: () => { setTypeFilter(''); setReadFilter('UNREAD'); } },
    { label: 'Read', value: readCount, hint: 'Filter read', icon: CheckCircle2, tone: 'green', onClick: () => { setTypeFilter(''); setReadFilter('READ'); } },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Notifications Management</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Send system-wide announcements or targeted alerts to real-estate professionals and inspect delivery logs.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadData(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Clickable Filter KPI Cards */}
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

      {/* Broadcast Composer */}
      <form className="card" onSubmit={handleBroadcast}>
        <div className="header-row" style={{ marginBottom: 10 }}>
          <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Megaphone size={15} /> Send Broadcast or Targeted Alert
          </h3>
          <button className="btn btn-primary btn-sm" type="submit" disabled={sending}>
            <Send size={13} /> {sending ? 'Sending...' : form.targetUserId ? 'Send Targeted Alert' : 'Broadcast to All Users'}
          </button>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="input" required minLength={3} placeholder="e.g. New High-Intent Leads Added in Gurugram" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Audience</label>
            <select className="select" value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}>
              <option value="">All Registered Professionals ({users.length})</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Message</label>
          <textarea className="textarea" rows={2} required minLength={5} placeholder="Write the notification message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
      </form>

      {/* Search & Filters */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 220px' }}
          placeholder="Search notifications by title, message, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ flex: '1 1 160px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {NOTIF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="select" style={{ flex: '1 1 140px' }} value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
          <option value="">All Read States</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>
      </div>

      {/* Delivery Log Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 240 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No notifications match your filter.</td></tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n._id}>
                    <td><strong>{n.title}</strong></td>
                    <td><span className={`badge ${typeBadgeClass(n.type)}`}>{n.type}</span></td>
                    <td>{n.message}</td>
                    <td>
                      <span className={`badge ${n.isRead ? 'badge-green' : 'badge-amber'}`}>
                        {n.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleString()}</td>
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
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy, Clock, MessageSquare, CheckCircle2, AlertCircle,
  RefreshCw, ArrowUpRight, Send, ExternalLink,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const SUPPORT_STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'];

function statusBadgeClass(status) {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'badge-green';
  if (status === 'OPEN') return 'badge-red';
  if (status === 'IN_PROGRESS') return 'badge-blue';
  return 'badge-amber';
}

function priorityBadgeClass(priority) {
  if (priority === 'HIGH') return 'badge-red';
  if (priority === 'MEDIUM') return 'badge-amber';
  return 'badge-gray';
}

export function SupportManagementPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Ticket Thread Modal
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [nextStatus, setNextStatus] = useState('IN_PROGRESS');
  const [sending, setSending] = useState(false);

  const loadTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/support', statusFilter ? { status: statusFilter } : {});
      setTickets(res.data.tickets || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadTickets(false);
  }, [loadTickets]);

  const openThread = (ticket) => {
    setSelected(ticket);
    setReplyText('');
    setNextStatus(ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selected || replyText.trim().length < 2) return;
    setSending(true);
    try {
      const res = await adminApi.post(`/support/${selected._id}/reply`, {
        message: replyText.trim(),
        status: nextStatus,
      });
      showToast('Reply sent and ticket updated');
      setSelected(res.data.ticket);
      setReplyText('');
      loadTickets(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const filtered = tickets.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [t.ticketCode, t.subject, t.category, t.userId?.fullName, t.userId?.email]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const waitingCount = tickets.filter((t) => t.status === 'WAITING_ON_USER').length;
  const resolvedCount = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  const KPI_CARDS = [
    { label: 'Total Tickets', value: tickets.length, hint: 'Show all', status: '', icon: LifeBuoy, tone: 'navy' },
    { label: 'Open / New', value: openCount, hint: 'Filter open', status: 'OPEN', icon: AlertCircle, tone: 'red' },
    { label: 'In Progress', value: inProgressCount, hint: 'Filter active', status: 'IN_PROGRESS', icon: MessageSquare, tone: 'blue' },
    { label: 'Waiting on User', value: waitingCount, hint: 'Filter waiting', status: 'WAITING_ON_USER', icon: Clock, tone: 'amber' },
    { label: 'Resolved / Closed', value: resolvedCount, hint: 'Filter resolved', status: 'RESOLVED', icon: CheckCircle2, tone: 'green' },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Support & Complaints</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Respond to professional inquiries, resolve wallet/claim disputes, and track ticket lifecycle statuses.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadTickets(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Clickable Filter KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, status, icon: Icon, tone }, idx) => (
          <div
            key={label}
            onClick={() => setStatusFilter(status)}
            className="dash-kpi-card"
            style={{
              animationDelay: `${idx * 40}ms`,
              borderColor: statusFilter === status && status !== '' ? 'var(--primary)' : undefined,
            }}
          >
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

      {/* Search & Status Filter */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 240px' }}
          placeholder="Search ticket code, subject, category, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ flex: '1 1 180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Ticket Statuses</option>
          {SUPPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 250 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>User</th>
                <th>Subject</th>
                <th>Category & Priority</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No support tickets found.</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong>{t.ticketCode}</strong>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.messages?.length || 0} msg(s)</div>
                    </td>
                    <td>
                      {t.userId ? (
                        <Link to={`/users/${t.userId._id}`} style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {t.userId.fullName} <ExternalLink size={11} />
                        </Link>
                      ) : '-'}
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t.userId?.email}</div>
                    </td>
                    <td><strong>{t.subject}</strong></td>
                    <td>
                      <span className="badge badge-gray" style={{ marginRight: 4 }}>{t.category}</span>
                      <span className={`badge ${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                    </td>
                    <td><span className={`badge ${statusBadgeClass(t.status)}`}>{t.status}</span></td>
                    <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(t.updatedAt).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => openThread(t)}>
                        Open Thread
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Thread & Reply Modal */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="header-row">
              <div>
                <h3>{selected.ticketCode} — {selected.subject}</h3>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className="badge badge-gray">{selected.category}</span>
                  <span className={`badge ${priorityBadgeClass(selected.priority)}`}>{selected.priority}</span>
                  <span className={`badge ${statusBadgeClass(selected.status)}`}>{selected.status}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelected(null)}>Close</button>
            </div>

            {/* Conversation History */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 280, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--canvas)', padding: 12, borderRadius: 8 }}>
              {(selected.messages || []).map((m, idx) => (
                <div
                  key={m._id || idx}
                  style={{
                    alignSelf: m.senderType === 'ADMIN' ? 'flex-end' : 'flex-start',
                    background: m.senderType === 'ADMIN' ? '#EFF6FF' : '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    maxWidth: '85%',
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: m.senderType === 'ADMIN' ? 'var(--primary)' : 'var(--muted)', marginBottom: 3 }}>
                    {m.senderType === 'ADMIN' ? 'BUYIN Admin' : 'Professional'} • {new Date(m.createdAt).toLocaleString()}
                  </div>
                  <div>{m.body}</div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Update Ticket Status</label>
                  <select className="select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                    {SUPPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reply Message</label>
                <textarea
                  className="textarea"
                  rows={3}
                  required
                  minLength={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your administrative response..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm" type="submit" disabled={sending}>
                  <Send size={13} /> {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
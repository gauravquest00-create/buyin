import React, { useEffect, useState, useCallback } from 'react';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
  MessageSquare,
  Paperclip,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Modal } from '../components/Modal.jsx';

export function SupportPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    subject: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    message: '',
  });
  const [attachment, setAttachment] = useState(null);

  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadTickets = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await apiClient.get('/support');
        setTickets(res.data?.tickets || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadTickets(false);
  }, [loadTickets]);

  const createTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (attachment) {
        const fd = new FormData();
        fd.append('subject', form.subject);
        fd.append('category', form.category);
        fd.append('priority', form.priority);
        fd.append('message', form.message);
        fd.append('attachment', attachment);
        await apiClient.post('/support', fd, { isFormData: true });
      } else {
        await apiClient.post('/support', form);
      }
      showToast('Support ticket created');
      setForm({ subject: '', category: 'OTHER', priority: 'MEDIUM', message: '' });
      setAttachment(null);
      loadTickets(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selected || replyText.trim().length < 2) return;
    setReplying(true);
    try {
      const res = await apiClient.post(`/support/${selected._id}/reply`, {
        message: replyText.trim(),
      });
      showToast('Reply sent');
      setSelected(res.data.ticket);
      setReplyText('');
      loadTickets(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReplying(false);
    }
  };

  const openCount = tickets.filter((t) =>
    ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER'].includes(t.status)
  ).length;
  const resolvedCount = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  const filtered = tickets.filter((t) => {
    if (statusFilter === 'ACTIVE' && !['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER'].includes(t.status))
      return false;
    if (statusFilter === 'RESOLVED' && !['RESOLVED', 'CLOSED'].includes(t.status)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [t.ticketCode, t.subject, t.category]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="dash-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Help &amp; Support</h1>
          <p className="page-subtitle">
            Raise a ticket for wallet, claim, refund, or verification assistance and track replies.
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          disabled={refreshing}
          onClick={() => loadTickets(true)}
        >
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Clickable KPI Cards */}
      <div className="kpi-grid">
        <div
          className="kpi-card clickable"
          style={{ borderColor: statusFilter === 'ALL' ? 'var(--color-primary)' : undefined }}
          onClick={() => setStatusFilter('ALL')}
        >
          <div className="kpi-top">
            <span className="kpi-icon navy">
              <HelpCircle size={15} />
            </span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
          <div className="kpi-value">{tickets.length}</div>
          <div className="kpi-label">Total Tickets</div>
          <div className="kpi-sub">Show all</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: statusFilter === 'ACTIVE' ? 'var(--color-primary)' : undefined }}
          onClick={() => setStatusFilter('ACTIVE')}
        >
          <div className="kpi-top">
            <span className="kpi-icon amber">
              <Clock size={15} />
            </span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
          <div className="kpi-value">{openCount}</div>
          <div className="kpi-label">Open / In Progress</div>
          <div className="kpi-sub">Filter active</div>
        </div>
        <div
          className="kpi-card clickable"
          style={{ borderColor: statusFilter === 'RESOLVED' ? 'var(--color-primary)' : undefined }}
          onClick={() => setStatusFilter('RESOLVED')}
        >
          <div className="kpi-top">
            <span className="kpi-icon green">
              <CheckCircle2 size={15} />
            </span>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </div>
          <div className="kpi-value">{resolvedCount}</div>
          <div className="kpi-label">Resolved / Closed</div>
          <div className="kpi-sub">Filter resolved</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Create Ticket Form */}
        <form className="card" onSubmit={createTicket}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Create Support Ticket</h3>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              className="input"
              required
              minLength={4}
              placeholder="Brief summary of your issue..."
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="WALLET">Wallet &amp; Recharge</option>
                <option value="CLAIM">Lead Claim</option>
                <option value="REFUND">Refund Dispute</option>
                <option value="VERIFICATION">Verification</option>
                <option value="TECHNICAL">Technical</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="textarea"
              rows={3}
              required
              minLength={5}
              placeholder="Describe the details clearly..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Paperclip size={12} /> Optional Attachment (JPG, PNG, PDF up to 5MB)
            </label>
            <input
              className="input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
            <Send size={13} /> {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>

        {/* My Tickets List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="page-header">
            <h3 style={{ fontSize: 14 }}>My Tickets ({filtered.length})</h3>
          </div>
          <input
            className="input"
            placeholder="Search tickets by code, subject, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading ? (
            <div className="skeleton" style={{ height: 180 }} />
          ) : filtered.length === 0 ? (
            <div className="empty-state">No support tickets found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((t) => (
                <div
                  key={t._id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 12.5 }}>{t.ticketCode}</strong>
                      <StatusBadge status={t.status} />
                      <span className="badge badge-gray">{t.category}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3 }}>{t.subject}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 2 }}>
                      {t.messages?.length || 0} msg(s) | Updated {new Date(t.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => setSelected(t)}
                  >
                    <MessageSquare size={12} /> Open
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Thread Modal (Matches My Leads Modal Style) */}
      <Modal
        open={Boolean(selected)}
        title={selected ? `Support Ticket - ${selected.ticketCode}` : 'Support Ticket'}
        onClose={() => {
          setSelected(null);
          setReplyText('');
        }}
      >
        {selected && (
          <form onSubmit={handleReply}>
            <div className="financial-box" style={{ marginBottom: 14 }}>
              <div className="financial-row">
                <span>Subject</span>
                <strong>{selected.subject}</strong>
              </div>
              <div className="financial-row">
                <span>Category &amp; Priority</span>
                <strong>
                  {selected.category} / {selected.priority}
                </strong>
              </div>
              <div className="financial-row total">
                <span>Current Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Conversation Thread ({selected.messages?.length || 0})</label>
              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  background: 'var(--color-canvas)',
                  border: '1px solid var(--color-border)',
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                {(selected.messages || []).length === 0 ? (
                  <div className="empty-state" style={{ padding: 14 }}>
                    No messages yet.
                  </div>
                ) : (
                  selected.messages.map((m, i) => {
                    const isUser = m.senderType === 'USER';
                    return (
                      <div
                        key={m._id || i}
                        style={{
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          background: isUser ? '#EFF6FF' : '#FFFFFF',
                          border: isUser ? '1px solid #BFDBFE' : '1px solid var(--color-border)',
                          borderRadius: 9,
                          padding: '8px 11px',
                          maxWidth: '88%',
                          fontSize: 12.5,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: isUser ? 'var(--color-primary)' : 'var(--color-muted)',
                            marginBottom: 3,
                          }}
                        >
                          {isUser ? 'You' : 'BUYIN Support'} | {new Date(m.createdAt).toLocaleString()}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {selected.status !== 'CLOSED' && (
              <div className="form-group">
                <label className="form-label">Add Follow-up Reply</label>
                <textarea
                  className="textarea"
                  rows={3}
                  required
                  minLength={2}
                  placeholder="Write your follow-up message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setSelected(null);
                  setReplyText('');
                }}
              >
                Close
              </button>
              {selected.status !== 'CLOSED' && (
                <button className="btn btn-primary" type="submit" disabled={replying}>
                  <Send size={13} /> {replying ? 'Sending...' : 'Send Reply'}
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell, Clock, CheckCircle2, Wallet, RefreshCw,
  CheckCheck, ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';

const NOTIF_TYPES = [
  'CLAIM', 'EXTENSION', 'EXPIRY', 'LEAD_RETURN',
  'WALLET', 'REFUND', 'VERIFICATION', 'FOLLOW_UP', 'SYSTEM',
];

function badgeClass(type) {
  if (type === 'WALLET' || type === 'CLAIM') return 'badge-green';
  if (type === 'REFUND' || type === 'EXPIRY') return 'badge-red';
  if (type === 'SYSTEM') return 'badge-blue';
  return 'badge-amber';
}

export function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readFilter, setReadFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiClient.get('/notifications');
      setItems(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    load(false);
  }, [load]);

  const markSingleRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`); load(true); } catch (err) { showToast(err.message, 'error'); } };  const markAll = async () => { try { await apiClient.post('/notifications/read-all'); showToast('All notifications marked as read'); load(true); } catch (err) { showToast(err.message, 'error'); } };  const filtered = items.filter((n) => { if (readFilter === 'UNREAD' && n.isRead) return false; if (readFilter === 'READ' && !n.isRead) return false; if (typeFilter && n.type !== typeFilter) return false; if (!search.trim()) return true; const q = search.toLowerCase(); return [n.title, n.message, n.type] .filter(Boolean) .some((v) => String(v).toLowerCase().includes(q)); });  const readCount = items.length - unreadCount; const walletClaimCount = items.filter((n) => ['WALLET', 'CLAIM', 'REFUND'].includes(n.type)).length;  return ( <div className="dash-wrap"> <div className="page-header"> <div> <h1 className="page-title">Notifications</h1> <p className="page-subtitle">Claim alerts, ownership expiry warnings, wallet credits, and refund updates.</p> </div> <div style={{ display: 'flex', gap: 8 }}> <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => load(true)}> <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh </button> <button className="btn btn-primary btn-sm" type="button" onClick={markAll} disabled={unreadCount === 0}> <CheckCheck size={13} /> Mark All Read ({unreadCount}) </button> </div> </div>  {/* Clickable Filter KPI Cards */} <div className="kpi-grid"> <div className="kpi-card clickable" style={{ borderColor: readFilter === 'ALL' && !typeFilter ? 'var(--color-primary)' : undefined }} onClick={() => { setReadFilter('ALL'); setTypeFilter(''); }} > <div className="kpi-top"><span className="kpi-icon navy"><Bell size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div> <div className="kpi-value">{items.length}</div> <div className="kpi-label">All Notifications</div> <div className="kpi-sub">Show all</div> </div> <div className="kpi-card clickable" style={{ borderColor: readFilter === 'UNREAD' ? 'var(--color-primary)' : undefined }} onClick={() => { setReadFilter('UNREAD'); setTypeFilter(''); }} > <div className="kpi-top"><span className="kpi-icon amber"><Clock size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div> <div className="kpi-value">{unreadCount}</div> <div className="kpi-label">Unread</div> <div className="kpi-sub">Filter unread</div> </div> <div className="kpi-card clickable" style={{ borderColor: readFilter === 'READ' ? 'var(--color-primary)' : undefined }} onClick={() => { setReadFilter('READ'); setTypeFilter(''); }} > <div className="kpi-top"><span className="kpi-icon green"><CheckCircle2 size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div> <div className="kpi-value">{readCount}</div> <div className="kpi-label">Read</div> <div className="kpi-sub">Filter read</div> </div> <div className="kpi-card clickable" style={{ borderColor: typeFilter === 'WALLET' ? 'var(--color-primary)' : undefined }} onClick={() => { setReadFilter('ALL'); setTypeFilter('WALLET'); }} > <div className="kpi-top"><span className="kpi-icon blue"><Wallet size={15} /></span><ArrowUpRight size={14} className="kpi-arrow" /></div> <div className="kpi-value">{walletClaimCount}</div> <div className="kpi-label">Wallet / Claim / Refund</div> <div className="kpi-sub">Filter wallet alerts</div> </div> </div>  {/* Search & Filter Bar */} <div className="card"> <div className="filter-bar"> <input className="input" placeholder="Search notifications by title or message..." value={search} onChange={(e) => setSearch(e.target.value)} /> <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}> <option value="">All Categories</option> {NOTIF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)} </select> </div> </div>  {/* Notifications List */} {loading ? ( <div className="skeleton" style={{ height: 220 }} /> ) : filtered.length === 0 ? ( <div className="card empty-state">You are all caught up.</div> ) : ( <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}> {filtered.map((n) => ( <div key={n._id} className="card" style={{ borderLeft: n.isRead ? '3px solid var(--color-border)' : '3px solid var(--color-primary)', opacity: n.isRead ? 0.78 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, }} > <div style={{ flex: 1 }}> <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}> <span className={`badge ${badgeClass(n.type)}`}>{n.type}</span>
                  <strong style={{ fontSize: 13 }}>{n.title}</strong>
                  {!n.isRead && <span className="badge badge-blue">New</span>}
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 4 }}>{n.message}</p>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.isRead && (
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => markSingleRead(n._id)}>
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
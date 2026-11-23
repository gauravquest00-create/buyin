import React, { useEffect, useState, useCallback } from 'react';
import {
  Tags, MapPin, Building2, Home, Layers,
  RefreshCw, Plus, ArrowUpRight, Power,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

const CATEGORY_TYPES = [
  { key: 'CITY', label: 'City' },
  { key: 'LOCATION', label: 'Micro-Location' },
  { key: 'PROPERTY_TYPE', label: 'Property Type' },
  { key: 'CONFIGURATION', label: 'Configuration' },
];

function typeBadgeClass(type) {
  if (type === 'CITY') return 'badge-blue';
  if (type === 'LOCATION') return 'badge-green';
  if (type === 'PROPERTY_TYPE') return 'badge-amber';
  return 'badge-gray';
}

export function CategoryManagementPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'CITY', name: '', parentName: '', sortOrder: 0 });

  const loadCategories = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCategories(false);
  }, [loadCategories]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.post('/categories', {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      });
      showToast(`${form.type} "${form.name}" added`);
      setForm({ type: form.type, name: '', parentName: '', sortOrder: 0 });
      setShowAdd(false);
      loadCategories(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cat) => {
    try {
      await adminApi.patch(`/categories/${cat._id}`, { isActive: !cat.isActive });
      showToast(`${cat.name} ${cat.isActive ? 'deactivated' : 'activated'}`);
      loadCategories(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = categories.filter((c) => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [c.name, c.parentName, c.type].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  const cityCount = categories.filter((c) => c.type === 'CITY').length;
  const locationCount = categories.filter((c) => c.type === 'LOCATION').length;
  const propCount = categories.filter((c) => c.type === 'PROPERTY_TYPE').length;
  const configCount = categories.filter((c) => c.type === 'CONFIGURATION').length;

  const KPI_CARDS = [
    { label: 'All Master Data', value: categories.length, hint: 'Show all', type: '', icon: Tags, tone: 'navy' },
    { label: 'Cities', value: cityCount, hint: 'Filter cities', type: 'CITY', icon: Building2, tone: 'blue' },
    { label: 'Micro-Locations', value: locationCount, hint: 'Filter locations', type: 'LOCATION', icon: MapPin, tone: 'green' },
    { label: 'Property Types', value: propCount, hint: 'Filter types', type: 'PROPERTY_TYPE', icon: Home, tone: 'amber' },
    { label: 'Configurations', value: configCount, hint: 'Filter configs', type: 'CONFIGURATION', icon: Layers, tone: 'navy' },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>Categories & Master Data</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Configure supported cities, micro-locations, property types, and configurations across BUYIN.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadCategories(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setShowAdd((v) => !v)}>
            <Plus size={14} /> {showAdd ? 'Close Form' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* Clickable Filter KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, type, icon: Icon, tone }, idx) => (
          <div
            key={label}
            onClick={() => setTypeFilter(type)}
            className="dash-kpi-card"
            style={{
              animationDelay: `${idx * 40}ms`,
              borderColor: typeFilter === type ? 'var(--primary)' : undefined,
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

      {/* Add Category Form */}
      {showAdd && (
        <form className="card" onSubmit={handleCreate}>
          <div className="header-row" style={{ marginBottom: 12 }}>
            <h3>Add Master Data Entry</h3>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category Type</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {CATEGORY_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="input" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gurugram, Sector 65, 3 BHK + Servant" />
            </div>
            <div className="form-group">
              <label className="form-label">Parent City (Optional, for Micro-Locations)</label>
              <input className="input" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="e.g. Gurugram" />
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order</label>
              <input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          className="input"
          style={{ flex: '2 1 240px' }}
          placeholder="Search city, location, property type, or configuration..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" style={{ flex: '1 1 180px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Category Types</option>
          {CATEGORY_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 240 }} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Parent</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No master data entries match your filter.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id}>
                    <td><span className={`badge ${typeBadgeClass(c.type)}`}>{c.type}</span></td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.parentName || '-'}</td>
                    <td>{c.sortOrder ?? 0}</td>
                    <td>
                      <span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${c.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(c)}
                      >
                        <Power size={12} /> {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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
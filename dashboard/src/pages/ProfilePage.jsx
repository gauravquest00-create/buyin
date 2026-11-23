import React, { useEffect, useState, useCallback } from 'react';
import {
  UserCheck, ShieldCheck, MapPin, MonitorSmartphone,
  RefreshCw, Save, Upload, LogOut,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

const PROPERTY_TYPES = [
  'Apartment', 'Builder Floor', 'Residential Plot',
  'Independent House', 'Villa/Luxury', 'Commercial',
];

export function ProfilePage() {
  const { refreshMe, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('VERIFICATION');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verification, setVerification] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [form, setForm] = useState({
    fullName: '',
    professionalRole: 'Broker / Consultant',
    agencyName: '',
    experienceYears: 2,
    city: '',
    workingLocations: '',
    languages: 'English, Hindi',
    reraNumber: '',
    propertyPreferences: [],
  });

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [pRes, vRes, sRes] = await Promise.all([
        apiClient.get('/profile'),
        apiClient.get('/verification/status'),
        apiClient.get('/auth/sessions').catch(() => ({ data: { sessions: [] } })),
      ]);
      const p = pRes.data.profile || {};
      setForm({
        fullName: p.fullName || '',
        professionalRole: p.professionalRole || 'Broker / Consultant',
        agencyName: p.agencyName || '',
        experienceYears: p.experienceYears ?? 0,
        city: p.city || '',
        workingLocations: (p.workingLocations || []).join(', '),
        languages: (p.languages || []).join(', '),
        reraNumber: p.reraNumber || '',
        propertyPreferences: p.propertyPreferences || [],
      });
      setVerification(vRes.data);
      setSessions(sRes.data?.sessions || []);
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

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('professionalRole', form.professionalRole);
      fd.append('agencyName', form.agencyName);
      fd.append('experienceYears', String(form.experienceYears));
      fd.append('city', form.city);
      fd.append('workingLocations', form.workingLocations);
      fd.append('languages', form.languages);
      fd.append('reraNumber', form.reraNumber);
      for (const f of selectedFiles) {
        fd.append('documents', f);
      }

      await apiClient.post('/verification/submit', fd, { isFormData: true });
      showToast('Professional profile and verification submitted for admin review');
      setSelectedFiles([]);
      await refreshMe();
      await loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch('/profile', {
        propertyPreferences: form.propertyPreferences,
        workingLocations: form.workingLocations.split(',').map((s) => s.trim()).filter(Boolean),
      });
      showToast('Discovery preferences saved');
      await loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePropertyPref = (prop) => {
    setForm((prev) => {
      const has = prev.propertyPreferences.includes(prop);
      return {
        ...prev,
        propertyPreferences: has
          ? prev.propertyPreferences.filter((p) => p !== prop)
          : [...prev.propertyPreferences, prop],
      };
    });
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Sign out from all active devices and sessions?')) return;
    try {
      await apiClient.post('/auth/sessions/revoke-all');
      showToast('All active sessions revoked');
      await logout();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="dash-wrap">
        <div className="page-header">
          <div className="skeleton" style={{ width: 240, height: 26 }} />
          <div className="skeleton" style={{ width: 96, height: 30 }} />
        </div>
        <div className="kpi-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 92 }} />)}
        </div>
        <div className="skeleton" style={{ height: 280 }} />
      </div>
    );
  }

  const locationsCount = form.workingLocations.split(',').map((s) => s.trim()).filter(Boolean).length;
  const adminRemarks = verification?.latestRecord?.adminRemarks;

  return (
    <div className="dash-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile &amp; Verification</h1>
          <p className="page-subtitle">Manage your real-estate credentials, discovery preferences, and active sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge status={verification?.verificationStatus || 'NOT_SUBMITTED'} />
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadData(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card clickable" onClick={() => setActiveTab('VERIFICATION')}>
          <div className="kpi-top"><span className="kpi-icon blue"><UserCheck size={15} /></span></div>
          <div className="kpi-value" style={{ fontSize: 16 }}>{verification?.userStatus || 'PENDING'}</div>
          <div className="kpi-label">Account Status</div>
        </div>
        <div className="kpi-card clickable" onClick={() => setActiveTab('VERIFICATION')}>
          <div className="kpi-top"><span className="kpi-icon green"><ShieldCheck size={15} /></span></div>
          <div className="kpi-value" style={{ fontSize: 16 }}>{verification?.verificationStatus || 'NOT_SUBMITTED'}</div>
          <div className="kpi-label">KYC / RERA Status</div>
        </div>
        <div className="kpi-card clickable" onClick={() => setActiveTab('PREFERENCES')}>
          <div className="kpi-top"><span className="kpi-icon amber"><MapPin size={15} /></span></div>
          <div className="kpi-value">{locationsCount}</div>
          <div className="kpi-label">Working Locations</div>
        </div>
        <div className="kpi-card clickable" onClick={() => setActiveTab('SESSIONS')}>
          <div className="kpi-top"><span className="kpi-icon navy"><MonitorSmartphone size={15} /></span></div>
          <div className="kpi-value">{sessions.length}</div>
          <div className="kpi-label">Active Sessions</div>
        </div>
      </div>

      {adminRemarks && (
        <div className="card" style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-soft)', fontSize: 12.5 }}>
          <strong>Latest Verification Remark from Admin:</strong> {adminRemarks}
        </div>
      )}

      {/* Tabs */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className={`btn btn-sm ${activeTab === 'VERIFICATION' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('VERIFICATION')}>
          <ShieldCheck size={13} /> Professional Verification
        </button>
        <button type="button" className={`btn btn-sm ${activeTab === 'PREFERENCES' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('PREFERENCES')}>
          <MapPin size={13} /> Discovery Preferences
        </button>
        <button type="button" className={`btn btn-sm ${activeTab === 'SESSIONS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('SESSIONS')}>
          <MonitorSmartphone size={13} /> Active Sessions ({sessions.length})
        </button>
      </div>

      {/* Tab 1: Professional Verification */}
      {activeTab === 'VERIFICATION' && (
        <form className="card" onSubmit={handleSubmitVerification}>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 14 }}>Professional Onboarding &amp; KYC</h3>
            <button className="btn btn-primary btn-sm" disabled={saving} type="submit">
              <Save size={13} /> {saving ? 'Submitting...' : 'Save & Submit Verification'}
            </button>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Professional Role</label>
              <input className="input" required value={form.professionalRole} onChange={(e) => setForm({ ...form, professionalRole: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Agency / Firm Name</label>
              <input className="input" value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input className="input" type="number" min={0} max={60} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Primary City</label>
              <input className="input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">RERA Registration Number (Optional)</label>
              <input className="input" value={form.reraNumber} onChange={(e) => setForm({ ...form, reraNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Working Locations (comma-separated)</label>
              <input className="input" required value={form.workingLocations} onChange={(e) => setForm({ ...form, workingLocations: e.target.value })} placeholder="e.g. Golf Course Road, Sohna Road" />
            </div>
            <div className="form-group">
              <label className="form-label">Languages Spoken (comma-separated)</label>
              <input className="input" required value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Upload size={13} /> Supporting Documents (ID / RERA Certificate - JPG, PNG, PDF up to 5MB, stored privately)
            </label>
            <input
              className="input"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
            {selectedFiles.length > 0 && (
              <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 4 }}>
                Selected: {selectedFiles.map((f) => f.name).join(', ')}
              </div>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: Discovery Preferences */}
      {activeTab === 'PREFERENCES' && (
        <form className="card" onSubmit={handleSavePreferences}>
          <div className="page-header" style={{ marginBottom: 10 }}>
            <div>
              <h3 style={{ fontSize: 14 }}>Property &amp; Discovery Preferences</h3>
              <p style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>
                Preferences help personalize your Lead Pool browsing and never block access to eligible requirements.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
              <Save size={13} /> {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            {PROPERTY_TYPES.map((prop) => {
              const checked = form.propertyPreferences.includes(prop);
              return (
                <label
                  key={prop}
                  className="card"
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12.5,
                    borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
                    background: checked ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  }}
                >
                  <input type="checkbox" checked={checked} onChange={() => togglePropertyPref(prop)} />
                  <span>{prop}</span>
                </label>
              );
            })}
          </div>
        </form>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === 'SESSIONS' && (
        <div className="card">
          <div className="page-header" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: 14 }}>Active Device Sessions</h3>
            <button className="btn btn-danger btn-sm" type="button" onClick={handleRevokeAll}>
              <LogOut size={13} /> Revoke All Sessions
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Device / User Agent</th><th>IP Address</th><th>Created</th><th>Expires</th></tr></thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--color-muted)' }}>No active session records found.</td></tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s._id}>
                      <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.userAgent || 'Browser Session'}</td>
                      <td>{s.ipAddress || '-'}</td>
                      <td style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>{new Date(s.createdAt).toLocaleString()}</td>
                      <td style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>{new Date(s.expiresAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
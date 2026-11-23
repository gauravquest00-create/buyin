import React, { useEffect, useState, useCallback } from 'react';
import {
  Settings, ShieldAlert, FileClock, KeyRound, RefreshCw,
  ArrowUpRight, Save, ShieldCheck, Lock,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

export function SystemSettingsAuditPage() {
  const { admin, loadMe, logout } = useAdminAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('SETTINGS');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audit filters
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Editable numeric/string settings state
  const [draftValues, setDraftValues] = useState({});

  // MFA & Password security state
  const [mfaSetup, setMfaSetup] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        adminApi.get('/settings'),
        adminApi.get('/audit-logs', { limit: 100, ...(moduleFilter ? { module: moduleFilter } : {}) }),
      ]);
      const list = sRes.data.settings || [];
      setSettings(list);
      setDraftValues(Object.fromEntries(list.map((s) => [s.key, s.value])));
      setLogs(lRes.data.logs || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [moduleFilter, showToast]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const toggleBoolSetting = async (setting) => {
    try {
      await adminApi.put('/settings', { key: setting.key, value: !setting.value });
      showToast(`Updated ${setting.key} → ${String(!setting.value).toUpperCase()}`);
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const saveValueSetting = async (setting) => {
    const raw = draftValues[setting.key];
    const parsed = typeof setting.value === 'number' ? Number(raw) : raw;
    try {
      await adminApi.put('/settings', { key: setting.key, value: parsed });
      showToast(`Saved ${setting.key}`);
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const startMfaEnroll = async () => {
    try {
      const res = await adminApi.post('/auth/mfa/enroll');
      setMfaSetup(res.data);
      showToast('MFA secret generated. Add to your Authenticator app and enter the 6-digit code.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmMfa = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/auth/mfa/confirm', { totpCode });
      showToast('MFA enabled on your Super Admin account!');
      setMfaSetup(null);
      setTotpCode('');
      await loadMe();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await adminApi.post('/auth/change-password', pwdForm);
      showToast('Password updated. Please sign in again.');
      await logout();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const emergencySettings = settings.filter((s) => s.category === 'EMERGENCY');
  const activeEmergencyCount = emergencySettings.filter((s) => s.value === true).length;
  const distinctModules = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)));

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [l.action, l.module, l.actorEmail, l.targetType, l.targetId, l.reason]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const KPI_CARDS = [
    { label: 'System Settings', value: settings.length, hint: 'Manage controls', tab: 'SETTINGS', icon: Settings, tone: 'navy' },
    { label: 'Emergency Locks Active', value: activeEmergencyCount, hint: 'Emergency switches', tab: 'SETTINGS', icon: ShieldAlert, tone: activeEmergencyCount > 0 ? 'red' : 'green' },
    { label: 'Audit Trail Events', value: logs.length, hint: 'Inspect immutable logs', tab: 'AUDIT', icon: FileClock, tone: 'blue' },
    { label: 'Admin MFA Status', value: admin?.mfaEnabled ? 'Enabled' : 'Not Set', hint: 'Security & password', tab: 'SECURITY', icon: KeyRound, tone: admin?.mfaEnabled ? 'green' : 'amber' },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>System Settings, Security & Audit Logs</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Manage runtime platform rules, emergency locks, Super Admin TOTP MFA, and the immutable administrative audit trail.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadData(true)}>
          <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Clickable KPI Cards */}
      <div className="dash-kpi-grid">
        {KPI_CARDS.map(({ label, value, hint, tab, icon: Icon, tone }, idx) => (
          <div
            key={label}
            onClick={() => setActiveTab(tab)}
            className="dash-kpi-card"
            style={{
              animationDelay: `${idx * 40}ms`,
              borderColor: activeTab === tab ? 'var(--primary)' : undefined,
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

      {/* Tab Switcher */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className={`btn btn-sm ${activeTab === 'SETTINGS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('SETTINGS')}>
          <Settings size={13} /> Platform Settings ({settings.length})
        </button>
        <button type="button" className={`btn btn-sm ${activeTab === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('AUDIT')}>
          <FileClock size={13} /> Immutable Audit Logs ({logs.length})
        </button>
        <button type="button" className={`btn btn-sm ${activeTab === 'SECURITY' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('SECURITY')}>
          <Lock size={13} /> Admin MFA & Password
        </button>
      </div>

      {loading ? (
        <div className="dash-skeleton" style={{ height: 260 }} />
      ) : activeTab === 'SETTINGS' ? (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Configurable Platform Controls</h3>
          {settings.map((s) => (
            <div
              key={s._id}
              style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
                gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong>{s.key}</strong>
                  <span className={`badge ${s.category === 'EMERGENCY' ? 'badge-red' : 'badge-gray'}`}>{s.category}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{s.description}</div>
              </div>
              {typeof s.value === 'boolean' ? (
                <button
                  type="button"
                  className={`btn btn-sm ${s.value ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => toggleBoolSetting(s)}
                >
                  {s.value ? 'ENABLED' : 'DISABLED'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="input"
                    style={{ width: 110, textAlign: 'right' }}
                    type={typeof s.value === 'number' ? 'number' : 'text'}
                    step="any"
                    value={draftValues[s.key] ?? ''}
                    onChange={(e) => setDraftValues({ ...draftValues, [s.key]: e.target.value })}
                  />
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => saveValueSetting(s)}>
                    <Save size={12} /> Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : activeTab === 'AUDIT' ? (
        <>
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <input
              className="input"
              style={{ flex: '2 1 240px' }}
              placeholder="Search action, actor email, target, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="select" style={{ flex: '1 1 180px' }} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              <option value="">All Modules</option>
              {distinctModules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Admin Actor</th>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No audit logs found.</td></tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l._id}>
                      <td><span className="badge badge-blue">{l.action}</span></td>
                      <td>{l.module}</td>
                      <td>{l.actorEmail || l.actorType}</td>
                      <td style={{ fontSize: 11.5 }}>{l.targetType ? `${l.targetType}:${l.targetId}` : '-'}</td>
                      <td>{l.reason || '-'}</td>
                      <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(l.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid-2">
          <div className="analysis-card">
            <div className="analysis-head">
              <span className="analysis-title"><ShieldCheck size={14} /> Super Admin TOTP MFA</span>
              <span className={`badge ${admin?.mfaEnabled ? 'badge-green' : 'badge-amber'}`}>
                {admin?.mfaEnabled ? 'MFA Active' : 'Not Enrolled'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Protect your administrative login with any RFC 6238 Authenticator app (Google Authenticator, Authy, 1Password).
            </p>
            {!mfaSetup ? (
              <button className="btn btn-primary btn-sm" type="button" onClick={startMfaEnroll} style={{ alignSelf: 'flex-start' }}>
                {admin?.mfaEnabled ? 'Re-Enroll TOTP Secret' : 'Enable TOTP MFA'}
              </button>
            ) : (
              <form onSubmit={confirmMfa} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'var(--canvas)', padding: 10, borderRadius: 8, fontSize: 12, wordBreak: 'break-all' }}>
                  <div><strong>Manual Secret Key:</strong> <code>{mfaSetup.secret}</code></div>
                  <div style={{ marginTop: 4, color: 'var(--muted)' }}>URI: <code>{mfaSetup.otpAuthUri}</code></div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Enter 6-Digit Code from Authenticator</label>
                  <input className="input" required maxLength={6} placeholder="123456" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
                </div>
                <button className="btn btn-success btn-sm" type="submit">Verify & Activate MFA</button>
              </form>
            )}
          </div>

          <form className="analysis-card" onSubmit={handleChangePassword}>
            <div className="analysis-head">
              <span className="analysis-title"><KeyRound size={14} /> Change Admin Password</span>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <input className="input" type="password" required value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password (min 10 characters)</label>
              <input className="input" type="password" required minLength={10} value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf: 'flex-start' }}>
              Update Password & Revoke Sessions
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
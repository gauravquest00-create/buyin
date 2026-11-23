import React, { useEffect, useState, useCallback } from 'react';
import {
  Lock, Shield, KeyRound, Users, Plus, Edit3,
  RefreshCw, ArrowUpRight, Power, UserPlus,
} from 'lucide-react';
import { adminApi } from '../services/apiClient.js';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/dashboard.css';

export function RolesPermissionsPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [activeTab, setActiveTab] = useState('ROLES');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Role Modal
  const [roleModal, setRoleModal] = useState(null); // null | { mode: 'create' | 'edit', _id?, name, description, permissions }
  const [savingRole, setSavingRole] = useState(false);

  // Staff Admin Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ fullName: '', email: '', password: '', roleId: '' });
  const [savingAdmin, setSavingAdmin] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        adminApi.get('/roles'),
        adminApi.get('/admins').catch(() => ({ data: { admins: [] } })),
      ]);
      setRoles(rRes.data.roles || []);
      setPermissions(rRes.data.permissions || []);
      setAdmins(aRes.data?.admins || []);
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

  // Group permissions by module for clean matrix display
  const permsByModule = permissions.reduce((acc, p) => {
    const mod = p.module || p.key.split(':')[0] || 'general';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  const openCreateRole = () => {
    setRoleModal({ mode: 'create', name: '', description: '', permissions: ['dashboard:read'] });
  };

  const openEditRole = (role) => {
    setRoleModal({
      mode: 'edit',
      _id: role._id,
      name: role.name,
      description: role.description || '',
      permissions: [...(role.permissions || [])],
    });
  };

  const togglePermission = (key) => {
    setRoleModal((prev) => {
      const exists = prev.permissions.includes(key);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((k) => k !== key) : [...prev.permissions, key],
      };
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleModal || roleModal.permissions.length === 0) {
      showToast('Select at least one permission.', 'error');
      return;
    }
    setSavingRole(true);
    try {
      const payload = {
        name: roleModal.name.trim(),
        description: roleModal.description.trim(),
        permissions: roleModal.permissions,
      };
      if (roleModal.mode === 'create') {
        await adminApi.post('/roles', payload);
        showToast(`Role "${payload.name}" created`);
      } else {
        await adminApi.put(`/roles/${roleModal._id}`, payload);
        showToast(`Role "${payload.name}" updated`);
      }
      setRoleModal(null);
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSavingAdmin(true);
    try {
      await adminApi.post('/admins', adminForm);
      showToast(`Staff admin ${adminForm.email} created`);
      setShowAdminModal(false);
      setAdminForm({ fullName: '', email: '', password: '', roleId: '' });
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingAdmin(false);
    }
  };

  const toggleAdminActive = async (a) => {
    try {
      await adminApi.patch(`/admins/${a._id}`, { isActive: !a.isActive });
      showToast(`${a.fullName} ${a.isActive ? 'deactivated' : 'activated'}`);
      loadData(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const systemRolesCount = roles.filter((r) => r.isSystemRole).length;
  const customRolesCount = roles.length - systemRolesCount;
  const activeAdminsCount = admins.filter((a) => a.isActive).length;

  const KPI_CARDS = [
    { label: 'Total Roles', value: roles.length, hint: 'View roles', icon: Lock, tone: 'navy', onClick: () => setActiveTab('ROLES') },
    { label: 'Built-In System Roles', value: systemRolesCount, hint: 'Standard RBAC', icon: Shield, tone: 'blue', onClick: () => setActiveTab('ROLES') },
    { label: 'Custom Roles', value: customRolesCount, hint: 'Create custom role', icon: Edit3, tone: 'amber', onClick: openCreateRole },
    { label: 'Granular Permissions', value: permissions.length, hint: 'Module:action keys', icon: KeyRound, tone: 'green', onClick: () => setActiveTab('ROLES') },
    { label: 'Active Staff Admins', value: `${activeAdminsCount} / ${admins.length}`, hint: 'Manage staff', icon: Users, tone: 'blue', onClick: () => setActiveTab('ADMINS') },
  ];

  return (
    <div className="dash-wrap">
      <div className="header-row">
        <div>
          <h1>RBAC Roles, Permissions & Staff Admins</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Manage granular module-level permissions and create/assign sub-admin accounts with strict least-privilege access.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" type="button" disabled={refreshing} onClick={() => loadData(true)}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdminModal(true)}>
            <UserPlus size={13} /> New Staff Admin
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={openCreateRole}>
            <Plus size={14} /> New Role
          </button>
        </div>
      </div>

      {/* Clickable KPI Cards */}
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

      {/* Tab Switcher */}
      <div className="card" style={{ display: 'flex', gap: 8 }}>
        <button type="button" className={`btn btn-sm ${activeTab === 'ROLES' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('ROLES')}>
          <Lock size={13} /> Roles & Permissions ({roles.length})
        </button>
        <button type="button" className={`btn btn-sm ${activeTab === 'ADMINS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('ADMINS')}>
          <Users size={13} /> Admin Staff Accounts ({admins.length})
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="dash-skeleton" style={{ height: 250 }} />
      ) : activeTab === 'ROLES' ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.name}</strong></td>
                  <td>{r.description || '-'}</td>
                  <td>
                    <span className="badge badge-blue">{r.permissions?.length || 0} permissions</span>
                  </td>
                  <td>
                    <span className={`badge ${r.isSystemRole ? 'badge-gray' : 'badge-amber'}`}>
                      {r.isSystemRole ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => openEditRole(r)}>
                      <Edit3 size={12} /> Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>MFA</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id}>
                  <td><strong>{a.fullName}</strong></td>
                  <td>{a.email}</td>
                  <td><span className="badge badge-blue">{a.roleId?.name || 'Staff'}</span></td>
                  <td>
                    <span className={`badge ${a.mfaEnabled ? 'badge-green' : 'badge-amber'}`}>
                      {a.mfaEnabled ? 'Enabled' : 'Not Enrolled'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${a.isActive ? 'badge-green' : 'badge-red'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {!a.isBootstrapAdmin && (
                      <button
                        type="button"
                        className={`btn btn-sm ${a.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleAdminActive(a)}
                      >
                        <Power size={12} /> {a.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {roleModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
          }}
          onClick={() => setRoleModal(null)}
        >
          <form
            className="card"
            style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 20 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveRole}
          >
            <div className="header-row" style={{ marginBottom: 12 }}>
              <h3>{roleModal.mode === 'create' ? 'Create Custom Role' : `Edit Role — ${roleModal.name}`}</h3>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setRoleModal(null)}>Close</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role Name</label>
                <input className="input" required value={roleModal.name} onChange={(e) => setRoleModal({ ...roleModal, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="input" value={roleModal.description} onChange={(e) => setRoleModal({ ...roleModal, description: e.target.value })} />
              </div>
            </div>

            <div className="header-row" style={{ margin: '8px 0' }}>
              <span className="form-label">Permissions ({roleModal.permissions.length} selected)</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRoleModal({ ...roleModal, permissions: permissions.map((p) => p.key) })}>Select All</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRoleModal({ ...roleModal, permissions: [] })}>Clear</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, background: 'var(--canvas)', padding: 12, borderRadius: 8 }}>
              {Object.entries(permsByModule).map(([mod, list]) => (
                <div key={mod} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)' }}>{mod}</strong>
                  {list.map((p) => (
                    <label key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={roleModal.permissions.includes(p.key)} onChange={() => togglePermission(p.key)} />
                      <span>{p.action}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setRoleModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="submit" disabled={savingRole}>
                {savingRole ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Staff Admin Modal */}
      {showAdminModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100,
          }}
          onClick={() => setShowAdminModal(false)}
        >
          <form className="card" style={{ width: '100%', maxWidth: 440, padding: 20 }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreateAdmin}>
            <div className="header-row" style={{ marginBottom: 12 }}>
              <h3>Create Staff Admin Account</h3>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdminModal(false)}>Close</button>
            </div>
            <div className="form-group"><label className="form-label">Full Name</label><input className="input" required value={adminForm.fullName} onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Work Email</label><input className="input" type="email" required value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Initial Password (min 10 chars)</label><input className="input" type="password" required minLength={10} value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} /></div>
            <div className="form-group">
              <label className="form-label">Assign RBAC Role</label>
              <select className="select" required value={adminForm.roleId} onChange={(e) => setAdminForm({ ...adminForm, roleId: e.target.value })}>
                <option value="">Choose role...</option>
                {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdminModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="submit" disabled={savingAdmin}>
                {savingAdmin ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Layers, FileSpreadsheet, KeyRound, Wallet, Sliders,
  CreditCard, RotateCcw, Tags, Bell, LifeBuoy, BarChart3, Lock, Settings, Menu, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard & Analytics', icon: LayoutDashboard, end: true },
      { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Professionals',
    items: [
      { to: '/users', label: 'User Management', icon: Users },
      { to: '/verifications', label: 'Verification Queue', icon: ShieldCheck },
    ],
  },
  {
    label: 'Buyer Requirements',
    items: [
      { to: '/lead-pool', label: 'Lead Pool Control', icon: Layers },
      { to: '/leads', label: 'Lead Management', icon: FileSpreadsheet },
      { to: '/claims', label: 'Claim & Ownership', icon: KeyRound },
      { to: '/categories', label: 'Categories & Master', icon: Tags },
    ],
  },
  {
    label: 'Finance & Pricing',
    items: [
      { to: '/wallets', label: 'Wallet Management', icon: Wallet },
      { to: '/pricing', label: 'Pricing & Claim Engine', icon: Sliders },
      { to: '/payments', label: 'Recharge & Payments', icon: CreditCard },
      { to: '/refunds', label: 'Refunds & Disputes', icon: RotateCcw },
    ],
  },
  {
    label: 'Operations & Security',
    items: [
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/support', label: 'Support & Complaints', icon: LifeBuoy },
      { to: '/roles', label: 'Roles & Permissions', icon: Lock },
      { to: '/settings-audit', label: 'Settings & Audit Logs', icon: Settings },
    ],
  },
];

export function AdminShell({ children }) {
  const { admin, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('buyin_admin_sidebar_collapsed') === 'true');

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('buyin_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={`admin-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <div className={`backdrop ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-brand">
          <div className="brand-text" title="BUYIN Admin">
            {collapsed ? (
              <span className="brand-mini">B<span>I</span></span>
            ) : (
              <>BUY<span>IN</span> <small className="brand-tag">ADMIN</small></>
            )}
          </div>
          <button
            type="button"
            className="collapse-btn"
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        <nav className="admin-nav">
          {GROUPS.map((g) => (
            <div key={g.label} className="nav-group">
              {!collapsed ? (
                <div className="nav-group-label">{g.label}</div>
              ) : (
                <div className="nav-group-divider" />
              )}
              {g.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={17} className="nav-icon" />
                  {!collapsed && <span className="nav-label">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {!collapsed && (
            <div className="admin-user-meta">
              <div className="admin-user-name">{admin?.fullName}</div>
              <div className="admin-user-role">{admin?.roleName}</div>
            </div>
          )}
          <button
            className={`sidebar-logout-btn ${collapsed ? 'icon-only' : ''}`}
            type="button"
            onClick={logout}
            title="Sign Out"
          >
            <LogOut size={15} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="mobile-toggle" onClick={() => setMobileOpen(true)} type="button" aria-label="Open menu">
              <Menu size={17} />
            </button>
            <div className="topbar-title">BUYIN Administrative Console</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-green">Admin Session</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{admin?.roleName}</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
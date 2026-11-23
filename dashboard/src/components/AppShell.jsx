import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Briefcase, Wallet, Receipt, UserCheck, Bell,
  HelpCircle, Menu, LogOut, PlusCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lead-pool', label: 'Lead Pool', icon: Layers },
  { to: '/my-leads', label: 'My Leads', icon: Briefcase },
  { to: '/wallet', label: 'My Wallet', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/profile', label: 'My Profile', icon: UserCheck },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/support', label: 'Help & Support', icon: HelpCircle },
];

export function AppShell({ children }) {
  const { user, walletBalance, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('buyin_user_sidebar_collapsed') === 'true');
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('buyin_user_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/lead-pool?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <div className={`sidebar-backdrop ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo" title="BUYIN">
            {collapsed ? (
              <>B<span>I</span></>
            ) : (
              <>BUY<span>IN</span> <small className="brand-tag">PRO</small></>
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

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={17} className="nav-icon" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{user?.verificationStatus}</div>
            </div>
          )}
          <button
            className={`sidebar-logout-btn ${collapsed ? 'icon-only' : ''}`}
            onClick={logout}
            type="button"
            title="Sign Out"
          >
            <LogOut size={15} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} type="button" aria-label="Open menu">
              <Menu size={17} />
            </button>
            <form onSubmit={handleGlobalSearch} style={{ flex: 1, display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="Search buyer requirements by city, location, budget..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </form>
          </div>
          <div className="topbar-right">
            <NavLink to="/wallet" className="wallet-pill" title="Wallet balance">
              <Wallet size={14} />
              <span>{walletBalance.toLocaleString()} pts</span>
            </NavLink>
            <NavLink to="/wallet" className="btn btn-primary btn-sm">
              <PlusCircle size={13} /> Recharge
            </NavLink>
            <NavLink to="/notifications" className="btn btn-secondary btn-sm" aria-label="Notifications">
              <Bell size={14} />
            </NavLink>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
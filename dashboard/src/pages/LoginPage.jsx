import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, Clock, RotateCcw, Eye, EyeOff, LogIn, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { APP_CONFIG } from '../config/api.js';
import '../styles/auth.css';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      showToast('Welcome back to BUYIN');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left Split Panel (PC / Desktop Only) */}
      <aside className="auth-hero-panel">
        <div className="auth-hero-brand">
          BUY<span>IN</span>
          <span className="badge badge-blue" style={{ fontSize: 10 }}>PRO NETWORK</span>
        </div>

        <div className="auth-hero-content">
          <span className="auth-hero-badge">
            <ShieldCheck size={13} /> Verified Real Estate Buyer Network
          </span>
          <h1 className="auth-hero-title">
            Exclusive Buyer Requirements. Zero Lead Duplication.
          </h1>
          <p className="auth-hero-sub">
            Claim verified high-intent buyer requirements from the shared BUYIN pool with transparent wallet points and full lifecycle control.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><Lock size={14} /></span>
              <div>
                <div className="auth-feature-title">One Active Owner Per Lead</div>
                <div className="auth-feature-desc">Buyer contact details stay masked until you claim exclusive ownership.</div>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><Clock size={14} /></span>
              <div>
                <div className="auth-feature-title">20-Day Ownership + 7-Day Extension</div>
                <div className="auth-feature-desc">Extend active ownership anytime for just 25% of original claim points.</div>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><RotateCcw size={14} /></span>
              <div>
                <div className="auth-feature-title">95% Fair Refund Protection</div>
                <div className="auth-feature-desc">Submit evidence on invalid or duplicate leads for admin-reviewed point credits.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          BUYIN Real Estate Buyer Requirement Network
          {APP_CONFIG.frontendUrl && (
            <>
              {' | '}
              <a href={APP_CONFIG.frontendUrl} style={{ color: '#93C5FD', fontWeight: 600 }}>
                Visit Public Website
              </a>
            </>
          )}
        </div>
      </aside>

      {/* Right Form Panel (Centered Card on Mobile) */}
      <main className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-mobile-brand">
            BUY<span>IN</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Professional Sign In</h2>
          <p className="page-subtitle" style={{ marginBottom: 18 }}>
            Sign in to browse buyer requirements, manage active claims, and recharge your wallet.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Work Email or Mobile Number</label>
              <input
                className="input"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="broker@agency.com or 98XXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-pwd-wrap">
                <input
                  className="input"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={submitting} type="submit">
              {submitting ? <RefreshCw size={14} className="dash-spin" /> : <LogIn size={14} />}
              {submitting ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--color-muted)', textAlign: 'center' }}>
            New to BUYIN?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Create Professional Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
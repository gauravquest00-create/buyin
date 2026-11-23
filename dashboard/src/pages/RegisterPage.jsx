import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, Clock, RotateCcw, Eye, EyeOff,
  UserPlus, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { apiClient, setStoredToken } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { APP_CONFIG } from '../config/api.js';
import '../styles/auth.css';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: '', mobile: '', email: '', password: '', otp: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { setUser, refreshMe } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/register', {
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      showToast('Account created! Enter the 6-digit OTP sent to your mobile.');
      setStep(2);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-otp', {
        mobile: form.mobile.trim(),
        otp: form.otp.trim(),
        purpose: 'REGISTER',
      });
      setStoredToken(res.data.token);
      setUser(res.data.user);
      await refreshMe();
      showToast('Mobile verified! Complete your professional verification profile.');
      navigate('/profile');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await apiClient.post('/auth/send-otp', { mobile: form.mobile.trim(), purpose: 'REGISTER' });
      showToast('OTP resent to your mobile');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResending(false);
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
            <ShieldCheck size={13} /> Join Verified Real Estate Professionals
          </span>
          <h1 className="auth-hero-title">
            Start Claiming Genuine Buyer Requirements Today.
          </h1>
          <p className="auth-hero-sub">
            Register in under a minute, verify your mobile via OTP, and submit your professional credentials to unlock exclusive lead claiming.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><Lock size={14} /></span>
              <div>
                <div className="auth-feature-title">Atomic Single-Owner Locking</div>
                <div className="auth-feature-desc">When you claim a buyer requirement, no other broker can claim it during your window.</div>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><Clock size={14} /></span>
              <div>
                <div className="auth-feature-title">20 Days + 7-Day Extension</div>
                <div className="auth-feature-desc">Full lifecycle tracking with follow-up reminders, site visits, and optional extension.</div>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><RotateCcw size={14} /></span>
              <div>
                <div className="auth-feature-title">Transparent Wallet &amp; 95% Refunds</div>
                <div className="auth-feature-desc">Recharge securely with Razorpay and request admin-reviewed refunds on invalid leads.</div>
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

      {/* Right Open Viewing Area (No Card Box) */}
      <main className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-mobile-brand">
            BUY<span>IN</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span className={`badge ${step === 1 ? 'badge-blue' : 'badge-green'}`}>Step {step} of 2</span>
            <span style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>
              {step === 1 ? 'Account Details' : 'Mobile OTP Verification'}
            </span>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {step === 1 ? 'Create Professional Account' : 'Verify Mobile OTP'}
          </h2>
          <p className="page-subtitle" style={{ marginBottom: 18 }}>
            {step === 1
              ? 'Register with your work email and 10-digit Indian mobile number.'
              : `Enter the 6-digit verification code sent to ${form.mobile}.`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="input"
                  required
                  minLength={2}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number (10 digits)</label>
                <input
                  className="input"
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="98XXXXXXXX"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="broker@agency.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password (min 8 characters)</label>
                <div className="auth-pwd-wrap">
                  <input
                    className="input"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a strong password"
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
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading} type="submit">
                {loading ? <RefreshCw size={14} className="dash-spin" /> : <UserPlus size={14} />}
                {loading ? 'Creating Account...' : 'Register & Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">6-Digit OTP</label>
                <input
                  className="input"
                  required
                  maxLength={6}
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  placeholder="Enter 6-digit code"
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading} type="submit">
                {loading ? <RefreshCw size={14} className="dash-spin" /> : <CheckCircle2 size={14} />}
                {loading ? 'Verifying...' : 'Verify OTP & Continue'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={resending}
                onClick={handleResendOtp}
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </form>
          )}

          <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--color-muted)', textAlign: 'center' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Sign In to Dashboard
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
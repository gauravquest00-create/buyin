import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password, mfaStep ? totpCode : undefined);
      if (res.mfaRequired) {
        setMfaStep(true);
        showToast('Enter your 6-digit TOTP authenticator code');
      } else {
        showToast('Authenticated into BUYIN Super Admin');
        navigate('/');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <h2 style={{ marginBottom: 4 }}>BUYIN Super Admin</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          Authorized platform administrators only. Separate security domain with MFA & RBAC.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {mfaStep && (
            <div className="form-group">
              <label className="form-label">6-Digit MFA Authenticator Code</label>
              <input className="input" required maxLength={6} value={totpCode} onChange={(e) => setTotpCode(e.target.value)} placeholder="123456" />
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} type="submit">
            {loading ? 'Verifying...' : mfaStep ? 'Verify MFA & Enter' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

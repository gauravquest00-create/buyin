import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi, registerAdminUnauthorized, setAdminToken } from '../services/apiClient.js';

const Ctx = createContext(null);
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const res = await adminApi.get('/auth/me');
      setAdmin(res.data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    registerAdminUnauthorized(() => setAdmin(null));
    loadMe();
  }, [loadMe]);

  const login = async (email, password, totpCode) => {
    const res = await adminApi.post('/auth/login', { email, password, ...(totpCode ? { totpCode } : {}) });
    if (res.data.mfaRequired) return { mfaRequired: true };
    setAdminToken(res.data.token);
    setAdmin(res.data.admin);
    return { mfaRequired: false, admin: res.data.admin };
  };

  const logout = async () => {
    await adminApi.post('/auth/logout').catch(() => {});
    setAdminToken(null);
    setAdmin(null);
  };

  return <Ctx.Provider value={{ admin, loading, login, logout, loadMe }}>{children}</Ctx.Provider>;
}
export const useAdminAuth = () => useContext(Ctx);

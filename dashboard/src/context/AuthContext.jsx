import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, registerUnauthorizedHandler, setStoredToken } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const [meRes, walletRes] = await Promise.all([
        apiClient.get('/auth/me'),
        apiClient.get('/wallet').catch(() => null),
      ]);
      setUser(meRes.data.user);
      if (walletRes?.data?.wallet) {
        setWalletBalance(walletRes.data.wallet.balancePoints);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => setUser(null));
    refreshMe();
  }, [refreshMe]);

  const login = async (identifier, password) => {
    const res = await apiClient.post('/auth/login', { identifier, password });
    setStoredToken(res.data.token);
    setUser(res.data.user);
    await refreshMe();
    return res.data;
  };

  const logout = async () => {
    await apiClient.post('/auth/logout').catch(() => {});
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, walletBalance, setWalletBalance, loading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

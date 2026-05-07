import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { login as loginRequest } from './api/auth';

type AdminAuthContextValue = {
  token: string | null;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const STORAGE_KEY = 'admin_token';

function decodeToken(token: string | null) {
  if (!token || typeof token !== 'string' || token.split('.').length < 2) {
    return null;
  }
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'null' || saved === 'undefined') ? null : saved;
  });

  const role = useMemo(() => {
    const decoded = decodeToken(token);
    return decoded?.role || null;
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    localStorage.setItem(STORAGE_KEY, response.accessToken);
    setToken(response.accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('admin-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin-unauthorized', handleUnauthorized);
  }, [logout]);

  const value = useMemo(() => ({ token, role, login, logout }), [token, role, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}

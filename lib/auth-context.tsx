'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AdminUser {
  email: string;
  name: string;
  role: string;
  loginTime: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'migrateflow_admin_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (!e.newValue) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(e.newValue));
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [hydrated]);

  const login = useCallback((email: string, password: string) => {
    // Mock authentication — any valid-looking email/password works.
    void password;
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
    const newUser: AdminUser = {
      email,
      name: name || 'Administrator',
      role: 'Senior Migration Officer',
      loginTime: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  );

  // Defer rendering until hydration to avoid mismatch on refresh.
  if (!hydrated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

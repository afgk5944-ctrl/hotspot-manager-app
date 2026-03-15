import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://hotspot-manager.pages.dev';

interface User {
  id: number;
  company_id: number;
  username: string;
  full_name: string;
  role: 'owner' | 'seller';
  commission_rate: number;
  language: string;
}

interface AuthContextType {
  user: User | null;
  session: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const savedSession = await SecureStore.getItemAsync('session');
      const savedUser = await SecureStore.getItemAsync('user');
      if (savedSession && savedUser) {
        setSession(savedSession);
        setUser(JSON.parse(savedUser));
      }
    } catch {}
    setLoading(false);
  }

  async function login(username: string, password: string) {
    try {
      const res = await fetch(`${BASE_URL}/mobile/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as any;
      if (data.success && data.session) {
        await SecureStore.setItemAsync('session', data.session);
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
        setSession(data.session);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'خطای ورود' };
    } catch (e: any) {
      return { success: false, error: 'خطای اتصال به سرور' };
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync('session');
    await SecureStore.deleteItemAsync('user');
    setSession(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { BASE_URL };

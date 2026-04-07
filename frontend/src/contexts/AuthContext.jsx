import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('smart-campus-token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authService.me(token);
        setUser(me);
      } catch {
        localStorage.removeItem('smart-campus-token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    async devLogin(credentials) {
      const data = await authService.devLogin(credentials);
      localStorage.setItem('smart-campus-token', data.token);
      setToken(data.token);
      const me = await authService.me(data.token);
      setUser(me);
    },
    async completeOAuth(newToken) {
      localStorage.setItem('smart-campus-token', newToken);
      setToken(newToken);
      const me = await authService.me(newToken);
      setUser(me);
    },
    async logout() {
      if (token) {
        try {
          await authService.logout(token);
        } catch {
          // ignore
        }
      }
      localStorage.removeItem('smart-campus-token');
      setToken(null);
      setUser(null);
    }
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

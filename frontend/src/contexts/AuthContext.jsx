import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

function normalizeRole(role) {
  const normalizedRole = String(role || '').trim().toUpperCase();
  if (normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN') return 'ADMIN';
  if (normalizedRole === 'ROLE_TECHNICIAN' || normalizedRole === 'TECHNICIAN') return 'TECHNICIAN';
  if (normalizedRole === 'ROLE_USER' || normalizedRole === 'USER') return 'USER';
  return role;
}

function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    role: normalizeRole(user.role)
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('smart-campus-token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const tokenAtStart = token;

    async function bootstrap() {
      if (!tokenAtStart) {
        if (!isActive) return;
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const me = await authService.me(tokenAtStart);
        if (!isActive) return;
        setUser(normalizeUser(me));
      } catch {
        if (!isActive) return;
        localStorage.removeItem('smart-campus-token');
        setToken(null);
        setUser(null);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    }

    bootstrap();

    return () => {
      isActive = false;
    };
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
      const normalizedMe = normalizeUser(me);
      setUser(normalizedMe);
      return normalizedMe;
    },
    async registerStudent(credentials) {
      const data = await authService.register(credentials);
      localStorage.setItem('smart-campus-token', data.token);
      setToken(data.token);
      const me = await authService.me(data.token);
      const normalizedMe = normalizeUser(me);
      setUser(normalizedMe);
      return normalizedMe;
    },
    async completeOAuth(newToken) {
      localStorage.setItem('smart-campus-token', newToken);
      setToken(newToken);
      const me = await authService.me(newToken);
      const normalizedMe = normalizeUser(me);
      setUser(normalizedMe);
      return normalizedMe;
    },
    async updateAvatar(file) {
      if (!token) {
        throw new Error('You must be signed in to update your profile picture');
      }
      const me = await authService.uploadAvatar(token, file);
      const normalizedMe = normalizeUser(me);
      setUser(normalizedMe);
      return normalizedMe;
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

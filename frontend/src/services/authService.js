import { apiRequest } from './api';

export const authService = {
  devLogin(payload) {
    return apiRequest('/api/auth/dev-login', { method: 'POST', body: payload });
  },
  register(payload) {
    return apiRequest('/api/auth/register', { method: 'POST', body: payload });
  },
  me(token) {
    return apiRequest('/api/auth/me', { token });
  },
  getTechnicians(token) {
    return apiRequest('/api/auth/technicians', { token });
  },
  logout(token) {
    return apiRequest('/api/auth/logout', { method: 'POST', token });
  }
};

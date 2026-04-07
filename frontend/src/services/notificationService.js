import { apiRequest } from './api';

export const notificationService = {
  getAll(token) {
    return apiRequest('/api/notifications', { token });
  },
  getSummary(token) {
    return apiRequest('/api/notifications/summary', { token });
  },
  markRead(id, token) {
    return apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH', token });
  },
  markAllRead(token) {
    return apiRequest('/api/notifications/read-all', { method: 'PATCH', token });
  }
};

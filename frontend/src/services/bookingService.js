import { apiRequest } from './api';

export const bookingService = {
  getFacilities(token) {
    return apiRequest('/api/facilities', { token });
  },
  getBookings(token) {
    return apiRequest('/api/bookings', { token });
  },
  getMyBookings(token) {
    return apiRequest('/api/bookings/mine', { token });
  },
  createBooking(payload, token) {
    return apiRequest('/api/bookings', { method: 'POST', body: payload, token });
  },
  decideBooking(id, payload, token) {
    return apiRequest(`/api/bookings/${id}/decision`, { method: 'PATCH', body: payload, token });
  },
  cancelBooking(id, reason, token) {
    return apiRequest(`/api/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: reason ? { reason } : {},
      token
    });
  }
};

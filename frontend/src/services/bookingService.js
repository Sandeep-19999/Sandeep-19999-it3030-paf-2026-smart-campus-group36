import { apiRequest } from './api';

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const bookingService = {
  getFacilities(token) {
    return apiRequest('/api/facilities', { token });
  },
  getBookings(filters = {}, token) {
    return apiRequest(`/api/bookings${buildQuery(filters)}`, { token });
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
  },
  getBookingQr(id, token) {
    return apiRequest(`/api/bookings/${id}/qr`, { token });
  },
  checkIn(qrCodeToken, token) {
    return apiRequest('/api/bookings/check-in', {
      method: 'POST',
      body: { qrCodeToken },
      token
    });
  }
};

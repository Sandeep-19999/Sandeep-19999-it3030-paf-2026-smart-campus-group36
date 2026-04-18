import { apiRequest } from './api';

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const resourceService = {
  getResources(filters = {}, token) {
    return apiRequest(`/api/resources${buildQuery(filters)}`, { token });
  },
  getActiveResources(token) {
    return apiRequest('/api/resources/active', { token });
  },
  getResourceById(id, token) {
    return apiRequest(`/api/resources/${id}`, { token });
  },
  createResource(payload, token) {
    return apiRequest('/api/resources', { method: 'POST', body: payload, token });
  },
  updateResource(id, payload, token) {
    return apiRequest(`/api/resources/${id}`, { method: 'PUT', body: payload, token });
  },
  deleteResource(id, token) {
    return apiRequest(`/api/resources/${id}`, { method: 'DELETE', token });
  }
};

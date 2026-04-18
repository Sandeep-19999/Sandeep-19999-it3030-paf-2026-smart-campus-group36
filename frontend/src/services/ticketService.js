import { apiRequest } from './api';

export const ticketService = {
  getTickets(token) {
    return apiRequest('/api/tickets', { token });
  },
  getMyTickets(token) {
    return apiRequest('/api/tickets/mine', { token });
  },
  getTicketById(id, token) {
    return apiRequest(`/api/tickets/${id}`, { token });
  },
  createTicket(payload, token) {
    return apiRequest('/api/tickets', { method: 'POST', body: payload, token });
  },
  assignTechnician(id, technicianId, token) {
    return apiRequest(`/api/tickets/${id}/assign-technician`, { method: 'PATCH', body: { technicianId }, token });
  },
  updateStatus(id, payload, token) {
    return apiRequest(`/api/tickets/${id}/status`, { method: 'PATCH', body: payload, token });
  },
  addComment(id, content, token) {
    return apiRequest(`/api/tickets/${id}/comments`, { method: 'POST', body: { content }, token });
  },
  updateComment(commentId, content, token) {
    return apiRequest(`/api/comments/${commentId}`, { method: 'PUT', body: { content }, token });
  },
  deleteComment(commentId, token) {
    return apiRequest(`/api/comments/${commentId}`, { method: 'DELETE', token });
  },
  addAttachments(id, files, token) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiRequest(`/api/tickets/${id}/attachments`, { method: 'POST', body: formData, token, isFormData: true });
  },
  reviewAttachment(ticketId, attachmentId, payload, token) {
    return apiRequest(`/api/tickets/${ticketId}/attachments/${attachmentId}/review`, { method: 'PATCH', body: payload, token });
  },
  async getAttachmentBlob(attachmentId, token) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/tickets/attachments/${attachmentId}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Attachment preview failed');
    return response.blob();
  },
  async downloadAttachment(attachmentId, token, filename) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/tickets/attachments/${attachmentId}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Attachment download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

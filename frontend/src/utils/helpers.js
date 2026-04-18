export function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
}

export function initialValuesForTicket() {
  return {
    title: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    locationLabel: '',
    resourceName: '',
    relatedResourceId: '',
    preferredContact: ''
  };
}

export function getAllowedTicketTransitions(status, role) {
  switch (status) {
    case 'OPEN':
      return role === 'ADMIN' ? ['IN_PROGRESS', 'REJECTED'] : ['IN_PROGRESS'];
    case 'IN_PROGRESS':
      return role === 'ADMIN' ? ['RESOLVED', 'REJECTED'] : ['RESOLVED'];
    case 'RESOLVED':
      return ['CLOSED'];
    default:
      return [];
  }
}

export function formatRoleLabel(role) {
  const normalizedRole = String(role || '').trim().toUpperCase();

  switch (normalizedRole) {
    case 'ROLE_ADMIN':
    case 'ADMIN':
      return 'Admin';
    case 'ROLE_TECHNICIAN':
    case 'TECHNICIAN':
      return 'Lecturer';
    case 'ROLE_USER':
    case 'USER':
      return 'Student';
    default:
      return role || 'Unknown';
  }
}

export function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return '';
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (avatarUrl.startsWith('/')) {
    return `${baseUrl}${avatarUrl}`;
  }
  return `${baseUrl}/${avatarUrl}`;
}

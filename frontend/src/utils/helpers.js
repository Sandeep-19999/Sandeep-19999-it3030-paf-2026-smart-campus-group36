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

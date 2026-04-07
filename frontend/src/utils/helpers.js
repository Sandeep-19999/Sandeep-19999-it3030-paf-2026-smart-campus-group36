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

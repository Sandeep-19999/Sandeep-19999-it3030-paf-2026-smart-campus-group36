const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  if (!response.ok) {
    let message = 'Request failed';
    let fieldErrors;
    try {
      const data = await response.json();
      message = data.message || message;
      fieldErrors = data.fieldErrors;
    } catch {
      message = response.statusText || message;
    }
    const error = new Error(message);
    if (fieldErrors) {
      error.fieldErrors = fieldErrors;
    }
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response;
}

// Thin fetch wrapper around the backend API. Centralizing this means the
// auth token, error shape, and base URL are handled once instead of in
// every component.

import { useAuthStore } from './store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body, isFormData = false, auth = true } = {}) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.errors);
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body, ...opts }),
  del: (path) => request(path, { method: 'DELETE' }),
  base: API_URL,
};

export { ApiError };
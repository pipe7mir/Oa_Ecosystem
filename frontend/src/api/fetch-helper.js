/**
 * Fetch API helper with automatic credentials inclusion
 * Use this instead of raw fetch() to ensure CORS credentials are sent
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Wrapper around fetch that automatically includes credentials
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...defaultOptions, ...options });
}

/**
 * GET request helper
 */
export async function apiGet(endpoint, options = {}) {
  return apiFetch(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost(endpoint, data, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut(endpoint, data, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch(endpoint, data, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete(endpoint, options = {}) {
  return apiFetch(endpoint, { ...options, method: 'DELETE' });
}

export default {
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};

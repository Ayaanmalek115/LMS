const API_BASE = '/api';

// Helper for HTTP requests
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Books
  getBooks: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/books${qs ? `?${qs}` : ''}`);
  },
  getBookById: (id) => request(`/books/${id}`),
  createBook: (data) => request('/books', { method: 'POST', body: data }),
  updateBook: (id, data) => request(`/books/${id}`, { method: 'PUT', body: data }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),
  getGenres: () => request('/books/genres'),
  getStats: () => request('/books/stats'),

  // Issues (Borrow / Return)
  getIssues: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/issues${qs ? `?${qs}` : ''}`);
  },
  borrowBook: (data) => request('/issues/borrow', { method: 'POST', body: data }),
  returnBook: (issueId) => request('/issues/return', { method: 'POST', body: { issueId } }),

  // Recommendations
  getPersonalizedRecommendations: (userId = 'guest', limit = 8) =>
    request(`/recommendations/user/${userId}?limit=${limit}`),
  getSimilarBooks: (bookId, limit = 4) =>
    request(`/recommendations/similar/${bookId}?limit=${limit}`),

  // Users
  getUsers: () => request('/users'),
  getUserById: (id) => request(`/users/${id}`),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
};

export default api;

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Configure axios instance with interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for authorization
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle token expiration or unauthorized access
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Pages API
export const pagesApi = {
  getAll: () => api.get('/pages'),
  getById: (id) => api.get(`/pages/${id}`),
  getBySlug: (slug) => api.get(`/pages/slug/${slug}`),
  create: (data) => api.post('/pages', data),
  update: (id, data) => api.put(`/pages/${id}`, data),
  delete: (id) => api.delete(`/pages/${id}`),
};

// Sections API
export const sectionsApi = {
  getByPageId: (pageId) => api.get(`/sections/page/${pageId}`),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`),
};

// Cards API
export const cardsApi = {
  getBySectionId: (sectionId) => api.get(`/cards/section/${sectionId}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
};

// Upload API
export const uploadApi = {
  uploadFile: (formData) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default api; 
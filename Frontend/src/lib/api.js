import axios from 'axios';

// ─── Axios Instance ─────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request Interceptor: Attach JWT ────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle Errors ────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      localStorage.removeItem('resflow_token');
      localStorage.removeItem('resflow_user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const message = data?.error?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth API ───────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Resume API ─────────────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for large file + AI processing
    }),
  parseText: (data) =>
    api.post('/resume/parse-text', data, { timeout: 120000 }),
  getAll: () => api.get('/resume'),
  getById: (id) => api.get(`/resume/${id}`),
  getScore: (id) => api.get(`/resume/${id}/score`),
};

// ─── Chat API ───────────────────────────────────────────────────
export const chatAPI = {
  startSession: (data) => api.post('/chat/session/new', data),
  getActive: () => api.get('/chat/session/active'),
  getSession: (id) => api.get(`/chat/session/${id}`),
  sendMessage: (data) =>
    api.post('/chat/message', data, { timeout: 60000 }),
};

// ─── Job API ────────────────────────────────────────────────────
export const jobAPI = {
  match: (data) =>
    api.post('/jobs/match', data, { timeout: 120000 }),
  search: (params) => api.get('/jobs/search', { params }),
};

// ─── Cover Letter API ───────────────────────────────────────────
export const coverLetterAPI = {
  generate: (data) =>
    api.post('/cover-letter/generate', data, { timeout: 120000 }),
};

export default api;

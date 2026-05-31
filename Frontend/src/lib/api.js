import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ag_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ag_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data).then(r => r.data.data);
export const login = (data) => api.post('/auth/login', data).then(r => r.data.data);
export const getMe = () => api.get('/auth/me').then(r => r.data.data.user);

// Resumes
export const uploadResume = (formData) => api.post('/resume/upload', formData).then(r => r.data.data);
export const parseRawText = (data) => api.post('/resume/parse-text', data).then(r => r.data.data);
export const getAllResumes = () => api.get('/resume').then(r => r.data.data.resumes);
export const getResumeById = (id) => api.get(`/resume/${id}`).then(r => r.data.data.resume);
export const getResumeScore = (id) => api.get(`/resume/${id}/score`).then(r => r.data.data);

// Chat / Coach
export const startNewSession = (resumeId) => api.post('/chat/session/new', { resumeId }).then(r => r.data.data);
export const getActiveSession = () => api.get('/chat/session/active').then(r => r.data.data);
export const getSessionHistory = (sessionId) => api.get(`/chat/session/${sessionId}`).then(r => r.data.data);
export const sendMessage = (sessionId, message) => api.post('/chat/message', { sessionId, message }).then(r => r.data.data);

// Jobs
export const matchJobDescription = (resumeId, jobDescription) => api.post('/jobs/match', { resumeId, jobDescription }).then(r => r.data.data);
export const searchJobs = (query, location) => api.get('/jobs/search', { params: { query, location } }).then(r => r.data.data);

// Cover Letter
export const generateCoverLetter = (data) => api.post('/cover-letter/generate', data).then(r => r.data.data);

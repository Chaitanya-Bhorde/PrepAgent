import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, college, year, branch) =>
    api.post('/auth/register', { name, email, password, college, year, branch }),
  me: () => api.get('/auth/me'),
};

// ─── Problems ───────────────────────────────────────
export const problemAPI = {
  list: (params = {}) => api.get('/problems', { params }),
  get: (id) => api.get(`/problems/${id}`),
};

// ─── Execution ──────────────────────────────────────
export const executeAPI = {
  run: (code, language, stdin = '') => api.post('/execute', { code, language, stdin }),
  submit: (problemId, title, code, language, difficulty) =>
    api.post('/submissions/submit', { problemId, title, code, language, difficulty }),
};

// ─── Interview ──────────────────────────────────────
export const interviewAPI = {
  start: (questionId, type = 'dsa', topicId = null) =>
    api.post('/interview/start', { questionId, type, topicId }),
  message: (sessionId, message, code, language) =>
    api.post('/interview/message', { sessionId, message, code, language }),
  snapshot: (sessionId, code) => api.post('/interview/snapshot', { sessionId, code }),
  sessions: () => api.get('/interview/sessions'),
  sessionDetails: (id) => api.get(`/interview/sessions/${id}`),
  systemDesignTopics: () => api.get('/interview/system-design/topics'),
};

// ─── Hints ──────────────────────────────────────────
export const hintsAPI = {
  generate: (problemTitle, problemDescription, userCode, hintLevel) =>
    api.post('/hints/generate', { problemTitle, problemDescription, userCode, hintLevel }),
  analyze: (code, language, problemTitle) =>
    api.post('/hints/analyze', { code, language, problemTitle }),
};

// ─── Resume ─────────────────────────────────────────
export const resumeAPI = {
  analyze: (resumeId) => api.get(`/resume/${resumeId}/analyze`),
};

// ─── SQL ────────────────────────────────────────────
export const sqlAPI = {
  execute: (query, problemId = null, action = 'run') =>
    api.post('/sql/execute', { query, problemId, action }),
};

// ─── Analytics ──────────────────────────────────────
export const analyticsAPI = {
  stats: () => api.get('/analytics/stats'),
  weakAreas: () => api.get('/analytics/weak-areas'),
};

// ─── Subjects / Quiz ────────────────────────────────
export const subjectsAPI = {
  list: () => api.get('/subjects'),
  quiz: (subject, limit = 5) => api.get(`/subjects/${subject}/quiz`, { params: { limit } }),
};

// ─── User ───────────────────────────────────────────
export const userAPI = {
  stats: () => api.get('/user/stats'),
  submissions: () => api.get('/submissions'),
  leaderboard: (limit = 10, category = 'overall', college = null) =>
    api.get('/user/placement-score/leaderboard', { params: { limit, category, college } }),
};

// ─── Contests ───────────────────────────────────────
export const contestAPI = {
  list: () => api.get('/contests'),
  get: (id) => api.get(`/contests/${id}`),
  leaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
  submit: (data) => api.post('/contests/submit', data),
};
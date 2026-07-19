import { create } from 'zustand';
import { authAPI } from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  init: async () => {
    // Check if token is in query params (redirected from OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    if (oauthToken) {
      localStorage.setItem('token', oauthToken);
      // Clean query parameter from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await authAPI.me();
      const user = res.data;
      set({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          year: user.year,
          branch: user.branch,
        },
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      localStorage.removeItem('token');
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const res = await authAPI.login(email, password);
    const { token, _id, name, role, college, year, branch } = res.data;
    localStorage.setItem('token', token);
    set({
      user: { _id, name, email, role, college, year, branch },
      isAuthenticated: true,
    });
    return res.data;
  },

  register: async (name, email, password, college, year, branch) => {
    const res = await authAPI.register(name, email, password, college, year, branch);
    const { token, _id, role, college: userCollege, year: userYear, branch: userBranch } = res.data;
    localStorage.setItem('token', token);
    set({
      user: { _id, name, email, role, college: userCollege, year: userYear, branch: userBranch },
      isAuthenticated: true,
    });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, loading: false });
  },
}));

export { useAuthStore };
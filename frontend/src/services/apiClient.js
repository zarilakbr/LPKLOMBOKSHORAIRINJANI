import axios from 'axios';

/**
 * Centralized API Client for Laravel Backend Communication
 */
const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor to attach Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('lpk_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiAuth = {
  /**
   * Login user via Laravel backend with Turnstile verification.
   */
  async login(email, password, turnstileToken = null) {
    const payload = {
      email,
      password
    };
    if (turnstileToken) {
      payload.turnstile_token = turnstileToken;
    }

    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Register new user (SISWA or PENGAJAR) via Laravel backend with Turnstile verification.
   */
  async register({ name, email, password, phone = '', role = 'SISWA', turnstileToken = null }) {
    const payload = {
      name,
      email,
      password,
      phone,
      role
    };
    if (turnstileToken) {
      payload.turnstile_token = turnstileToken;
    }

    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Query Google OAuth authorization URL from Laravel backend.
   */
  async getGoogleOAuthUrl() {
    const response = await apiClient.get('/auth/google/redirect');
    return response.data;
  },

  /**
   * Complete Google OAuth callback with Laravel backend.
   */
  async handleGoogleCallback(params) {
    const response = await apiClient.post('/auth/google/callback', params);
    return response.data;
  },

  /**
   * Logout user and revoke token on Laravel backend.
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore network logout errors
    }
  },

  /**
   * Fetch currently authenticated user profile from backend.
   */
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

export default apiClient;

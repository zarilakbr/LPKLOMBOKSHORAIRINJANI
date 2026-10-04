import axios from 'axios';

/**
 * Centralized API Client for Laravel Backend Communication
 */

/**
 * Normalize the API base URL so every request targets Laravel's `/api` prefix.
 *
 * - Relative values (e.g. `/api` for local dev proxy) are kept as-is.
 * - Absolute backend URLs without `/api` (e.g. `https://backend.example.com`)
 *   get `/api` appended, because all Laravel routes live under `routes/api.php`.
 * - Trailing slashes are removed to avoid `//auth/login`.
 */
export function normalizeApiBaseUrl(rawUrl) {
  const value = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!value || value === 'undefined' || value === 'null') {
    return '/api';
  }

  const withoutTrailingSlash = value.replace(/\/+$/, '');

  if (/^https?:\/\//i.test(withoutTrailingSlash) && !/\/api$/i.test(withoutTrailingSlash)) {
    return `${withoutTrailingSlash}/api`;
  }

  return withoutTrailingSlash || '/api';
}

export const API_BASE_URL = normalizeApiBaseUrl(
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_URL
    : undefined
);

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

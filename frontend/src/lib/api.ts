import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Use relative path so requests go through Next.js proxy (works with ngrok too)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token and site_id to all requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Auto-append site_id from stored context if not already present.
    // Skip for auth endpoints and mainpage (which don't need site_id).
    const url = config.url || '';
    const skipSiteId = url.includes('/auth/') || url.includes('/mainpage/') || url.includes('/users/');
    if (!skipSiteId) {
      try {
        const stored = localStorage.getItem('current_store');
        if (stored) {
          const { siteId } = JSON.parse(stored);
          if (siteId) {
            // Append site_id to query params if not already set
            config.params = config.params || {};
            if (!config.params.site_id) {
              config.params.site_id = siteId;
            }
          }
        }
      } catch {}
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and other errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't redirect if the 401 came from login or MFA endpoints — let the
      // page's own error handling show the message to the user.
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/verify-mfa');
      if (!isAuthEndpoint) {
        Cookies.remove('auth_token');
        Cookies.remove('auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

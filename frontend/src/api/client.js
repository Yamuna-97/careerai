import axios from 'axios';
import { supabase } from '../utils/supabase';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create a single centralized Axios API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Reads access_token from localStorage (or syncs from active Supabase session)
 * and attaches Authorization: Bearer <access_token> header to every request.
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Try unified localStorage key
    let token = localStorage.getItem('access_token') || localStorage.getItem('token');

    // 2. If no token in localStorage, try active Supabase session
    if (!token && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
          localStorage.setItem('access_token', token);
        }
      } catch (err) {
        console.warn('[API Client] Could not fetch session from Supabase:', err);
      }
    }

    // 3. Attach token if valid and not mock
    if (token && token !== 'mock_user_token' && !token.startsWith('mock_')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Handles 401 Unauthorized responses globally by clearing invalid token state.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API Client] 401 Unauthorized encountered — clearing invalid authentication token.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');

      // Redirect to login if user is currently on a protected route
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/signup')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

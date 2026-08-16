/**
 * frontend/src/utils/auth.js
 * --------------------------
 * Centralised auth helpers used across all pages.
 */

import { supabase } from './supabase';

/**
 * Returns the current access_token.
 * Refreshes the session via Supabase if needed.
 * Returns null if the user is not logged in.
 */
export async function getAuthToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      localStorage.setItem('access_token', session.access_token);
      return session.access_token;
    }
  } catch (e) {
    console.warn('[auth.js] Error fetching Supabase session:', e);
  }

  const stored = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (stored && stored !== 'mock_user_token' && !stored.startsWith('mock_')) {
    return stored;
  }
  return null;
}

/**
 * Gets the auth token and redirects to /login if not authenticated.
 * @param {function} navigate - React Router navigate function
 * @returns {string} access_token
 */
export async function requireAuth(navigate) {
  const token = await getAuthToken();
  if (!token) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    if (navigate) navigate('/login');
    throw new Error('Not authenticated');
  }
  return token;
}

export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

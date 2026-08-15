/**
 * frontend/src/utils/auth.js
 * --------------------------
 * Centralised auth helpers used across all pages.
 */

import { supabase } from './supabase';

/**
 * Returns the current Supabase access_token.
 * Refreshes the session if it is expired.
 * Returns null if the user is not logged in.
 */
export async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    localStorage.setItem('token', session.access_token);
    return session.access_token;
  }
  const stored = localStorage.getItem('token');
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
    localStorage.removeItem('token');
    navigate('/login');
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

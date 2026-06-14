import axios from 'axios';
import { BACKEND_ROUTES, buildBackendUrl } from '../config/backend';

const THEME_STORAGE_KEY = 'focusspark-theme';

export function clearLocalStorageForLogout() {
  const theme = localStorage.getItem(THEME_STORAGE_KEY);
  localStorage.clear();
  if (theme === 'light' || theme === 'dark') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

export async function logoutAndClearLocalStorage() {
  const token = localStorage.getItem('auth_token');

  if (token) {
    try {
      await axios.post(
        buildBackendUrl(BACKEND_ROUTES.auth.logout),
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      // Local logout should still complete if the server is unavailable.
    }
  }

  clearLocalStorageForLogout();
}

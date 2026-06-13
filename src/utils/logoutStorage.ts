const THEME_STORAGE_KEY = 'focusspark-theme';

export function clearLocalStorageForLogout() {
  const theme = localStorage.getItem(THEME_STORAGE_KEY);
  localStorage.clear();
  if (theme === 'light' || theme === 'dark') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

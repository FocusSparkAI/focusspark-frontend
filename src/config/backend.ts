const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

if (!backendBaseUrl) {
  throw new Error('Missing VITE_BACKEND_BASE_URL in .env');
}

export const BACKEND_BASE_URL = backendBaseUrl;

export const BACKEND_ROUTES = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
  },
  profile: {
    get: '/auth/profile',
    delete: '/auth/delete-user',
  },
  analysis: {
    analyze: '/analyze',
    websocket: '/ws',
  },
} as const;

export function buildBackendUrl(path: string): string {
  return new URL(path, BACKEND_BASE_URL).toString();
}

export function buildBackendRouteUrl(path: string): string {
  return buildBackendUrl(path);
}
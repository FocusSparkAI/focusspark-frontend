const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

if (!backendBaseUrl) {
  throw new Error('Missing VITE_BACKEND_BASE_URL in .env');
}

export const BACKEND_BASE_URL = backendBaseUrl;

export const BACKEND_ROUTES = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    changePassword: '/auth/password',
    logout: '/auth/logout',
  },
  profile: {
    get: '/auth/profile',
    update: '/auth/profile',
    avatar: '/auth/profile/avatar',
    delete: '/auth/delete-user',
  },
  analysis: {
    analyze: '/analyze',
    websocket: '/ws',
  },
  study: {
    sessions: {
      create: '/study/sessions',
      recent: '/study/sessions/recent',
      history: '/study/sessions/history',
      complete: (sessionId: number) => `/study/sessions/${sessionId}/complete`,
      distractions: (sessionId: number) => `/study/sessions/${sessionId}/distractions`,
      emotions: (sessionId: number) => `/study/sessions/${sessionId}/emotions`,
    },
    stats: {
      summary: '/study/stats/summary',
      analytics: '/study/stats/analytics',
      dashboard: '/study/stats/dashboard',
    },
    goals: {
      list: '/study/goals',
      create: '/study/goals',
      detail: (goalId: number) => `/study/goals/${goalId}`,
      update: (goalId: number) => `/study/goals/${goalId}`,
      delete: (goalId: number) => `/study/goals/${goalId}`,
    },
    achievements: {
      list: '/study/achievements',
      unlocked: '/study/achievements/unlocked',
      unlock: (achievementId: number) => `/study/achievements/${achievementId}/unlock`,
    },
    notifications: {
      list: '/study/notifications',
      update: (notificationId: number) => `/study/notifications/${notificationId}`,
    },
    settings: {
      get: '/study/settings',
      update: '/study/settings',
    },
    export: '/study/export',
    clearData: '/study/data',
  },
} as const;

export function buildBackendUrl(path: string): string {
  return new URL(path, BACKEND_BASE_URL).toString();
}

export function buildBackendRouteUrl(path: string): string {
  return buildBackendUrl(path);
}

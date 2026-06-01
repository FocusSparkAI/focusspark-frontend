import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Award,
  Bell,
  Clock,
  Info,
  LayoutDashboard,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { playSoundForNewUnreadNotifications, unlockNotificationSound } from '../../utils/notificationSound';
import { formatUserDate, setUserTimeZone } from '../../utils/timezone';

function resolveAssetUrl(url: string) {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return buildBackendUrl(url);
}

interface DashboardNavbarProps {
  onNavigate?: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type DashboardNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

const PROFILE_NAME_STORAGE_KEY = 'focusspark-profile-name';
const PROFILE_AVATAR_STORAGE_KEY = 'focusspark-profile-avatar-url';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatNotificationTime(value: string) {
  const createdAt = new Date(value).getTime();
  if (!Number.isFinite(createdAt)) return '';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  if (diffSeconds < 60) return 'Just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return formatUserDate(value);
}

function getNotificationIcon(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('achievement')) return Award;
  if (normalized.includes('reminder') || normalized.includes('pomodoro')) return Clock;
  if (normalized.includes('warning') || normalized.includes('alert')) return AlertCircle;
  return Info;
}

function getNotificationIconClass(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('achievement')) return 'bg-purple-500/12 text-purple-500';
  if (normalized.includes('reminder') || normalized.includes('pomodoro')) return 'bg-blue-500/12 text-blue-500';
  if (normalized.includes('warning') || normalized.includes('alert')) return 'bg-amber-500/12 text-amber-500';
  return 'bg-slate-500/12 text-slate-500';
}

export function DashboardNavbar({ onNavigate, theme, onToggleTheme }: DashboardNavbarProps) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(PROFILE_AVATAR_STORAGE_KEY) ?? '');
  const [displayName, setDisplayName] = useState(() => localStorage.getItem(PROFILE_NAME_STORAGE_KEY) ?? '');

  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const unreadCount = unreadNotifications.length;

  const loadProfile = useCallback(async () => {
    try {
      const response = await axios.get(buildBackendUrl(BACKEND_ROUTES.profile.get), {
        headers: getAuthHeaders(),
      });
      const data = response.data;
      setUserTimeZone(data?.timezone);
      const nextAvatarUrl = resolveAssetUrl(data?.avatar_url ?? data?.avatarUrl ?? '');
      const nextDisplayName = data?.full_name ?? data?.fullName ?? data?.name ?? '';
      setAvatarUrl(nextAvatarUrl);
      setDisplayName(nextDisplayName);
      if (nextAvatarUrl) localStorage.setItem(PROFILE_AVATAR_STORAGE_KEY, nextAvatarUrl);
      else localStorage.removeItem(PROFILE_AVATAR_STORAGE_KEY);
      if (nextDisplayName) localStorage.setItem(PROFILE_NAME_STORAGE_KEY, nextDisplayName);
      else localStorage.removeItem(PROFILE_NAME_STORAGE_KEY);
    } catch {
      // Keep placeholder avatar on failure.
    }
  }, []);

  const loadNotificationSoundPreference = useCallback(async () => {
    try {
      const response = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.settings.get), {
        headers: getAuthHeaders(),
      });
      return response.data?.accessibility?.notification_sound !== false;
    } catch {
      return false;
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(false);

    try {
      const soundEnabled = await loadNotificationSoundPreference();
      const response = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.notifications.list), {
        headers: getAuthHeaders(),
        params: { limit: 10 },
      });
      const nextNotifications = Array.isArray(response.data) ? response.data : [];
      setNotifications(nextNotifications);
      if (soundEnabled) {
        playSoundForNewUnreadNotifications(nextNotifications);
      }
    } catch {
      setNotificationsError(true);
    } finally {
      setNotificationsLoading(false);
    }
  }, [loadNotificationSoundPreference]);

  useEffect(() => {
    unlockNotificationSound();
    const timeoutId = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  useEffect(() => {
    const onProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string; name?: string }>).detail;
      if (detail?.avatarUrl !== undefined) {
        setAvatarUrl(detail.avatarUrl);
      }
      if (detail?.name !== undefined) {
        setDisplayName(detail.name);
      }
      if (detail?.avatarUrl === undefined && detail?.name === undefined) {
        void loadProfile();
      }
    };

    window.addEventListener('focusspark:profile-updated', onProfileUpdated);
    return () => window.removeEventListener('focusspark:profile-updated', onProfileUpdated);
  }, [loadProfile]);

  const markNotificationRead = async (notification: DashboardNotification) => {
    if (notification.read) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );

    try {
      await axios.patch(
        buildBackendUrl(BACKEND_ROUTES.study.notifications.update(notification.id)),
        { read: true },
        { headers: getAuthHeaders() },
      );
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: false } : item,
        ),
      );
    }
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );

    try {
      await axios.patch(
        buildBackendUrl(BACKEND_ROUTES.study.notifications.readAll),
        {},
        { headers: getAuthHeaders() },
      );
    } catch {
      setNotifications((current) =>
        current.map((notification) =>
          unreadIds.includes(notification.id)
            ? { ...notification, read: false }
            : notification,
        ),
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
            <LayoutDashboard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold leading-tight tracking-normal">Dashboard</h2>
            <p className="truncate text-xs text-secondary">Overview</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="rounded-full hover:bg-accent/50"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu onOpenChange={(open) => {
            if (open) void loadNotifications();
          }}>
            <DropdownMenuTrigger className="relative rounded-full p-2 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between gap-3">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void markAllNotificationsRead();
                    }}
                    className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-500/20"
                  >
                    Mark all as read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 space-y-2 overflow-y-auto p-2">
                {notificationsLoading && (
                  <div className="rounded-lg border border-border bg-background p-3 text-sm text-secondary">
                    Loading notifications...
                  </div>
                )}

                {!notificationsLoading && notificationsError && (
                  <div className="rounded-lg border border-border bg-background p-3 text-sm text-secondary">
                    No notifications found.
                  </div>
                )}

                {!notificationsLoading && !notificationsError && unreadNotifications.length === 0 && (
                  <div className="rounded-lg border border-border bg-background p-3 text-sm text-secondary">
                    No unread notifications.
                  </div>
                )}

                {!notificationsLoading && !notificationsError && unreadNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const iconClass = getNotificationIconClass(notification.type);

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void markNotificationRead(notification)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${notification.read
                          ? 'border-transparent hover:bg-accent/50'
                          : 'border-blue-500/20 bg-blue-500/10'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-5">{notification.title}</p>
                          <p className="mt-1 text-sm leading-5 text-secondary">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-secondary">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              <button
                type="button"
                onClick={() => onNavigate?.('notifications')}
                className="w-full rounded-sm px-2 py-2 text-left text-sm font-medium text-blue-500 transition-colors hover:bg-accent/50"
              >
                View all notifications
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu
            onOpenChange={(open) => {
              if (open) void loadProfile();
            }}
          >
            <DropdownMenuTrigger className="rounded-full p-1 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <Avatar className="h-10 w-10 shadow-lg shadow-purple-500/25">
                <AvatarImage src={avatarUrl} alt={displayName || 'Profile'} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {displayName ? (
                    displayName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate?.('profile')}>
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  onNavigate?.('home');
                }}
              >
                <LogOut className="w-4 h-4 mr-2 text-destructive" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

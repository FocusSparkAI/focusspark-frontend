import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Award,
  Bell,
  CheckCheck,
  Clock,
  Home,
  Info,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { formatUserDateTime } from '../../utils/timezone';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

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

  return formatUserDateTime(value);
}

function getNotificationIcon(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('achievement')) return Award;
  if (normalized.includes('reminder') || normalized.includes('pomodoro')) return Clock;
  if (normalized.includes('warning') || normalized.includes('alert')) return AlertCircle;
  return Info;
}

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.notifications.list), {
        headers: getAuthHeaders(),
      });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  const markNotificationRead = async (notification: NotificationItem) => {
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('dashboard')}
                className="hover:bg-accent"
              >
                <Home className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="gradient-text">Notifications</h1>
                <p className="text-sm text-secondary">
                  Achievement unlocks, reminders, and study alerts
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => void markAllNotificationsRead()}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card px-8 py-8 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-sm text-blue-500">
                <Bell className="h-4 w-4 shrink-0" />
                Notification center
              </div>

              <div className="mt-6">
                <h1 className="text-3xl font-semibold tracking-normal">Notifications</h1>
                <p className="mt-5 text-sm leading-6 text-secondary sm:text-base">
                  Review achievement unlocks, reminders, and important study alerts.
                </p>
              </div>
            </motion.section>

            {isLoading && (
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-secondary">Loading notifications...</CardContent>
              </Card>
            )}

            {!isLoading && hasError && (
              <Card className="border-border bg-card">
                <CardContent className="p-5 text-center sm:p-8">
                  <Bell className="mx-auto h-10 w-10 text-secondary" />
                  <p className="mt-4 font-medium">No notifications found.</p>
                  <p className="mt-1 text-sm text-secondary">
                    New notifications will appear here when they are available.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !hasError && notifications.length === 0 && (
              <Card className="border-border bg-card">
                <CardContent className="p-5 text-center sm:p-8">
                  <Bell className="mx-auto h-10 w-10 text-secondary" />
                  <p className="mt-4 font-medium">No notifications yet.</p>
                  <p className="mt-1 text-sm text-secondary">
                    Achievement unlocks and reminders will appear here.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !hasError && notifications.length > 0 && (
              <div className="space-y-3">
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);

                  return (
                    <motion.button
                      key={notification.id}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      onClick={() => void markNotificationRead(notification)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        notification.read
                          ? 'border-border bg-card hover:bg-accent/40'
                          : 'border-blue-500/25 bg-blue-500/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{notification.title}</p>
                            {!notification.read && <Badge>Unread</Badge>}
                            <Badge variant="outline">{notification.type}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-secondary">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-secondary">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

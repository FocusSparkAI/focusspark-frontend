import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Brain,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Flame,
  Layers,
  LineChart,
  ListChecks,
  Moon,
  PlayCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sunrise,
  Target,
  Trophy,
  Upload,
  UserCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { DashboardNavbar } from '../../components/layout/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type AchievementSummary = {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  unlocked: boolean;
  unlockedAt?: string;
};

type AchievementPopup = {
  achievement: AchievementSummary;
};

const PROFILE_NAME_STORAGE_KEY = 'focusspark-profile-name';

const iconByBadgeName: Record<string, any> = {
  award: Award,
  'book-open': BookOpen,
  boxes: Boxes,
  brain: Brain,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  clock: Clock,
  'clipboard-check': ClipboardCheck,
  flame: Flame,
  layers: Layers,
  'list-checks': ListChecks,
  moon: Moon,
  'play-circle': PlayCircle,
  'shield-check': ShieldCheck,
  star: Star,
  sunrise: Sunrise,
  target: Target,
  trophy: Trophy,
  'trending-up': TrendingUp,
  upload: Upload,
  'user-check': UserCheck,
  zap: Zap,
};

function achievementPopupSeenKey(achievement: AchievementSummary) {
  return `focusspark-achievement-popup-seen-${achievement.id}-${achievement.unlockedAt ?? 'no-date'}`;
}

function readCachedProfileName() {
  return localStorage.getItem(PROFILE_NAME_STORAGE_KEY) ?? '';
}

function AchievementCelebrationPopup({
  isVisible,
  achievement,
  Icon,
  onClose,
  onViewBadges,
}: {
  isVisible: boolean;
  achievement: AchievementSummary | null;
  Icon: any;
  onClose: () => void;
  onViewBadges: () => void;
}) {
  useEffect(() => {
    if (!isVisible || !achievement) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];
    const particles: HTMLDivElement[] = [];

    for (let index = 0; index < 50; index += 1) {
      const particle = document.createElement('div');
      particle.className = 'confetti';
      particle.style.cssText = `
        position: fixed;
        width: ${Math.random() > 0.5 ? 10 : 7}px;
        height: ${Math.random() > 0.5 ? 10 : 14}px;
        border-radius: ${Math.random() > 0.55 ? '999px' : '2px'};
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -20px;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(particle);
      particles.push(particle);
    }

    const timeoutId = window.setTimeout(() => {
      particles.forEach((particle) => particle.remove());
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
      particles.forEach((particle) => particle.remove());
    };
  }, [achievement, isVisible]);

  if (!isVisible || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-xl"
      >
        <Card className="w-full border-blue-500/50 bg-card shadow-2xl">
          <CardContent className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/10 via-card to-purple-500/10 px-6 py-8 text-center sm:px-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />

            <div className="relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-blue-500/25">
                  <Icon className="h-16 w-16 stroke-[2.4]" />
                </div>
              </motion.div>

              <h2 className="gradient-text mb-2 text-3xl font-semibold tracking-normal">Achievement Unlocked!</h2>
              <p className="mb-4 text-xl text-foreground">{achievement.title}</p>

              {achievement.description && (
                <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                  <div className="flex items-start justify-center gap-2">
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <p className="text-sm leading-6 text-secondary">{achievement.description}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={onViewBadges}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                  View Achievements
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export function StudentDashboard({ onNavigate, theme, onToggleTheme }: StudentDashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [profileName, setProfileName] = useState(readCachedProfileName);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [achievementPopup, setAchievementPopup] = useState<AchievementPopup | null>(null);

  const loadDashboard = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const dashboardResponse = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.stats.dashboard), { headers });

      setDashboardStats(dashboardResponse.data);
      setLoadError(null);
    } catch (error) {
      setLoadError('Could not load dashboard stats yet.');
      console.warn('Dashboard stats failed.', error);
    }

    try {
      const achievementsResponse = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.achievements.list), { headers });

      const achievements = Array.isArray(achievementsResponse.data)
        ? achievementsResponse.data.map((item: any): AchievementSummary => ({
            id: String(item?.id ?? item?.key ?? item?.title),
            title: item?.title ?? item?.achievement_title ?? 'Achievement',
            description: item?.description ?? '',
            badgeIcon: String(item?.badge_icon ?? '').toLowerCase(),
            unlocked: Boolean(item?.unlocked),
            unlockedAt: item?.unlocked_at,
          }))
        : [];

      const unlockedAchievement = achievements
        .filter((achievement) => achievement.unlocked)
        .sort((left, right) => {
          const rightTime = right.unlockedAt ? new Date(right.unlockedAt).getTime() : 0;
          const leftTime = left.unlockedAt ? new Date(left.unlockedAt).getTime() : 0;
          return rightTime - leftTime;
        })
        .find((achievement) => localStorage.getItem(achievementPopupSeenKey(achievement)) !== 'true');

      if (unlockedAchievement) {
        setAchievementPopup({ achievement: unlockedAchievement });
      }
    } catch (error) {
      console.warn('Achievement unlock popup failed.', error);
    }

    try {
      const profileResponse = await axios.get(buildBackendUrl(BACKEND_ROUTES.profile.get), {
        headers,
      });
      const nextProfileName =
        profileResponse.data?.full_name ??
        profileResponse.data?.fullName ??
        profileResponse.data?.name ??
        '';
      setProfileName(nextProfileName);
      if (nextProfileName) {
        localStorage.setItem(PROFILE_NAME_STORAGE_KEY, nextProfileName);
      } else {
        localStorage.removeItem(PROFILE_NAME_STORAGE_KEY);
      }
    } catch {
      setProfileName(readCachedProfileName());
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dailyFocus = useMemo(
    () => (Array.isArray(dashboardStats?.daily_focus) ? dashboardStats.daily_focus : []),
    [dashboardStats],
  );
  const maxDailyMinutes = Math.max(1, ...dailyFocus.map((day: any) => Number(day.minutes ?? 0)));
  const weeklyBars = dayLabels.map((label, index) => {
    const day = dailyFocus[index];
    const minutes = Number(day?.minutes ?? 0);
    return {
      label: day?.day?.slice(0, 1) ?? label,
      height: minutes > 0 ? Math.max(8, Math.round((minutes / maxDailyMinutes) * 128)) : 0,
      minutes,
    };
  });
  const weeklyFocusHours = Number(dashboardStats?.weekly_focus_hours ?? 0);
  const focusScore = Number(dashboardStats?.focus_score ?? 0);
  const currentStreak = Number(dashboardStats?.current_streak ?? 0);
  const badgesEarned = Number(dashboardStats?.badges_earned ?? 0);
  const totalBadges = Number(dashboardStats?.total_badges ?? 0);
  const badgeProgress = totalBadges ? Math.round((badgesEarned / totalBadges) * 100) : 0;
  const recentActivity = Array.isArray(dashboardStats?.recent_activity) ? dashboardStats.recent_activity : [];
  const todayGoals = Array.isArray(dashboardStats?.today_goals) ? dashboardStats.today_goals : [];
  const activeGoal = dashboardStats?.active_goal ?? todayGoals.find((goal: any) => !goal.completed);
  const todayGoalStats = dashboardStats?.today_goal_stats ?? {};
  const activeGoalProgress = activeGoal?.target_minutes
    ? Math.round((Number(activeGoal.current_minutes ?? 0) / Number(activeGoal.target_minutes)) * 100)
    : 0;
  const AchievementPopupIcon = achievementPopup
    ? iconByBadgeName[achievementPopup.achievement.badgeIcon] ?? Award
    : Award;


  const closeAchievementPopup = () => {
    if (achievementPopup) {
      localStorage.setItem(achievementPopupSeenKey(achievementPopup.achievement), 'true');
    }
    setAchievementPopup(null);
  };

  const stats = [
    {
      label: 'Weekly Focus',
      value: `${weeklyFocusHours}h`,
      detail: 'last 7 days',
      icon: BarChart3,
      color: 'text-teal-400',
    },
    {
      label: 'Focus Score',
      value: `${focusScore}%`,
      detail: 'recent work sessions',
      icon: LineChart,
      color: 'text-blue-400',
    },
    {
      label: 'Current Streak',
      value: `${currentStreak}d`,
      detail: 'active study streak',
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      label: 'Badges Earned',
      value: `${badgesEarned}/${totalBadges}`,
      detail: 'achievement collection',
      icon: Trophy,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={onNavigate}
        currentPage="dashboard"
      />

      <div className="flex-1 flex flex-col">
        <DashboardNavbar onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {loadError && (
              <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                {loadError}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-purple-500/10 p-8 shadow-sm"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                    <Sparkles className="h-4 w-4" />
                    Progress Command Center
                  </div>
                  <h1 className="text-4xl mb-3">
                    Welcome back{profileName ? `, ${profileName}` : ''}!
                  </h1>
                  <p className="max-w-2xl text-secondary">
                    See your progress at a glance, review reports, track achievements, and keep your account settings in shape.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => onNavigate('reports')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">
                    View Reports
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('analytics')}>
                    Open Analytics
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card className="min-h-[172px] overflow-hidden bg-card border-border shadow-sm">
                      <CardContent className="flex min-h-[172px] flex-col justify-between p-6">
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) 40px',
                            columnGap: '16px',
                            alignItems: 'start',
                          }}
                        >
                          <div className="space-y-2">
                            <p className="text-sm font-medium leading-5 text-secondary">
                              {stat.label}
                            </p>
                            <p className="text-4xl leading-none gradient-text">
                              {stat.value}
                            </p>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <Icon className={`h-5 w-5 ${stat.color}`} />
                          </div>
                        </div>
                        <p className="pt-4 text-sm leading-5 text-secondary">
                          {stat.detail}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="xl:col-span-2"
              >
                <Card className="bg-card border-border h-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-teal-400" />
                      Weekly Progress Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-xl border border-border bg-muted/20 px-5 pb-4 pt-4">
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                          columnGap: '16px',
                          height: '132px',
                          alignItems: 'end',
                          borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
                          paddingBottom: '1px',
                        }}
                      >
                        {weeklyBars.map((bar, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'end',
                              justifyContent: 'center',
                              height: '100%',
                            }}
                          >
                            <motion.div
                              className="bg-gradient-to-t from-teal-500 to-blue-500"
                              style={{
                                width: '68%',
                                maxWidth: '76px',
                                minWidth: '28px',
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                              }}
                              initial={{ height: 0 }}
                              animate={{ height: `${bar.height}px` }}
                              transition={{ delay: 0.25 + index * 0.05, duration: 0.5 }}
                              title={`${bar.label}: ${bar.minutes} focused minutes`}
                            />
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                          columnGap: '16px',
                          height: '24px',
                          marginTop: '8px',
                          alignItems: 'center',
                        }}
                      >
                        {weeklyBars.map((bar, index) => (
                          <span
                            key={`${bar.label}-${index}`}
                            className="text-xs text-secondary"
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              lineHeight: '24px',
                            }}
                          >
                            {bar.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Button variant="outline" className="justify-between" onClick={() => onNavigate('reports')}>
                        Reports
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="justify-between" onClick={() => onNavigate('analytics')}>
                        Analytics
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="justify-between" onClick={() => onNavigate('achievements')}>
                        Achievements
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
              >
                <Card className="bg-card border-border h-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      Achievement Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4">
                      <p className="mb-2 text-sm leading-5 text-secondary">Current streak</p>
                      <p className="text-4xl leading-none gradient-text">{currentStreak} days</p>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-secondary">Badge collection</span>
                        <span>{badgesEarned}/{totalBadges}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${badgeProgress}%` }}
                          transition={{ delay: 0.35, duration: 0.6 }}
                        />
                      </div>
                    </div>
                    <Button className="w-full justify-between" variant="outline" onClick={() => onNavigate('achievements')}>
                      View Badges
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-teal-400" />
                    Today's Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4">
                  {activeGoal ? (
                    <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-medium">{activeGoal.title}</p>
                        <span className="shrink-0 text-xs text-secondary">
                          {activeGoal.current_minutes ?? 0}/{activeGoal.target_minutes ?? 0} min
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, activeGoalProgress)}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-secondary">
                      No active goal for today.
                    </div>
                  )}
                  <div className="space-y-2">
                    {todayGoals.slice(0, 4).map((goal: any) => (
                      <div key={goal.id} className="flex items-center gap-3 rounded-lg bg-muted/40 p-2">
                        {goal.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 shrink-0 text-blue-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{goal.title}</p>
                          <p className="text-xs text-secondary">
                            {goal.current_minutes ?? 0}/{goal.target_minutes ?? 0} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-auto text-xs text-secondary">
                    {Number(todayGoalStats.completed ?? 0)} completed, {Number(todayGoalStats.incomplete ?? 0)} incomplete today.
                  </p>
                  <Button variant="outline" className="w-full justify-between" onClick={() => onNavigate('goals')}>
                    Manage Goals
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-pink-400" />
                    Settings Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                      <Bell className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm">Notifications ready</p>
                        <p className="text-xs text-secondary">Review reminders anytime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-sm">Privacy controls available</p>
                        <p className="text-xs text-secondary">Camera and data settings</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-auto w-full justify-between" onClick={() => onNavigate('settings')}>
                    Open Settings
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.length ? (
                    recentActivity.map((activity: any, index: number) => (
                      <div key={`${activity.label}-${index}`} className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <CalendarCheck className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm">{activity.label}</p>
                          <p className="text-xs text-secondary">
                            {activity.time ? new Date(activity.time).toLocaleString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-secondary">No recent backend activity yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AchievementCelebrationPopup
        isVisible={achievementPopup !== null}
        achievement={achievementPopup?.achievement ?? null}
        Icon={AchievementPopupIcon}
        onClose={closeAchievementPopup}
        onViewBadges={() => {
          closeAchievementPopup();
          onNavigate('achievements');
        }}
      />
    </div>
  );
}

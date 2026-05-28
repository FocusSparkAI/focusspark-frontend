import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Home,
  BarChart3,
  TrendingUp,
  Zap,
  Download,
  Clock,
  CalendarCheck,
  AlertCircle,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { type ApiRecord, getString } from '../../utils/apiTypes';

interface AnalyticsDashboardProps {
  onNavigate: (page: string) => void;
}

type FocusDataRow = {
  date: string;
  minutes: number;
  distractions: number;
  accuracy: number;
};

type ConsistencyDataRow = {
  week: string;
  studyDays: number;
  completedSessions: number;
};

type StudyInsight = {
  title: string;
  value: string;
  detail: string;
  icon: typeof CalendarCheck;
  color: string;
};

const toCsvCell = (value: unknown) => {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (filename: string, rows: unknown[][]) => {
  const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function AnalyticsDashboard({ onNavigate }: AnalyticsDashboardProps) {
  const [backendAnalytics, setBackendAnalytics] = useState<ApiRecord | null>(null);
  const [backendSummary, setBackendSummary] = useState<ApiRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [analyticsResponse, summaryResponse] = await Promise.all([
          axios.get(buildBackendUrl(BACKEND_ROUTES.study.stats.analytics), { headers }),
          axios.get(buildBackendUrl(BACKEND_ROUTES.study.stats.summary), { headers }),
        ]);

        setBackendAnalytics(analyticsResponse.data);
        setBackendSummary(summaryResponse.data);
        setLoadError(null);
      } catch (error) {
        setLoadError('Could not load backend analytics yet.');
        console.warn('Backend analytics failed.', error);
      }
    };

    loadAnalytics();
  }, []);

  const focusData: FocusDataRow[] = useMemo(() => {
    if (!Array.isArray(backendAnalytics?.daily_focus)) return [];

    return (backendAnalytics.daily_focus as ApiRecord[]).map((item) => ({
      date: getString(item.day),
      minutes: Number(item.minutes ?? 0),
      distractions: Number(item.distractions ?? 0),
      accuracy: Number(item.focus_score ?? 0),
    }));
  }, [backendAnalytics]);

  const consistencyData: ConsistencyDataRow[] = useMemo(() => {
    if (!Array.isArray(backendAnalytics?.weekly_consistency)) return [];

    return (backendAnalytics.weekly_consistency as ApiRecord[]).map((item) => ({
      week: getString(item.week),
      studyDays: Number(item.study_days ?? 0),
      completedSessions: Number(item.completed_sessions ?? 0),
    }));
  }, [backendAnalytics]);

  const totalFocusMinutes =
    Number(backendAnalytics?.total_focus_minutes ?? backendSummary?.total_work_minutes ?? 0) ||
    focusData.reduce((sum, item) => sum + item.minutes, 0);
  const averageFocusScore =
    Number(backendAnalytics?.average_focus ?? backendSummary?.average_focus ?? 0) ||
    (focusData.length
      ? Math.round(focusData.reduce((sum, item) => sum + item.accuracy, 0) / focusData.length)
      : 0);
  const completedSessions =
    Number(backendAnalytics?.completed_sessions ?? backendSummary?.completed_sessions ?? 0) ||
    consistencyData.reduce((sum, item) => sum + item.completedSessions, 0);
  const totalDistractions =
    Number(backendAnalytics?.total_distractions ?? backendSummary?.total_distractions ?? 0) ||
    focusData.reduce((sum, item) => sum + item.distractions, 0);
  const currentStreak = Number(backendAnalytics?.current_streak ?? backendSummary?.current_streak ?? 0);
  const goalsCompleted = Number(backendAnalytics?.goals_completed ?? backendSummary?.goals_completed ?? 0);
  const goalsIncomplete = Number(backendAnalytics?.goals_incomplete ?? backendSummary?.goals_incomplete ?? 0);
  const goalCompletionRate = Number(backendAnalytics?.goal_completion_rate ?? backendSummary?.goal_completion_rate ?? 0);

  const studyInsights = useMemo<StudyInsight[]>(() => {
    const backendInsights = Array.isArray(backendAnalytics?.insights) ? backendAnalytics.insights : [];
    const icons = [CalendarCheck, Clock, AlertCircle, Target];
    const colors = ['text-teal-400', 'text-blue-400', 'text-yellow-400', 'text-green-400'];

    return (backendInsights as ApiRecord[]).map((insight, index) => ({
      title: getString(insight.title, 'Study insight'),
      value: getString(insight.value),
      detail: getString(insight.detail),
      icon: icons[index % icons.length],
      color: colors[index % colors.length],
    }));
  }, [backendAnalytics]);

  const handleExportData = () => {
    if (!focusData.length && !consistencyData.length) {
      toast.info('No analytics data is available to export yet.');
      return;
    }

    downloadCsv('focusspark-analytics.csv', [
      ['FocusSpark Analytics Export'],
      ['Exported At', new Date().toISOString()],
      [],
      ['Summary'],
      ['Total Focus Minutes', totalFocusMinutes],
      ['Average Focus Score', averageFocusScore],
      ['Completed Sessions', completedSessions],
      ['Distractions', totalDistractions],
      ['Current Study Streak', currentStreak],
      ['Goals Completed', goalsCompleted],
      ['Goals Incomplete', goalsIncomplete],
      ['Goal Completion Rate', `${goalCompletionRate}%`],
      [],
      ['Daily Focus'],
      ['Day', 'Focus Minutes', 'Distractions', 'Focus Score'],
      ...focusData.map((item) => [item.date, item.minutes, item.distractions, item.accuracy]),
      [],
      ['Weekly Consistency'],
      ['Week', 'Study Days', 'Completed Sessions'],
      ...consistencyData.map((item) => [item.week, item.studyDays, item.completedSessions]),
      [],
      ['Insights'],
      ['Title', 'Value', 'Detail'],
      ...studyInsights.map((insight) => [insight.title, insight.value, insight.detail]),
    ]);
    toast.success('Analytics export ready.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="w-full px-8 py-4 lg:px-10">
          <div className="flex items-center justify-between">
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
                <h1 className="gradient-text flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Focus Analytics
                </h1>
                <p className="text-sm text-secondary">
                  Study patterns, consistency, and focus trends
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={handleExportData} className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loadError && (
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
            {loadError}
          </div>
        )}

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="rhythm">Study Rhythm</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Total Focus Time',
                  value: totalFocusMinutes,
                  detail: 'minutes in recent sessions',
                  icon: Zap,
                  color: 'text-blue-400',
                },
                {
                  label: 'Avg Focus Score',
                  value: `${averageFocusScore}%`,
                  detail: 'recent work sessions',
                  icon: BarChart3,
                  color: 'text-purple-400',
                },
                {
                  label: 'Study Sessions',
                  value: completedSessions,
                  detail: 'completed sessions',
                  icon: CalendarCheck,
                  color: 'text-teal-400',
                },
                {
                  label: 'Goal Completion',
                  value: `${goalCompletionRate}%`,
                  detail: `${goalsCompleted} done, ${goalsIncomplete} incomplete`,
                  icon: Target,
                  color: 'text-green-400',
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <Card className="border-border bg-card shadow-sm">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted/50">
                            <Icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </div>
                        <p className="text-sm text-secondary">{stat.label}</p>
                        <p className="mt-2 text-3xl leading-none gradient-text">{stat.value}</p>
                        <p className="mt-2 text-xs text-secondary">{stat.detail}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-400" />
                    Focus Minutes Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={focusData}>
                        <defs>
                          <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="#B0B8C4" />
                        <YAxis stroke="#B0B8C4" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--popover)',
                            border: '1px solid var(--border)',
                            color: 'var(--popover-foreground)',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="minutes"
                          stroke="url(#focusGradient)"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={focusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="#B0B8C4" />
                        <YAxis stroke="#B0B8C4" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--popover)',
                            border: '1px solid var(--border)',
                            color: 'var(--popover-foreground)',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="distractions" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="accuracy" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="rhythm" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-teal-400" />
                    Weekly Consistency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={consistencyData}>
                        <defs>
                          <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="week" stroke="#B0B8C4" />
                        <YAxis stroke="#B0B8C4" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--popover)',
                            border: '1px solid var(--border)',
                            color: 'var(--popover-foreground)',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completedSessions"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Completed Sessions"
                        />
                        <Line
                          type="monotone"
                          dataKey="studyDays"
                          stroke="url(#retentionGradient)"
                          strokeWidth={3}
                          name="Study Days"
                          dot={{ fill: '#14b8a6', r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <p className="mb-1 text-2xl gradient-text">{currentStreak}d</p>
                      <p className="text-xs text-secondary">Current Study Streak</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <p className="mb-1 text-2xl gradient-text">{completedSessions}</p>
                      <p className="text-xs text-secondary">Recent Sessions</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <p className="mb-1 text-2xl gradient-text">{goalCompletionRate}%</p>
                      <p className="text-xs text-secondary">Goal Completion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div>
              <h2 className="mb-1 text-xl">Study Insights</h2>
              <p className="text-sm text-secondary">Patterns from your recent focus sessions</p>
            </div>

            {studyInsights.length ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {studyInsights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card className="border-border bg-card shadow-sm">
                        <CardContent className="p-6">
                          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-muted/50">
                            <Icon className={`h-6 w-6 ${insight.color}`} />
                          </div>
                          <p className="text-sm text-secondary">{insight.title}</p>
                          <p className="mt-2 text-2xl leading-none gradient-text">{insight.value}</p>
                          <p className="mt-3 text-sm text-secondary">{insight.detail}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-6 text-sm text-secondary">
                  No backend insights are available yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

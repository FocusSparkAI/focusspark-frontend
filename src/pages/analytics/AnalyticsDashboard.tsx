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
  Target,
  AlertCircle,
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

interface AnalyticsDashboardProps {
  onNavigate: (page: string) => void;
}

// Sample data
const focusData = [
  { date: 'Mon', minutes: 120, distractions: 5, accuracy: 85 },
  { date: 'Tue', minutes: 95, distractions: 8, accuracy: 78 },
  { date: 'Wed', minutes: 140, distractions: 3, accuracy: 92 },
  { date: 'Thu', minutes: 110, distractions: 6, accuracy: 88 },
  { date: 'Fri', minutes: 130, distractions: 4, accuracy: 90 },
  { date: 'Sat', minutes: 160, distractions: 2, accuracy: 95 },
  { date: 'Sun', minutes: 145, distractions: 3, accuracy: 91 },
];

const consistencyData = [
  { week: 'Week 1', studyDays: 4, completedSessions: 18 },
  { week: 'Week 2', studyDays: 5, completedSessions: 22 },
  { week: 'Week 3', studyDays: 6, completedSessions: 25 },
  { week: 'Week 4', studyDays: 7, completedSessions: 27 },
];

const studyInsights = [
  {
    title: 'Best focus day',
    value: 'Saturday',
    detail: '160 focused minutes with only 2 distractions',
    icon: CalendarCheck,
    color: 'text-teal-400',
  },
  {
    title: 'Best study window',
    value: '7-9 PM',
    detail: 'Highest average accuracy in recent sessions',
    icon: Clock,
    color: 'text-blue-400',
  },
  {
    title: 'Needs attention',
    value: 'Midweek dips',
    detail: 'Wednesday and Friday show lower consistency',
    icon: AlertCircle,
    color: 'text-yellow-400',
  },
];

export function AnalyticsDashboard({ onNavigate }: AnalyticsDashboardProps) {
  const handleExportData = () => {
    toast.success('Preparing analytics export...');
    setTimeout(() => {
      toast.success('Analytics export ready.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('dashboard')}
                className="hover:bg-accent"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="gradient-text flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Focus Analytics
                </h1>
                <p className="text-sm text-secondary">
                  Study patterns, consistency, and focus trends
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExportData} className="gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="rhythm">Study Rhythm</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Key Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-secondary">Total Focus Time</p>
                    <p className="mt-2 text-3xl leading-none gradient-text">900</p>
                    <p className="mt-2 text-xs text-secondary">minutes this week</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-secondary">Avg Focus Score</p>
                    <p className="mt-2 text-3xl leading-none gradient-text">88%</p>
                    <p className="mt-2 text-xs text-secondary">+5% from last week</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/10">
                        <CalendarCheck className="w-6 h-6 text-teal-400" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-secondary">Study Sessions</p>
                    <p className="mt-2 text-3xl leading-none gradient-text">27</p>
                    <p className="mt-2 text-xs text-secondary">this week</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-500/10">
                        <AlertCircle className="w-6 h-6 text-yellow-400" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-secondary">Distractions</p>
                    <p className="mt-2 text-3xl leading-none gradient-text">31</p>
                    <p className="mt-2 text-xs text-yellow-400">-12% from last week</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Focus Minutes Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
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

            {/* Distractions & Accuracy Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
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

          {/* Study Rhythm Tab */}
          <TabsContent value="rhythm" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-teal-400" />
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

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl gradient-text mb-1">7d</p>
                      <p className="text-xs text-secondary">Current Study Streak</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl gradient-text mb-1">27</p>
                      <p className="text-xs text-secondary">Sessions This Week</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl gradient-text mb-1">6/7</p>
                      <p className="text-xs text-secondary">Goal Days Hit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div>
              <h2 className="text-xl mb-1">Study Insights</h2>
              <p className="text-sm text-secondary">
                Patterns from your recent focus sessions
              </p>
            </div>

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
                    <Card className="bg-card border-border shadow-sm">
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

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Recommended Focus Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-sm text-secondary">Next goal</p>
                  <p className="mt-1 text-lg">150 focused minutes</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-sm text-secondary">Best session length</p>
                  <p className="mt-1 text-lg">45 minutes</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-sm text-secondary">Distraction target</p>
                  <p className="mt-1 text-lg">Under 4 per day</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


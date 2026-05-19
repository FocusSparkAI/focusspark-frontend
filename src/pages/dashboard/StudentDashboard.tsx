import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Flame,
  LineChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';
import { DashboardNavbar } from '../../components/layout/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function StudentDashboard({ onNavigate, theme, onToggleTheme }: StudentDashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const stats = [
    {
      label: 'Weekly Focus',
      value: '8.7h',
      detail: '+12% from last week',
      icon: BarChart3,
      color: 'text-teal-400',
    },
    {
      label: 'Focus Score',
      value: '85%',
      detail: 'Strong consistency',
      icon: LineChart,
      color: 'text-blue-400',
    },
    {
      label: 'Current Streak',
      value: '7d',
      detail: 'Keep momentum going',
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      label: 'Badges Earned',
      value: '4/12',
      detail: '2 close to unlock',
      icon: Trophy,
      color: 'text-yellow-400',
    },
  ];

  const weeklyBars = [64, 76, 52, 88, 70, 92, 58];
  const recentActivity = [
    { label: 'Weekly report generated', time: 'Today', icon: BarChart3, color: 'text-teal-400' },
    { label: 'New achievement progress recorded', time: 'Yesterday', icon: Trophy, color: 'text-yellow-400' },
    { label: 'Profile preferences reviewed', time: '2 days ago', icon: User, color: 'text-purple-400' },
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
                  <h1 className="text-4xl mb-3">Welcome back, Learner!</h1>
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
                        {weeklyBars.map((height, index) => (
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
                              animate={{ height: `${Math.round(height * 1.28)}px` }}
                              transition={{ delay: 0.25 + index * 0.05, duration: 0.5 }}
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
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                          <span
                            key={`${day}-${index}`}
                            className="text-xs text-secondary"
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              lineHeight: '24px',
                            }}
                          >
                            {day}
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
                      <p className="text-4xl leading-none gradient-text">7 days</p>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-secondary">Badge collection</span>
                        <span>4/12</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                          initial={{ width: 0 }}
                          animate={{ width: '33%' }}
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
                    <User className="h-5 w-5 text-purple-400" />
                    Profile Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                      <span className="text-sm text-secondary">Account details</span>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                      <span className="text-sm text-secondary">Onboarding complete</span>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                  <Button variant="outline" className="mt-auto w-full justify-between" onClick={() => onNavigate('profile')}>
                    Manage Profile
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
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.label} className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div>
                          <p className="text-sm">{activity.label}</p>
                          <p className="text-xs text-secondary">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

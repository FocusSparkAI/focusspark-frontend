import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import {
  Home,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  Award,
  BellRing,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFocus } from '../../context/FocusContext';

interface ReportsAnalyticsProps {
  onNavigate: (page: string) => void;
}

export function ReportsAnalytics({ onNavigate }: ReportsAnalyticsProps) {
  const { totalFocusedMinutes, focusScore } = useFocus();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Calendar heatmap data (last 90 days). Dummy data stays stable until backend data is connected.
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const seed = i + 1;
      const minutes = Math.round(18 + Math.abs(Math.sin(seed * 1.7)) * 142);

      data.push({
        date: date.toISOString().split('T')[0],
        minutes,
        sessions: Math.max(1, Math.round(minutes / 45)),
        goals: minutes > 95 ? 2 : minutes > 45 ? 1 : 0,
      });
    }
    return data;
  };

  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const heatmapMonthLabels = useMemo(
    () =>
      [0, 30, 60, 89].map((index) =>
        new Date(heatmapData[index].date).toLocaleString('en-US', { month: 'short' })
      ),
    [heatmapData]
  );
  const selectedDayData = selectedDay
    ? heatmapData.find((d) => d.date === selectedDay)
    : null;

  // Chart data
  const weeklyData = [
    { day: 'Mon', focusTime: 87, distractions: 12, accuracy: 85 },
    { day: 'Tue', focusTime: 102, distractions: 8, accuracy: 88 },
    { day: 'Wed', focusTime: 95, distractions: 15, accuracy: 82 },
    { day: 'Thu', focusTime: 120, distractions: 5, accuracy: 92 },
    { day: 'Fri', focusTime: 78, distractions: 18, accuracy: 79 },
    { day: 'Sat', focusTime: 145, distractions: 3, accuracy: 95 },
    { day: 'Sun', focusTime: 110, distractions: 7, accuracy: 90 },
  ];

  const monthlyData = [
    { week: 'Week 1', focusTime: 520, distractions: 45, accuracy: 85 },
    { week: 'Week 2', focusTime: 580, distractions: 38, accuracy: 88 },
    { week: 'Week 3', focusTime: 495, distractions: 52, accuracy: 82 },
    { week: 'Week 4', focusTime: 650, distractions: 28, accuracy: 91 },
  ];

  const yearlyData = [
    { month: 'Jan', focusTime: 2100, distractions: 180, accuracy: 84 },
    { month: 'Feb', focusTime: 2300, distractions: 160, accuracy: 86 },
    { month: 'Mar', focusTime: 2500, distractions: 145, accuracy: 88 },
    { month: 'Apr', focusTime: 2200, distractions: 170, accuracy: 85 },
    { month: 'May', focusTime: 2600, distractions: 130, accuracy: 90 },
    { month: 'Jun', focusTime: 2400, distractions: 155, accuracy: 87 },
    { month: 'Jul', focusTime: 2700, distractions: 120, accuracy: 92 },
    { month: 'Aug', focusTime: 2550, distractions: 140, accuracy: 89 },
    { month: 'Sep', focusTime: 2450, distractions: 150, accuracy: 88 },
    { month: 'Oct', focusTime: 2650, distractions: 125, accuracy: 91 },
  ];

  const chartData =
    timeRange === 'week' ? weeklyData : timeRange === 'month' ? monthlyData : yearlyData;

  const getIntensityColor = (minutes: number) => {
    if (minutes === 0) return 'bg-muted';
    if (minutes < 30) return 'bg-blue-900/30';
    if (minutes < 60) return 'bg-blue-700/50';
    if (minutes < 90) return 'bg-blue-500/70';
    if (minutes < 120) return 'bg-purple-500/80';
    return 'bg-purple-600';
  };

  const handleDayClick = (dayData: any) => {
    setSelectedDay(dayData.date);
  };

  const handleExportPDF = () => {
    toast.success('Preparing PDF report...');
  };

  const handleExportCSV = () => {
    toast.success('Preparing CSV export...');
  };

  // Summary stats
  const totalFocusMinutes = chartData.reduce((sum, d: any) => sum + d.focusTime, 0);
  const avgFocusScore = Math.round(
    chartData.reduce((sum, d: any) => sum + d.accuracy, 0) / chartData.length
  );
  const totalDistractions = chartData.reduce((sum, d: any) => sum + d.distractions, 0);
  const goalsCompleted = 24;

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
                <h1 className="gradient-text">Focus Reports</h1>
                <p className="text-sm text-secondary">
                  Track your progress and productivity trends
                </p>
              </div>
            </div>

            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl leading-none gradient-text">{totalFocusedMinutes || totalFocusMinutes}</p>
              <p className="mt-2 text-sm text-secondary">Total Focused Minutes</p>
              {totalFocusedMinutes > 0 && (
                <p className="text-xs text-focus-green mt-1">
                  Tracked with Focus Detection
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl leading-none gradient-text">{focusScore || avgFocusScore}%</p>
              <p className="mt-2 text-sm text-secondary">Average Focus Score</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/10">
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                </div>
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl leading-none gradient-text">{goalsCompleted}</p>
              <p className="mt-2 text-sm text-secondary">Goals Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-500/10">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <BellRing className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-3xl leading-none gradient-text">{totalDistractions}</p>
              <p className="mt-2 text-sm text-secondary">Distraction Alerts</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Activity Heatmap
                </CardTitle>
                <p className="text-sm text-secondary">Last 90 days</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-4">
                <div className="min-w-max">
                  <div style={{ display: 'flex', marginLeft: 34, marginBottom: 8, width: 204, justifyContent: 'space-between' }}>
                    {heatmapMonthLabels.map((month, index) => (
                      <span key={`${month}-${index}`} className="text-xs text-secondary">
                        {month}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <div
                      className="text-xs text-secondary"
                      style={{
                        display: 'grid',
                        gridTemplateRows: 'repeat(7, 12px)',
                        gap: 4,
                        width: 22,
                      }}
                    >
                      <span />
                      <span>Mon</span>
                      <span />
                      <span>Wed</span>
                      <span />
                      <span>Fri</span>
                      <span />
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridAutoFlow: 'column',
                        gridTemplateRows: 'repeat(7, 12px)',
                        gridAutoColumns: '12px',
                        gap: 4,
                      }}
                    >
                      {heatmapData.map((day, index) => (
                        <motion.div
                          key={day.date}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.005 }}
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          className={`rounded-sm cursor-pointer ${getIntensityColor(
                            day.minutes
                          )} hover:ring-2 hover:ring-blue-500 transition-all relative group`}
                          style={{ width: 12, height: 12 }}
                          onClick={() => handleDayClick(day)}
                          title={`${day.date}: ${day.minutes} min, ${day.sessions} sessions, ${day.goals} goals`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between mt-4 text-xs text-secondary">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-blue-900/30" />
                  <div className="w-3 h-3 rounded-sm bg-blue-700/50" />
                  <div className="w-3 h-3 rounded-sm bg-blue-500/70" />
                  <div className="w-3 h-3 rounded-sm bg-purple-500/80" />
                  <div className="w-3 h-3 rounded-sm bg-purple-600" />
                </div>
                <span>More</span>
              </div>

              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                >
                  <p className="text-sm">
                    <strong>Selected:</strong> {selectedDay}
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    {selectedDayData?.minutes} min studied, {selectedDayData?.sessions} sessions, {selectedDayData?.goals} goals
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Time Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Focus Time Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey={
                        timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'
                      }
                      stroke="#B0B8C4"
                    />
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
                      dataKey="focusTime"
                      stroke="url(#colorFocus)"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                      fill="url(#colorFocus)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Focus Accuracy Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Focus Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey={
                        timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'
                      }
                      stroke="#B0B8C4"
                    />
                    <YAxis stroke="#B0B8C4" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        color: 'var(--popover-foreground)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="accuracy" fill="url(#colorAccuracy)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Distractions Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Distraction Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="colorDistraction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey={
                        timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'
                      }
                      stroke="#B0B8C4"
                    />
                    <YAxis stroke="#B0B8C4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        color: 'var(--popover-foreground)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="distractions"
                      fill="url(#colorDistraction)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Combined Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal-400" />
                  Combined Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey={
                        timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month'
                      }
                      stroke="#B0B8C4"
                    />
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
                      dataKey="focusTime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Focus Time (min)"
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Accuracy (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="distractions"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Distractions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Export Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Export Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={handleExportPDF} className="gap-2" variant="outline">
                  <FileText className="w-4 h-4" />
                  Export as PDF
                </Button>

                <Button onClick={handleExportCSV} className="gap-2" variant="outline">
                  <FileText className="w-4 h-4" />
                  Export as CSV
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                <p className="text-sm text-center text-secondary">
                  Progress powered by your consistency.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

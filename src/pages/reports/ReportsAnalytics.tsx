import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
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
  Home,
  Download,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Award,
  BellRing,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { type ApiRecord } from '../../utils/apiTypes';
import { formatUserDateKey, formatUserMonth } from '../../utils/timezone';

interface ReportsAnalyticsProps {
  onNavigate: (page: string) => void;
}

type HeatmapDay = {
  date: string;
  minutes: number;
  sessions: number;
  distractions: number;
  inRange: boolean;
  column: number;
  row: number;
};

type ReportRange = 'week' | 'month';

type StudySession = ApiRecord & {
  actual_duration_minutes?: number | string;
  planned_duration_minutes?: number | string;
  started_at?: string;
  created_at?: string;
  completed?: boolean;
  distraction_count?: number | string;
  session_type?: string;
};

type StudyGoal = ApiRecord & {
  title?: string;
  current_minutes?: number | string;
  target_minutes?: number | string;
  completed?: boolean;
  goal_date?: string;
  due_date?: string;
  completed_at?: string;
  updated_at?: string;
};

const getSessionMinutes = (session: StudySession) =>
  Number(session?.actual_duration_minutes ?? session?.planned_duration_minutes ?? 0);

const HEATMAP_DAYS_PER_WEEK = 7;
const HEATMAP_LEVELS = [
  { label: '0 min', min: 0, max: 0, color: '#cbd5e1' },
  { label: '1-29 min', min: 1, max: 29, color: '#5eead4' },
  { label: '30-59 min', min: 30, max: 59, color: '#14b8a6' },
  { label: '60-89 min', min: 60, max: 89, color: '#0284c7' },
  { label: '90+ min', min: 90, max: Infinity, color: '#1d4ed8' },
];

const toDateKey = (value: unknown) => {
  if (!value) return null;
  const dateKey = formatUserDateKey(String(value));
  return dateKey || null;
};

const toGoalDateKey = (value: unknown) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return toDateKey(value);
};

const toCsvCell = (value: unknown) => {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadCsv = (filename: string, rows: unknown[][]) => {
  const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\n');
  downloadBlob(filename, new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
};

const escapePdfText = (value: unknown) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const createSimplePdfBlob = (title: string, lines: string[]) => {
  const pageLines = 38;
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(lines.length / pageLines)) },
    (_, pageIndex) => lines.slice(pageIndex * pageLines, (pageIndex + 1) * pageLines),
  );

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const kids: string[] = [];

  pages.forEach((page, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    kids.push(`${pageObjectNumber} 0 R`);

    const content = [
      'BT',
      '/F1 16 Tf',
      '72 760 Td',
      `(${escapePdfText(index === 0 ? title : `${title} continued`)}) Tj`,
      '/F1 10 Tf',
      '0 -28 Td',
      ...page.flatMap((line) => [`(${escapePdfText(line)}) Tj`, '0 -16 Td']),
      'ET',
    ].join('\n');

    objects[pageObjectNumber - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber - 1] =
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

export function ReportsAnalytics({ onNavigate }: ReportsAnalyticsProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [reportRange, setReportRange] = useState<ReportRange>('week');
  const [backendSessions, setBackendSessions] = useState<StudySession[]>([]);
  const [backendGoals, setBackendGoals] = useState<StudyGoal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const generateEmptyHeatmapData = (range: ReportRange) => {
    const data: HeatmapDay[] = [];
    const today = new Date();
    let startDate: Date;
    let totalDays: number;
    let rangeStart: Date;
    let rangeEnd: Date;
    let firstDayOffset = 0;

    if (range === 'week') {
      startDate = new Date(today);
      const mondayOffset = (startDate.getDay() + 6) % HEATMAP_DAYS_PER_WEEK;
      startDate.setDate(startDate.getDate() - mondayOffset);
      totalDays = HEATMAP_DAYS_PER_WEEK;
      rangeStart = new Date(startDate);
      rangeEnd = new Date(startDate);
      rangeEnd.setDate(rangeEnd.getDate() + HEATMAP_DAYS_PER_WEEK - 1);
    } else {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      rangeStart = new Date(monthStart);
      startDate = new Date(monthStart);
      firstDayOffset = (startDate.getDay() + 6) % HEATMAP_DAYS_PER_WEEK;

      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      rangeEnd = new Date(monthEnd);
      totalDays = monthEnd.getDate();
    }

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const weekdayOffset = (date.getDay() + 6) % HEATMAP_DAYS_PER_WEEK;

      data.push({
        date: formatUserDateKey(date),
        minutes: 0,
        sessions: 0,
        distractions: 0,
        inRange: date >= rangeStart && date <= rangeEnd,
        column: Math.floor((firstDayOffset + i) / HEATMAP_DAYS_PER_WEEK) + 1,
        row: weekdayOffset + 1,
      });
    }
    return data;
  };

  const heatmapData = useMemo(() => generateEmptyHeatmapData(reportRange), [reportRange]);
  const heatmapWeeks = Math.max(1, ...heatmapData.map((day) => day.column));
  const displayedHeatmapData = useMemo(() => {
    const sessionBuckets = new Map<string, Omit<HeatmapDay, 'inRange' | 'column' | 'row'>>();
    backendSessions.forEach((session) => {
      const date = toDateKey(session?.started_at ?? session?.created_at);
      if (!date) return;

      const current = sessionBuckets.get(date) ?? { date, minutes: 0, sessions: 0, distractions: 0 };
      current.minutes += getSessionMinutes(session);
      current.sessions += session?.completed ? 1 : 0;
      current.distractions += Number(session?.distraction_count ?? 0);
      sessionBuckets.set(date, current);
    });

    return heatmapData.map((day) =>
      day.inRange
        ? { ...day, ...(sessionBuckets.get(day.date) ?? {}) }
        : { ...day, minutes: 0, sessions: 0, distractions: 0 },
    );
  }, [backendSessions, heatmapData]);
  const heatmapMonthLabels = useMemo(() => {
    const columns = Array.from({ length: heatmapWeeks }, (_, columnIndex) => {
      const column = columnIndex + 1;
      const firstDayInColumn = displayedHeatmapData.find((day) => day.column === column);
      if (!firstDayInColumn) return '';

      const currentMonth = formatUserMonth(`${firstDayInColumn.date}T00:00:00`);
      const previousColumn = displayedHeatmapData.find((day) => day.column === column - 1);
      if (!previousColumn) return currentMonth;

      const previousMonth = formatUserMonth(`${previousColumn.date}T00:00:00`);
      return currentMonth === previousMonth ? '' : currentMonth;
    });

    return columns;
  }, [displayedHeatmapData, heatmapWeeks]);
  const selectedDayData = selectedDay
    ? displayedHeatmapData.find((d) => d.date === selectedDay)
    : null;
  const todayDateKey = formatUserDateKey(new Date());

  useEffect(() => {
    const loadReports = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [sessionsResponse, goalsResponse] = await Promise.all([
          axios.get(buildBackendUrl(BACKEND_ROUTES.study.sessions.history), { headers }),
          axios.get(buildBackendUrl(BACKEND_ROUTES.study.goals.list), { headers }),
        ]);

        if (Array.isArray(sessionsResponse.data)) {
          setBackendSessions(sessionsResponse.data as StudySession[]);
        }
        if (Array.isArray(goalsResponse.data)) {
          setBackendGoals(goalsResponse.data as StudyGoal[]);
        }
        setLoadError(null);
      } catch (error) {
        setLoadError('Could not load backend reports yet.');
        console.warn('Backend reports failed.', error);
      }
    };

    const timeoutId = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const getIntensityColor = (minutes: number) => {
    const level = HEATMAP_LEVELS.find((item) => minutes >= item.min && minutes <= item.max);
    return level?.color ?? HEATMAP_LEVELS[0].color;
  };

  const handleDayClick = (dayData: HeatmapDay) => {
    setSelectedDay(dayData.date);
  };

  const handleReportRangeChange = (value: string) => {
    if (value === 'year') {
      toast.info('Yearly reports will be available later.');
      return;
    }

    setReportRange(value as ReportRange);
    setSelectedDay(null);
  };

  const handleExportPDF = () => {
    if (!backendSessions.length && !backendGoals.length) {
      toast.info('No report data is available to export yet.');
      return;
    }

    const lines = [
      `Exported At: ${new Date().toISOString()}`,
      `Report Period: ${reportRange === 'week' ? 'This Week' : 'This Month'}`,
      '',
      'Summary',
      `Total Focus Minutes: ${reportTotalFocusMinutes}`,
      `Average Focus Score: ${reportAverageFocusScore}%`,
      `Goals Completed: ${goalsCompleted}`,
      `Goals Incomplete: ${goalsIncomplete}`,
      `Distraction Alerts: ${reportTotalDistractions}`,
      '',
      'Activity',
      ...displayedHeatmapData
        .filter((day) => day.inRange)
        .map((day) => `${day.date}: ${day.minutes} min, ${day.sessions} completed sessions, ${day.distractions} distractions`),
      '',
      'Goals',
      ...(reportWindowGoals.length
        ? reportWindowGoals.map((goal) =>
            `${goal.title}: ${goal.current_minutes ?? 0}/${goal.target_minutes ?? 0} min, ${goal.completed ? 'completed' : 'in progress'}`,
          )
        : ['No goals in this report window.']),
    ];

    downloadBlob('focusspark-report.pdf', createSimplePdfBlob('FocusSpark Report Export', lines));
    toast.success('PDF export ready');
  };

  const handleExportCSV = () => {
    if (!backendSessions.length && !backendGoals.length) {
      toast.info('No report data is available to export yet.');
      return;
    }

    const rows: unknown[][] = [
      ['FocusSpark Report Export'],
      ['Exported At', new Date().toISOString()],
      ['Report Period', reportRange === 'week' ? 'This Week' : 'This Month'],
      [],
      ['Summary'],
      ['Total Focus Minutes', reportTotalFocusMinutes],
      ['Average Focus Score', reportAverageFocusScore],
      ['Goals Completed', goalsCompleted],
      ['Goals Incomplete', goalsIncomplete],
      ['Distraction Alerts', reportTotalDistractions],
      [],
      [reportRange === 'week' ? 'Activity Heatmap This Week' : 'Activity Heatmap This Month'],
      ['Date', 'Active', 'Focus Minutes', 'Completed Sessions', 'Distractions'],
      ...displayedHeatmapData.filter((day) => day.inRange).map((day) => [
        day.date,
        day.minutes > 0 ? 'Yes' : 'No',
        day.minutes,
        day.sessions,
        day.distractions,
      ]),
      [],
      ['Goals'],
      ['Title', 'Current Minutes', 'Target Minutes', 'Completed', 'Goal Date'],
      ...reportWindowGoals.map((goal) => [
        goal.title,
        goal.current_minutes ?? 0,
        goal.target_minutes ?? 0,
        goal.completed ? 'Yes' : 'No',
        goal.goal_date ?? goal.due_date ?? '',
      ]),
    ];

    downloadCsv('focusspark-report.csv', rows);
    toast.success('CSV export ready');
  };

  // Summary stats
  const heatmapSessionDates = new Set(displayedHeatmapData.filter((day) => day.inRange).map((day) => day.date));
  const reportWindowSessions = backendSessions.filter((session) => {
    const date = toDateKey(session?.started_at ?? session?.created_at);
    return date ? heatmapSessionDates.has(date) : false;
  });
  const reportWindowGoals = backendGoals.filter((goal) => {
    const date = toGoalDateKey(goal?.goal_date ?? goal?.due_date ?? goal?.completed_at ?? goal?.updated_at);
    return date ? heatmapSessionDates.has(date) : false;
  });
  const reportWindowWorkSessions = reportWindowSessions.filter(
    (session) => session.completed && session.session_type === 'work',
  );
  const reportWindowFocusScores = reportWindowWorkSessions.map((session) =>
    Number(session?.distraction_count ?? 0) === 0
      ? 100
      : Math.max(0, 100 - Number(session?.distraction_count ?? 0) * 10),
  );
  const reportWindowFocusMinutes = displayedHeatmapData.reduce(
    (sum, day) => sum + (day.inRange ? day.minutes : 0),
    0,
  );
  const reportWindowDistractions = displayedHeatmapData.reduce(
    (sum, day) => sum + (day.inRange ? day.distractions : 0),
    0,
  );
  const reportWindowAverageFocusScore = reportWindowFocusScores.length
    ? Math.round(reportWindowFocusScores.reduce((sum, score) => sum + score, 0) / reportWindowFocusScores.length)
    : 0;
  const reportTotalFocusMinutes = reportWindowFocusMinutes;
  const reportAverageFocusScore = reportWindowAverageFocusScore;
  const reportTotalDistractions = reportWindowDistractions;
  const goalsCompleted = reportWindowGoals.filter((goal) => goal.completed).length;
  const goalsIncomplete = reportWindowGoals.filter((goal) => !goal.completed).length;
  const activeDays = displayedHeatmapData.filter((day) => day.inRange && day.minutes > 0).length;
  const completedHeatmapSessions = displayedHeatmapData.reduce(
    (sum, day) => sum + (day.inRange ? day.sessions : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="w-full px-8 py-4 lg:px-10">
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
                  Track your progress for the selected report period
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-secondary">
              <span>Report period</span>
              <Select value={reportRange} onValueChange={handleReportRangeChange}>
                <SelectTrigger className="h-6 w-32 border-0 bg-transparent p-0 text-sm text-secondary shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year - Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-3xl leading-none gradient-text">{reportTotalFocusMinutes}</p>
              <p className="mt-2 text-sm text-secondary">Total Focused Minutes</p>
              {loadError && (
                <p className="text-xs text-yellow-400 mt-1">{loadError}</p>
              )}
              {!loadError && reportTotalFocusMinutes > 0 && (
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
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl leading-none gradient-text">{activeDays}</p>
              <p className="mt-2 text-sm text-secondary">Active Days</p>
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
              <p className="mt-1 text-xs text-secondary">{goalsIncomplete} incomplete in this period</p>
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
              <p className="text-3xl leading-none gradient-text">{reportTotalDistractions}</p>
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
                  Active-Day Heatmap
                </CardTitle>
                <p className="text-sm text-secondary">
                  {reportRange === 'week' ? 'This week' : 'This month'}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-4">
                <div className="min-w-max">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${heatmapWeeks}, 16px)`,
                      columnGap: 5,
                      marginLeft: 38,
                      marginBottom: 10,
                    }}
                  >
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
                        gridTemplateRows: 'repeat(7, 16px)',
                        rowGap: 5,
                        width: 28,
                      }}
                    >
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <span key={day} className="leading-4">
                          {day}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${heatmapWeeks}, 16px)`,
                        gridTemplateRows: 'repeat(7, 16px)',
                        gap: 5,
                      }}
                    >
                      {displayedHeatmapData.map((day, index) => (
                        <motion.div
                          key={day.date}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.005 }}
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          className={`relative cursor-pointer rounded-sm transition-all hover:ring-2 hover:ring-blue-500 ${
                            day.date === todayDateKey
                              ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-background'
                              : ''
                          }`}
                          role="button"
                          tabIndex={0}
                          aria-label={
                            day.minutes > 0
                              ? `${day.date}: ${day.minutes} focus minutes across ${day.sessions} completed sessions`
                              : `${day.date}: no recorded focus activity`
                          }
                          style={{
                            gridColumn: day.column,
                            gridRow: day.row,
                            width: 16,
                            height: 16,
                            backgroundColor: getIntensityColor(day.minutes),
                            border: day.minutes === 0 ? '1px solid rgba(100, 116, 139, 0.35)' : '1px solid transparent',
                          }}
                          onClick={() => handleDayClick(day)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleDayClick(day);
                            }
                          }}
                          title={
                            day.minutes > 0
                              ? `${day.date}: active, ${day.minutes} min, ${day.sessions} completed sessions`
                              : `${day.date}: no recorded activity`
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-secondary">
                {HEATMAP_LEVELS.map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{
                        backgroundColor: item.color,
                        border: item.min === 0 ? '1px solid rgba(100, 116, 139, 0.35)' : '1px solid transparent',
                      }}
                    />
                    {item.label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm ring-2 ring-blue-400 ring-offset-2 ring-offset-background" />
                  Today
                </span>
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
                    {selectedDayData && selectedDayData.minutes > 0
                      ? `${selectedDayData.minutes} min studied, ${selectedDayData.sessions} completed sessions, ${selectedDayData.distractions} distractions`
                      : 'No recorded activity'}
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-secondary">Recorded focus</p>
              <p className="mt-2 text-3xl leading-none gradient-text">{reportTotalFocusMinutes}</p>
              <p className="mt-2 text-sm text-secondary">minutes across the report window</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-secondary">Completed sessions</p>
              <p className="mt-2 text-3xl leading-none gradient-text">{completedHeatmapSessions}</p>
              <p className="mt-2 text-sm text-secondary">shown in the active-day heatmap</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-secondary">Average focus score</p>
              <p className="mt-2 text-3xl leading-none gradient-text">{reportAverageFocusScore}%</p>
              <p className="mt-2 text-sm text-secondary">use Analytics for trend details</p>
            </CardContent>
          </Card>
        </section>

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

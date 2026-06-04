import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
import { formatUserDateKey, getUserTimeZone } from '../../utils/timezone';

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
const HEATMAP_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const padCalendarPart = (value: number) => String(value).padStart(2, '0');

const toCalendarDateKey = (date: Date) =>
  `${date.getFullYear()}-${padCalendarPart(date.getMonth() + 1)}-${padCalendarPart(date.getDate())}`;

const getDateKeyParts = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
};

const getCalendarMonthLabel = (dateKey: string) => {
  const { month } = getDateKeyParts(dateKey);
  return HEATMAP_MONTH_LABELS[month - 1] ?? '';
};

const toDateKey = (value: unknown, timeZone?: string) => {
  if (!value) return null;
  const dateKey = formatUserDateKey(String(value), timeZone);
  return dateKey || null;
};

const toGoalDateKey = (value: unknown, timeZone?: string) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return toDateKey(value, timeZone);
};

const toCsvCell = (value: unknown) => {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const formatExportTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const downloadCsv = (filename: string, rows: unknown[][]) => {
  const csv = `\uFEFF${rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n')}`;
  downloadBlob(filename, new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function ReportsAnalytics({ onNavigate }: ReportsAnalyticsProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [reportRange, setReportRange] = useState<ReportRange>('week');
  const [backendSessions, setBackendSessions] = useState<StudySession[]>([]);
  const [backendGoals, setBackendGoals] = useState<StudyGoal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [userTimeZone, setUserTimeZoneState] = useState(() => getUserTimeZone());

  const generateEmptyHeatmapData = (range: ReportRange, timeZone: string) => {
    const data: HeatmapDay[] = [];
    const todayDateKey = formatUserDateKey(new Date(), timeZone);
    const todayParts = getDateKeyParts(todayDateKey);
    const today = new Date(todayParts.year, todayParts.month - 1, todayParts.day);
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
      const monthStart = new Date(todayParts.year, todayParts.month - 1, 1);
      rangeStart = new Date(monthStart);
      startDate = new Date(monthStart);
      firstDayOffset = (startDate.getDay() + 6) % HEATMAP_DAYS_PER_WEEK;

      const monthEnd = new Date(todayParts.year, todayParts.month, 0);
      rangeEnd = new Date(monthEnd);
      totalDays = monthEnd.getDate();
    }

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const weekdayOffset = (date.getDay() + 6) % HEATMAP_DAYS_PER_WEEK;

      data.push({
        date: toCalendarDateKey(date),
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

  const heatmapData = useMemo(
    () => generateEmptyHeatmapData(reportRange, userTimeZone),
    [reportRange, userTimeZone],
  );
  const heatmapWeeks = Math.max(1, ...heatmapData.map((day) => day.column));
  const displayedHeatmapData = useMemo(() => {
    const sessionBuckets = new Map<string, Omit<HeatmapDay, 'inRange' | 'column' | 'row'>>();
    backendSessions.forEach((session) => {
      const date = toDateKey(session?.started_at ?? session?.created_at, userTimeZone);
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
  }, [backendSessions, heatmapData, userTimeZone]);
  const heatmapMonthLabels = useMemo(() => {
    const columns = Array.from({ length: heatmapWeeks }, (_, columnIndex) => {
      const column = columnIndex + 1;
      const firstDayInColumn = displayedHeatmapData.find((day) => day.column === column);
      if (!firstDayInColumn) return '';

      const currentMonth = getCalendarMonthLabel(firstDayInColumn.date);
      const previousColumn = displayedHeatmapData.find((day) => day.column === column - 1);
      if (!previousColumn) return currentMonth;

      const previousMonth = getCalendarMonthLabel(previousColumn.date);
      return currentMonth === previousMonth ? '' : currentMonth;
    });

    return columns;
  }, [displayedHeatmapData, heatmapWeeks]);
  const selectedDayData = selectedDay
    ? displayedHeatmapData.find((d) => d.date === selectedDay)
    : null;
  const todayDateKey = formatUserDateKey(new Date(), userTimeZone);

  useEffect(() => {
    const syncUserTimeZone = () => setUserTimeZoneState(getUserTimeZone());

    syncUserTimeZone();
    window.addEventListener('focusspark-timezone-change', syncUserTimeZone);
    window.addEventListener('storage', syncUserTimeZone);

    return () => {
      window.removeEventListener('focusspark-timezone-change', syncUserTimeZone);
      window.removeEventListener('storage', syncUserTimeZone);
    };
  }, []);

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

  const handleExportPDF = async () => {
    if (!backendSessions.length && !backendGoals.length) {
      toast.info('No report data is available to export yet.');
      return;
    }

    setExportingPdf(true);
    try {
      const periodLabel = reportRange === 'week' ? 'This Week' : 'This Month';
      const heatmapHtml = displayedHeatmapData
        .filter((day) => day.inRange)
        .map((day) => {
          const level = HEATMAP_LEVELS.find((item) => day.minutes >= item.min && day.minutes <= item.max) ?? HEATMAP_LEVELS[0];
          return `<div title="${escapeHtml(day.date)}" style="width:18px;height:18px;border-radius:4px;background:${level.color};border:${day.minutes === 0 ? '1px solid #94a3b8' : '1px solid transparent'}"></div>`;
        })
        .join('');
      const goalsHtml = reportWindowGoals.length
        ? reportWindowGoals.map((goal) => {
            const current = Number(goal.current_minutes ?? 0);
            const target = Math.max(1, Number(goal.target_minutes ?? 0));
            const progress = goal.completed ? 100 : Math.min(100, Math.round((current / target) * 100));
            const fill = goal.completed ? '#2563eb' : '#f59e0b';
            const track = goal.completed ? '#dbeafe' : '#fef3c7';
            return `
              <div style="border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#ffffff;box-shadow:0 6px 18px rgba(15,23,42,.06)">
                <div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start">
                  <div>
                    <div style="font-size:17px;font-weight:700;color:#0f172a">${escapeHtml(goal.title ?? 'Goal')}</div>
                    <div style="margin-top:4px;color:#475569;font-size:14px">${current}/${target} min</div>
                  </div>
                  <div style="border:1px solid #e2e8f0;border-radius:999px;padding:5px 10px;font-size:13px;color:#0f172a">${goal.completed ? 'Completed' : 'Incomplete'}</div>
                </div>
                <div style="height:10px;border-radius:999px;background:${track};margin-top:14px;overflow:hidden">
                  <div style="height:100%;width:${progress}%;border-radius:999px;background:${fill}"></div>
                </div>
              </div>
            `;
          }).join('')
        : '<div style="color:#64748b;font-size:14px">No goals in this report window.</div>';
      const sessionsHtml = reportWindowSessions.length
        ? reportWindowSessions.slice(0, 16).map((session) => `
            <div style="display:flex;justify-content:space-between;gap:18px;border-bottom:1px solid #e2e8f0;padding:10px 0;color:#475569;font-size:13px">
              <span>${escapeHtml(toDateKey(session.started_at ?? session.created_at, userTimeZone) ?? 'Unknown date')} • ${escapeHtml(session.session_type ?? 'session')}</span>
              <span>${getSessionMinutes(session)} min • ${Number(session.distraction_count ?? 0)} distractions</span>
            </div>
          `).join('')
        : '<div style="color:#64748b;font-size:14px">No sessions in this report window.</div>';
      const exportElement = document.createElement('div');
      exportElement.style.cssText = 'position:absolute;left:-10000px;top:0;width:860px;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;padding:28px;';
      exportElement.innerHTML = `
        <section style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 10px 24px rgba(15,23,42,.08)">
          <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start">
            <div>
              <div style="font-size:34px;font-weight:800;color:#0f172a;letter-spacing:-.01em">FocusSpark Report</div>
              <div style="margin-top:8px;color:#475569;font-size:15px">${periodLabel} • Exported ${escapeHtml(new Date().toLocaleString())}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:26px">
            <div style="border:1px solid #e2e8f0;border-radius:14px;padding:18px;background:#f8fafc"><div style="color:#64748b;font-size:13px">Focused Minutes</div><div style="font-size:32px;font-weight:800;margin-top:8px">${reportTotalFocusMinutes}</div></div>
            <div style="border:1px solid #e2e8f0;border-radius:14px;padding:18px;background:#f8fafc"><div style="color:#64748b;font-size:13px">Active Days</div><div style="font-size:32px;font-weight:800;margin-top:8px">${activeDays}</div></div>
            <div style="border:1px solid #e2e8f0;border-radius:14px;padding:18px;background:#f8fafc"><div style="color:#64748b;font-size:13px">Goals Completed</div><div style="font-size:32px;font-weight:800;margin-top:8px">${goalsCompleted}</div></div>
            <div style="border:1px solid #e2e8f0;border-radius:14px;padding:18px;background:#f8fafc"><div style="color:#64748b;font-size:13px">Distractions</div><div style="font-size:32px;font-weight:800;margin-top:8px">${reportTotalDistractions}</div></div>
          </div>
        </section>
        <section style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:20px;box-shadow:0 10px 24px rgba(15,23,42,.06)">
          <h2 style="margin:0 0 16px;font-size:22px;color:#0f172a">Active-Day Heatmap</h2>
          <div style="display:flex;flex-wrap:wrap;gap:7px">${heatmapHtml}</div>
        </section>
        <section style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:20px;box-shadow:0 10px 24px rgba(15,23,42,.06)">
          <h2 style="margin:0 0 16px;font-size:22px;color:#0f172a">Goals</h2>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px">${goalsHtml}</div>
        </section>
        <section style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-top:20px;box-shadow:0 10px 24px rgba(15,23,42,.06)">
          <h2 style="margin:0 0 10px;font-size:22px;color:#0f172a">Sessions</h2>
          ${sessionsHtml}
        </section>
      `;
      document.body.appendChild(exportElement);

      const canvas = await html2canvas(exportElement, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
      });
      exportElement.remove();

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const imageWidth = pageWidth - margin * 2;
      const pageContentHeight = pageHeight - margin * 2;
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');
      if (!pageContext) {
        throw new Error('Could not create PDF page canvas.');
      }

      const pageCanvasHeight = Math.floor((pageContentHeight / imageWidth) * canvas.width);
      pageCanvas.width = canvas.width;

      for (let sourceY = 0, pageIndex = 0; sourceY < canvas.height; sourceY += pageCanvasHeight, pageIndex += 1) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);
        pageCanvas.height = sliceHeight;
        pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageContext.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          pageCanvas.width,
          sliceHeight,
        );

        if (pageIndex > 0) {
          pdf.addPage();
        }

        const sliceImageHeight = (sliceHeight * imageWidth) / canvas.width;
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, imageWidth, sliceImageHeight);
      }

      pdf.save(`focusspark-report-${reportRange}-${formatExportTimestamp()}.pdf`);
      toast.success('PDF export ready');
    } catch (error) {
      toast.error('Could not export PDF.');
      console.warn('PDF export failed.', error);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportCSV = () => {
    if (!backendSessions.length && !backendGoals.length) {
      toast.info('No report data is available to export yet.');
      return;
    }

    const exportedAt = new Date().toISOString();
    const periodLabel = reportRange === 'week' ? 'This Week' : 'This Month';
    const goalProgressPercent = (goal: StudyGoal) => {
      const target = Number(goal.target_minutes ?? 0);
      if (!target) return 0;
      return Math.min(100, Math.round((Number(goal.current_minutes ?? 0) / target) * 100));
    };

    const rows: unknown[][] = [
      ['FocusSpark Report Export'],
      ['Exported At', exportedAt],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
      ['Report Period', periodLabel],
      [],
      ['Summary'],
      ['Total Focus Minutes', reportTotalFocusMinutes],
      ['Average Focus Score %', reportAverageFocusScore],
      ['Completed Sessions', completedHeatmapSessions],
      ['Active Days', activeDays],
      ['Goals Completed', goalsCompleted],
      ['Goals Incomplete', goalsIncomplete],
      ['Distraction Alerts', reportTotalDistractions],
      [],
      [`Activity Heatmap ${periodLabel}`],
      ['Date', 'Active', 'Focus Minutes', 'Completed Sessions', 'Distractions'],
      ...displayedHeatmapData.filter((day) => day.inRange).map((day) => [
        day.date,
        day.minutes > 0 ? 'Yes' : 'No',
        day.minutes,
        day.sessions,
        day.distractions,
      ]),
      [],
      ['Session Details'],
      [
        'Session ID',
        'Date',
        'Started At',
        'Type',
        'Completed',
        'Focus Minutes',
        'Planned Minutes',
        'Distractions',
        'Focus Score %',
      ],
      ...reportWindowSessions.map((session) => {
        const distractions = Number(session.distraction_count ?? 0);
        const focusScore = session.completed && session.session_type === 'work'
          ? Math.max(0, 100 - distractions * 10)
          : '';

        return [
          session.id ?? '',
          toDateKey(session.started_at ?? session.created_at, userTimeZone) ?? '',
          session.started_at ?? session.created_at ?? '',
          session.session_type ?? '',
          session.completed ? 'Yes' : 'No',
          getSessionMinutes(session),
          session.planned_duration_minutes ?? '',
          distractions,
          focusScore,
        ];
      }),
      [],
      ['Goals'],
      ['Title', 'Current Minutes', 'Target Minutes', 'Progress %', 'Completed', 'Goal Date'],
      ...reportWindowGoals.map((goal) => [
        goal.title,
        goal.current_minutes ?? 0,
        goal.target_minutes ?? 0,
        goalProgressPercent(goal),
        goal.completed ? 'Yes' : 'No',
        goal.goal_date ?? goal.due_date ?? '',
      ]),
    ];

    downloadCsv(`focusspark-report-${reportRange}-${formatExportTimestamp()}.csv`, rows);
    toast.success('CSV export ready');
  };

  // Summary stats
  const heatmapSessionDates = new Set(displayedHeatmapData.filter((day) => day.inRange).map((day) => day.date));
  const reportWindowSessions = backendSessions.filter((session) => {
    const date = toDateKey(session?.started_at ?? session?.created_at, userTimeZone);
    return date ? heatmapSessionDates.has(date) : false;
  });
  const reportWindowGoals = backendGoals.filter((goal) => {
    const date = toGoalDateKey(
      goal?.goal_date ?? goal?.due_date ?? goal?.completed_at ?? goal?.updated_at,
      userTimeZone,
    );
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
    <div id="reports-print-page" className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
          <div
            className="flex min-h-16 w-full flex-col items-start gap-3 sm:block"
            style={{ position: 'relative', paddingRight: 380 }}
          >
            <div className="flex min-w-0 items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('dashboard')}
                className="hover:bg-accent"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="gradient-text">Focus Reports</h1>
                <p className="max-w-xl text-sm text-secondary">
                  Track your progress for the selected report period
                </p>
              </div>
            </div>

            <div
              data-pdf-ignore="true"
              className="flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-secondary"
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
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
          data-pdf-ignore="true"
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
                <Button onClick={handleExportPDF} className="gap-2" variant="outline" disabled={exportingPdf}>
                  <FileText className="w-4 h-4" />
                  {exportingPdf ? 'Exporting PDF...' : 'Export as PDF'}
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

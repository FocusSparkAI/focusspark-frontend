import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Home, Target } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { type ApiRecord } from '../../utils/apiTypes';

interface GoalsHistoryPageProps {
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type StudyGoal = ApiRecord & {
  id?: number | string;
  title?: string;
  completed?: boolean;
  current_minutes?: number | string;
  target_minutes?: number | string;
  goal_date?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayKey = () => formatDateKey(new Date());

const goalDateKey = (goal: StudyGoal) => {
  if (typeof goal?.goal_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(goal.goal_date)) return goal.goal_date;
  if (typeof goal?.due_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(goal.due_date)) return goal.due_date;

  const raw = goal?.created_at ?? goal?.updated_at;
  const date = raw ? new Date(raw) : new Date();
  return Number.isNaN(date.getTime()) ? todayKey() : formatDateKey(date);
};

const goalProgress = (goal: StudyGoal) => {
  const current = Number(goal?.current_minutes ?? 0);
  const target = Math.max(5, Number(goal?.target_minutes ?? 5));
  return Math.min(100, Math.round((current / target) * 100));
};

const goalTargetMinutes = (goal: StudyGoal) => Math.max(5, Number(goal?.target_minutes ?? 5));

export function GoalsHistoryPage({ onNavigate }: GoalsHistoryPageProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoals = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.goals.list), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoals(Array.isArray(response.data) ? response.data as StudyGoal[] : []);
        setLoadError(null);
      } catch (error) {
        setLoadError('Could not load goal history yet.');
        console.warn('Goal history load failed.', error);
      }
    };

    void loadGoals();
  }, []);

  const historyGroups = useMemo(() => {
    const groups = new Map<string, StudyGoal[]>();
    goals
      .filter((goal) => goalDateKey(goal) !== todayKey())
      .forEach((goal) => {
        const key = goalDateKey(goal);
        groups.set(key, [...(groups.get(key) ?? []), goal]);
      });

    return Array.from(groups.entries())
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([date, items]) => ({
        date,
        goals: items,
        completed: items.filter((goal) => goal.completed).length,
        incomplete: items.filter((goal) => !goal.completed).length,
      }));
  }, [goals]);

  const renderGoal = (goal: StudyGoal) => (
    <Card key={goal.id} className="border-border bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            {goal.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 truncate font-medium">{goal.title}</p>
              <Badge
                className={
                  goal.completed
                    ? 'border-emerald-500/35 bg-transparent text-emerald-500 dark:text-emerald-300'
                    : 'border-border bg-transparent text-secondary'
                }
                variant="outline"
              >
                {goal.completed ? 'Completed' : 'Incomplete'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-secondary">
              {goal.current_minutes ?? 0}/{goalTargetMinutes(goal)} min
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${goalProgress(goal)}%` }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-3 px-8 py-4 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
              <Home className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="gradient-text">Goal History</h1>
              <p className="text-sm text-secondary">Previous completed and incomplete goals</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => onNavigate('goals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Goals
          </Button>
        </div>
      </header>

      <main className="px-4 py-5 sm:px-6 lg:py-6">
        <div className="mx-auto max-w-6xl space-y-4">
            {loadError && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                {loadError}
              </div>
            )}

            <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-secondary">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    Previous study goals
                  </div>
                  <p className="max-w-2xl text-sm text-secondary">
                    Review previous daily goals and whether each one was completed or left incomplete.
                  </p>
                </div>
                <Button variant="outline" onClick={() => onNavigate('goals')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Goals
                </Button>
              </div>
            </section>

            {historyGroups.length ? (
              <section className="space-y-4">
                {historyGroups.map((group) => (
                  <motion.div
                    key={group.date}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-normal">
                        <Target className="h-5 w-5 text-blue-400" />
                        {group.date}
                      </h2>
                      <p className="rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-secondary">
                        {group.completed} completed, {group.incomplete} incomplete
                      </p>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">{group.goals.map(renderGoal)}</div>
                  </motion.div>
                ))}
              </section>
            ) : (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-6 text-sm text-secondary">No previous goals yet.</CardContent>
              </Card>
            )}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CalendarDays, CheckCircle2, Clock, Home, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { type ApiRecord } from '../../utils/apiTypes';
import { formatUserDateKey } from '../../utils/timezone';

interface GoalsPageProps {
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

const todayKey = () => formatUserDateKey(new Date());

const goalDateKey = (goal: StudyGoal) => {
  if (typeof goal?.goal_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(goal.goal_date)) return goal.goal_date;
  if (typeof goal?.due_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(goal.due_date)) return goal.due_date;

  const raw = goal?.created_at ?? goal?.updated_at;
  const dateKey = raw ? formatUserDateKey(String(raw)) : todayKey();
  return dateKey || todayKey();
};

const goalProgress = (goal: StudyGoal) => {
  const current = Number(goal?.current_minutes ?? 0);
  const target = Math.max(5, Number(goal?.target_minutes ?? 5));
  return Math.min(100, Math.round((current / target) * 100));
};

const goalTargetMinutes = (goal: StudyGoal) => Math.max(5, Number(goal?.target_minutes ?? 5));

export function GoalsPage({ onNavigate }: GoalsPageProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalMinutes, setNewGoalMinutes] = useState('20');
  const [savingGoal, setSavingGoal] = useState(false);

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
      setLoadError('Could not load goals yet.');
      console.warn('Goals load failed.', error);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadGoals(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const todaysGoals = useMemo(() => goals.filter((goal) => goalDateKey(goal) === todayKey()), [goals]);
  const activeGoal = todaysGoals.find((goal) => !goal.completed);
  const completedToday = todaysGoals.filter((goal) => goal.completed).length;
  const incompleteToday = todaysGoals.filter((goal) => !goal.completed).length;

  const handleCreateGoal = async () => {
    const token = localStorage.getItem('auth_token');
    const targetMinutes = Number(newGoalMinutes);
    if (!token || !Number.isFinite(targetMinutes) || targetMinutes < 5) {
      toast.info('Goal duration must be at least 5 minutes.');
      return;
    }

    setSavingGoal(true);
    try {
      await axios.post(
        buildBackendUrl(BACKEND_ROUTES.study.goals.create),
        {
          title: newGoalTitle.trim() || `Study ${targetMinutes} min`,
          target_minutes: targetMinutes,
          goal_date: todayKey(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewGoalTitle('');
      setNewGoalMinutes('20');
      await loadGoals();
      toast.success('Goal added.');
    } catch (error) {
      toast.error('Could not add goal.');
      console.warn('Goal create failed.', error);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await axios.delete(buildBackendUrl(BACKEND_ROUTES.study.goals.delete(goalId)), {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadGoals();
      toast.success('Goal removed.');
    } catch (error) {
      toast.error('Could not remove goal.');
      console.warn('Goal delete failed.', error);
    }
  };

  const renderGoal = (goal: StudyGoal) => (
    <Card key={goal.id} className="border-border bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
            {goal.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Clock className="h-5 w-5 text-sky-500" />}
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
          {!goal.completed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => handleDeleteGoal(Number(goal.id))}
              aria-label="Delete goal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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
              <h1 className="gradient-text">Goals</h1>
              <p className="text-sm text-secondary">Today's study blocks</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => onNavigate('goals-history')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            History
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

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px_150px]">
                <Input value={newGoalTitle} onChange={(event) => setNewGoalTitle(event.target.value)} placeholder="Study block" />
                <Input
                  value={newGoalMinutes}
                  onChange={(event) => setNewGoalMinutes(event.target.value)}
                  type="number"
                  min={5}
                  aria-label="Goal minutes"
                />
                <Button variant="outline" className="justify-between" onClick={handleCreateGoal} disabled={savingGoal}>
                  Add Goal
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-secondary">Active goal</p>
                <p className="mt-1 text-2xl font-semibold leading-tight">
                  {activeGoal ? `${activeGoal.current_minutes ?? 0}/${goalTargetMinutes(activeGoal)} min` : 'None'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-secondary">Completed today</p>
                <p className="mt-1 text-2xl font-semibold leading-tight">{completedToday}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-secondary">Incomplete today</p>
                <p className="mt-1 text-2xl font-semibold leading-tight">{incompleteToday}</p>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-3">
            {todaysGoals.length ? (
              todaysGoals.map(renderGoal)
            ) : (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-6 text-sm text-secondary">No goals for today yet.</CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

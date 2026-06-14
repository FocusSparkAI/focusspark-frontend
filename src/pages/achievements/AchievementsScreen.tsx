import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Home,
  Sparkles,
  Trophy,
  Target,
  Flame,
  Brain,
  Boxes,
  Clock,
  Star,
  Zap,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Layers,
  ListChecks,
  Moon,
  PlayCircle,
  ShieldCheck,
  Share2,
  Sunrise,
  Upload,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { type ApiRecord, getBoolean, getErrorMessage, getNumber, getString } from '../../utils/apiTypes';
import { formatUserDate } from '../../utils/timezone';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedDate?: Date;
  progress: number;
  maxProgress: number;
  criteria: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockOrder: number;
}

interface AchievementsScreenProps {
  onNavigate: (page: string) => void;
}

const iconByBadgeName: Record<string, LucideIcon> = {
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

const mapBackendAchievement = (raw: ApiRecord): Achievement => {
  const rawTier = getString(raw.tier);
  const tier = ['bronze', 'silver', 'gold', 'platinum'].includes(rawTier)
    ? rawTier as Achievement['tier']
    : 'bronze';
  const progress = getNumber(raw.progress_current);
  const maxProgress = getNumber(raw.progress_target ?? raw.criteria_target, 1) || 1;

  return {
    id: String(raw.id ?? raw.key ?? raw.title),
    title: getString(raw.title) || getString(raw.achievement_title, 'Achievement'),
    description: getString(raw.description),
    icon: iconByBadgeName[getString(raw.badge_icon).toLowerCase()] ?? Award,
    unlocked: getBoolean(raw.unlocked),
    unlockedDate: raw.unlocked_at ? new Date(String(raw.unlocked_at)) : undefined,
    progress: Math.min(progress, maxProgress),
    maxProgress,
    criteria: raw.criteria_type
      ? `${String(raw.criteria_type).replace(/_/g, ' ')}: ${maxProgress}`
      : getString(raw.description, 'Complete the required activity'),
    tier,
    unlockOrder: getNumber(raw.unlock_order, 999),
  };
};

const sortAchievementsByUnlockOrder = (items: Achievement[]) =>
  [...items].sort((a, b) => {
    const orderDifference = a.unlockOrder - b.unlockOrder;
    if (orderDifference !== 0) return orderDifference;
    return a.title.localeCompare(b.title);
  });

const progressRadius = 40;
const progressCircumference = 2 * Math.PI * progressRadius;

const getSvgIdSegment = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

export function AchievementsScreen({ onNavigate }: AchievementsScreenProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        onNavigate('signin');
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        const response = await axios.get(buildBackendUrl(BACKEND_ROUTES.study.achievements.list), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setAchievements(sortAchievementsByUnlockOrder((response.data as ApiRecord[]).map(mapBackendAchievement)));
        } else {
          setAchievements([]);
          setLoadError('Unexpected achievements response from server.');
        }
      } catch (error: unknown) {
        setAchievements([]);
        setLoadError(getErrorMessage(error, 'Failed to load achievements.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [onNavigate]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-600 to-orange-400';
      case 'silver':
        return 'from-gray-400 to-gray-200';
      case 'gold':
        return 'from-yellow-500 to-yellow-300';
      case 'platinum':
        return 'from-purple-500 to-pink-500';
    }
  };

  const unlockedCardClass =
    'achievement-card-unlocked';
  const unlockedIconClass =
    'achievement-icon-unlocked';
  const lockedIconClass =
    'achievement-icon-locked';

  const handleBadgeClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    if (achievement.unlocked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleShare = () => {
    if (!selectedAchievement) return;
    toast.success('🎉 Achievement shared!');
  };

  // Confetti effect
  useEffect(() => {
    if (showConfetti) {
      const particles = 50;
      const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];

      for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti';
        particle.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}vw;
          top: -20px;
          pointer-events: none;
          z-index: 9999;
          animation-delay: ${Math.random() * 0.5}s;
        `;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
      }
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
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
                <div className="flex items-center gap-2">
                  <h1 className="gradient-text">Achievements & Rewards</h1>
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                </div>
                <p className="text-sm text-secondary">
                  {unlockedCount} of {totalCount} unlocked • {completionPercentage}% complete
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="ml-auto hidden items-center gap-4 md:flex">
              <div className="text-right">
                <p className="text-sm text-secondary">Overall Progress</p>
                <p className="gradient-text">{completionPercentage}%</p>
              </div>
              <div className="w-32">
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Achievement Grid */}
        {isLoading ? (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="flex min-h-[220px] items-center justify-center px-5 py-6 text-center text-secondary sm:px-8 sm:py-8">
              Loading achievements...
            </CardContent>
          </Card>
        ) : achievements.length === 0 ? (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-5 text-center sm:p-8">
              <Award className="h-10 w-10 text-blue-500" />
              <h2 className="text-xl">No achievements available</h2>
              <p className="max-w-md text-sm text-secondary">
                {loadError || 'Your achievements will appear here once the backend returns them.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            const isLocked = !achievement.unlocked;
            const progressRatio = Math.min(
              Math.max(achievement.progress / achievement.maxProgress, 0),
              1,
            );
            const progressDashOffset = progressCircumference * (1 - progressRatio);
            const progressGradientId = `achievement-progress-${getSvgIdSegment(achievement.id)}`;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="h-full"
              >
                <Card
                  className={`h-full min-h-[360px] border cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-xl transition-all ${
                    isLocked ? 'achievement-card-locked' : unlockedCardClass
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${achievement.title} achievement details`}
                  onClick={() => handleBadgeClick(achievement)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleBadgeClick(achievement);
                    }
                  }}
                >
                  <CardContent className="p-6 text-center relative z-10 h-full flex flex-col items-center">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <motion.div
                          className={`w-20 h-20 rounded-full flex items-center justify-center ${
                            isLocked ? lockedIconClass : unlockedIconClass
                          }`}
                        whileHover={!isLocked ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon
                          className={`w-10 h-10 ${
                            isLocked ? 'text-muted-foreground' : 'text-white'
                          }`}
                        />
                      </motion.div>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-4 min-h-[88px] flex flex-col justify-start">
                      <h3 className={isLocked ? 'achievement-locked-title' : ''}>{achievement.title}</h3>
                      <p className={`text-sm mt-1 max-w-[220px] mx-auto ${isLocked ? 'achievement-locked-description' : 'text-muted-foreground'}`}>
                        {achievement.description}
                      </p>
                    </div>

                    {isLocked && (
                      <div className="achievement-lock-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-3">
                        <div className="w-3 h-4 border border-current rounded-sm relative">
                          <div className="achievement-lock-shackle absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 border border-current rounded-full" />
                        </div>
                        Locked
                      </div>
                    )}

                    {/* Progress */}
                    {isLocked && (
                      <div className="space-y-2 mb-4">
                        <div className="relative w-24 h-24 mx-auto">
                          <svg
                            className="w-full h-full -rotate-90 overflow-visible"
                            viewBox="0 0 96 96"
                            aria-hidden="true"
                          >
                            <circle
                              cx="48"
                              cy="48"
                              r={progressRadius}
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              className="achievement-progress-track"
                            />
                            <motion.circle
                              cx="48"
                              cy="48"
                              r={progressRadius}
                              stroke={`url(#${progressGradientId})`}
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={progressCircumference}
                              strokeDashoffset={progressDashOffset}
                              strokeLinecap="round"
                              initial={{ strokeDashoffset: progressCircumference }}
                              animate={{ strokeDashoffset: progressDashOffset }}
                              transition={{ duration: 1 }}
                            />
                            <defs>
                              <linearGradient
                                id={progressGradientId}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="gradient-text">
                              {Math.round(progressRatio * 100)}%
                            </p>
                          </div>
                        </div>
                        <p className="achievement-progress-count text-xs">
                          {achievement.progress} / {achievement.maxProgress}
                        </p>
                      </div>
                    )}

                    {/* Unlocked Badge */}
                    {!isLocked && achievement.unlockedDate && (
                      <div className="flex items-center justify-center gap-2 text-xs text-green-400 mt-auto mb-4">
                        <CheckCircle className="w-4 h-4" />
                        <span>Unlocked {formatUserDate(achievement.unlockedDate)}</span>
                      </div>
                    )}

                    {/* Criteria */}
                    <p className={`text-xs italic mt-auto max-w-[220px] ${isLocked ? 'achievement-locked-criteria' : 'text-muted-foreground'}`}>
                      {achievement.criteria}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </motion.div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <Dialog
        open={selectedAchievement !== null}
        onOpenChange={(open) => !open && setSelectedAchievement(null)}
      >
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader className={selectedAchievement ? '' : 'sr-only'}>
            <DialogTitle className="text-center gradient-text text-2xl">
              {selectedAchievement?.title || 'Achievement Details'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {selectedAchievement?.description || 'View achievement information'}
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >

                <div className="space-y-6 py-6">
                  {/* Enlarged Badge */}
                  <div className="flex justify-center">
                    <motion.div
                      className={`w-36 h-36 rounded-full flex items-center justify-center ${
                        selectedAchievement.unlocked ? unlockedIconClass : lockedIconClass
                      }`}
                      animate={
                        selectedAchievement.unlocked
                          ? {
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      {(() => {
                        const Icon = selectedAchievement.icon;
                        return (
                          <Icon
                            className={`w-20 h-20 ${
                              selectedAchievement.unlocked ? 'text-white' : 'text-muted-foreground'
                            }`}
                          />
                        );
                      })()}
                    </motion.div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">Tier:</span>
                      <Badge
                        className={`bg-gradient-to-r ${getTierColor(selectedAchievement.tier)}`}
                      >
                        {selectedAchievement.tier.charAt(0).toUpperCase() +
                          selectedAchievement.tier.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-secondary">Criteria:</span>
                      <span className="text-right max-w-xs">{selectedAchievement.criteria}</span>
                    </div>

                    {selectedAchievement.unlocked && selectedAchievement.unlockedDate && (
                      <div className="flex justify-between">
                        <span className="text-secondary">Earned:</span>
                        <span>{formatUserDate(selectedAchievement.unlockedDate)}</span>
                      </div>
                    )}

                    {!selectedAchievement.unlocked && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-secondary">Progress:</span>
                          <span className="gradient-text">
                            {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={
                            (selectedAchievement.progress / selectedAchievement.maxProgress) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedAchievement.unlocked && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>

                      <Button
                        className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
                        onClick={() => {
                          onNavigate('dashboard');
                          setSelectedAchievement(null);
                        }}
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </div>
                  )}
                </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

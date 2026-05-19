import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Clock,
  Star,
  Zap,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  unlockedDate?: Date;
  progress: number;
  maxProgress: number;
  criteria: string;
  reward?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface AchievementsScreenProps {
  onNavigate: (page: string) => void;
}

export function AchievementsScreen({ onNavigate }: AchievementsScreenProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Step',
      description: 'Complete your first Pomodoro session',
      icon: Clock,
      unlocked: true,
      unlockedDate: new Date('2025-10-10'),
      progress: 1,
      maxProgress: 1,
      criteria: 'Complete 1 Pomodoro session',
      reward: 'Blue timer theme unlocked',
      tier: 'bronze',
    },
    {
      id: '2',
      title: 'Streak Starter',
      description: 'Maintain a 7-day study streak',
      icon: Flame,
      unlocked: true,
      unlockedDate: new Date('2025-10-17'),
      progress: 7,
      maxProgress: 7,
      criteria: 'Study for 7 consecutive days',
      reward: 'Fire avatar border',
      tier: 'silver',
    },
    {
      id: '3',
      title: 'Focus Master',
      description: 'Complete a session with 100% focus',
      icon: Trophy,
      unlocked: false,
      progress: 90,
      maxProgress: 100,
      criteria: 'Reach 100% focus in a session',
      tier: 'gold',
    },
    {
      id: '4',
      title: 'Session Collector',
      description: 'Complete 100 focused study blocks',
      icon: Brain,
      unlocked: true,
      unlockedDate: new Date('2025-10-15'),
      progress: 100,
      maxProgress: 100,
      criteria: 'Complete 100 focus blocks',
      reward: 'Purple gradient theme',
      tier: 'silver',
    },
    {
      id: '5',
      title: 'Focus Champion',
      description: 'Achieve 95%+ focus score for 5 sessions',
      icon: Target,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      criteria: 'Maintain 95%+ focus for 5 sessions',
      tier: 'gold',
    },
    {
      id: '6',
      title: 'Early Bird',
      description: 'Start a study session before 7 AM',
      icon: Zap,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      criteria: 'Study before 7 AM',
      tier: 'bronze',
    },
    {
      id: '7',
      title: 'Night Owl',
      description: 'Study past midnight',
      icon: Star,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      criteria: 'Study after midnight',
      tier: 'bronze',
    },
    {
      id: '8',
      title: 'Marathon Runner',
      description: 'Complete 10 Pomodoros in one day',
      icon: TrendingUp,
      unlocked: false,
      progress: 7,
      maxProgress: 10,
      criteria: 'Complete 10 Pomodoros in a single day',
      tier: 'gold',
    },
    {
      id: '9',
      title: 'Knowledge Seeker',
      description: 'Upload 50 study documents',
      icon: BookOpen,
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      criteria: 'Upload 50 documents',
      tier: 'silver',
    },
    {
      id: '10',
      title: 'Consistency King',
      description: 'Maintain a 30-day streak',
      icon: Calendar,
      unlocked: false,
      progress: 7,
      maxProgress: 30,
      criteria: 'Study for 30 consecutive days',
      reward: 'Crown avatar icon',
      tier: 'platinum',
    },
    {
      id: '11',
      title: 'Perfect Score',
      description: 'Hit 100% focus accuracy in 10 sessions',
      icon: Award,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      criteria: 'Reach 100% focus accuracy 10 times',
      tier: 'platinum',
    },
    {
      id: '12',
      title: 'Momentum Builder',
      description: 'Complete a focus block in every planned slot',
      icon: Zap,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      criteria: 'Finish every scheduled focus slot',
      tier: 'gold',
    },
  ]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

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

  const getTierBorder = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'border-orange-500/50';
      case 'silver':
        return 'border-gray-400/50';
      case 'gold':
        return 'border-yellow-500/50';
      case 'platinum':
        return 'border-purple-500/50';
    }
  };

  const handleBadgeClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    if (achievement.unlocked) {
      setShowUnlockAnimation(true);
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
            <div className="hidden md:flex items-center gap-4">
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
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            const isLocked = !achievement.unlocked;

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
                    isLocked ? 'bg-card border-border' : unlockedCardClass
                  }`}
                  onClick={() => handleBadgeClick(achievement)}
                >
                  <CardContent className="p-6 text-center relative z-10 h-full flex flex-col items-center">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <motion.div
                          className={`w-20 h-20 rounded-full flex items-center justify-center ${
                            isLocked ? 'bg-muted' : unlockedIconClass
                          }`}
                        whileHover={!isLocked ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon
                          className={`w-10 h-10 ${
                            isLocked ? 'text-secondary' : 'text-white'
                          }`}
                        />
                      </motion.div>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-4 min-h-[88px] flex flex-col justify-start">
                      <h3 className={isLocked ? 'text-muted-foreground' : ''}>{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[220px] mx-auto">
                        {achievement.description}
                      </p>
                    </div>

                    {isLocked && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs mb-3">
                        <div className="w-3 h-4 border border-current rounded-sm relative">
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 border border-current rounded-full bg-muted" />
                        </div>
                        Locked
                      </div>
                    )}

                    {/* Progress */}
                    {isLocked && (
                      <div className="space-y-2 mb-4">
                        <div className="relative w-24 h-24 mx-auto">
                          <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              className="text-muted"
                            />
                            <motion.circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="url(#gradient-progress)"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${
                                2 * Math.PI * 40 * (1 - achievement.progress / achievement.maxProgress)
                              }`}
                              strokeLinecap="round"
                              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                              animate={{
                                strokeDashoffset:
                                  2 * Math.PI * 40 * (1 - achievement.progress / achievement.maxProgress),
                              }}
                              transition={{ duration: 1 }}
                            />
                            <defs>
                              <linearGradient
                                id="gradient-progress"
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
                              {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-secondary">
                          {achievement.progress} / {achievement.maxProgress}
                        </p>
                      </div>
                    )}

                    {/* Unlocked Badge */}
                    {!isLocked && achievement.unlockedDate && (
                      <div className="flex items-center justify-center gap-2 text-xs text-green-400 mt-auto mb-4">
                        <CheckCircle className="w-4 h-4" />
                        <span>Unlocked {achievement.unlockedDate.toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Criteria */}
                    <p className="text-xs text-muted-foreground italic mt-auto max-w-[220px]">
                      {achievement.criteria}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
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
                      className={`w-32 h-32 rounded-full flex items-center justify-center ${unlockedIconClass}`}
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
                        return <Icon className="w-16 h-16 text-white" />;
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
                        <span>{selectedAchievement.unlockedDate.toLocaleDateString()}</span>
                      </div>
                    )}

                    {selectedAchievement.reward && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs">
                            <strong>Reward:</strong> {selectedAchievement.reward}
                          </span>
                        </div>
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

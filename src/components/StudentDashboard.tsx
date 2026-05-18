import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, ArrowRight, Target, Activity, Trophy, BarChart3, Lightbulb, Zap } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardNavbar } from './DashboardNavbar';
import { PomodoroTimer } from './PomodoroTimer';
import { ProgressStats } from './ProgressStats';
import { AISuggestionsFeed } from './AISuggestionsFeed';
import { FocusDetector } from './FocusDetector';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AchievementUnlockPopup } from './GlobalNotifications';
import { useFocus } from '../context/FocusContext';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function StudentDashboard({ onNavigate, theme, onToggleTheme }: StudentDashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcomeAchievement, setShowWelcomeAchievement] = useState(false);
  const { isDetectionEnabled } = useFocus();

  // Show welcome achievement on first load (demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeAchievement(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <DashboardNavbar onNavigate={onNavigate} theme={theme} onToggleTheme={onToggleTheme} />

        {/* Dashboard Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-4xl mb-2">Welcome back, Learner!</h1>
              <p className="text-secondary">
                Ready to spark your focus? Let's make today productive.
              </p>
            </div>

            {/* Learning Quick Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-card border-2 border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group shadow-sm"
                onClick={() => onNavigate('home')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue-purple">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl mb-1 gradient-text">Learning Workspace</h3>
                        <p className="text-secondary">
                          Continue your study flow from the main FocusSpark experience
                        </p>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 group-hover:scale-110 transition-transform"
                    >
                      Start Learning
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Focus Detection Section (if enabled) */}
            {isDetectionEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <FocusDetector variant="compact" demoMode={true} />
              </motion.div>
            )}

            {/* 6-Card Dashboard Grid */}
            <div className="dashboard-grid">
              {/* Top Row - Main Focus Metrics */}
              <div className="dashboard-row top">
                {/* Card 1: Pomodoro Timer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="card-wrapper"
                >
                  <PomodoroTimer />
                </motion.div>

                {/* Card 2: Progress & Goals */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card-wrapper"
                >
                  <ProgressStats />
                </motion.div>

                {/* Card 3: AI Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-wrapper"
                >
                  <AISuggestionsFeed />
                </motion.div>
              </div>

              {/* Bottom Row - Supporting Data */}
              <div className="dashboard-row bottom">
                {/* Card 4: Achievements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card-wrapper"
                >
                  <Card 
                    className="bg-card border-border hover:border-yellow-500/30 transition-all cursor-pointer h-full spotlight-hover shadow-sm"
                    onClick={() => onNavigate('achievements')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Streak Counter */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                          >
                            <Zap className="w-8 h-8 text-orange-400" />
                          </motion.div>
                          <div>
                            <p className="text-xs text-secondary">Current Streak</p>
                            <p className="text-xl">7 days</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Ring */}
                      <div className="text-center">
                        <p className="text-sm text-secondary mb-3">Badges Unlocked</p>
                        <div className="relative inline-block">
                          <svg width="120" height="120" className="transform -rotate-90">
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-muted"
                            />
                            <motion.circle
                              cx="60"
                              cy="60"
                              r="50"
                              stroke="url(#achievementGradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 50}
                              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - 4/12) }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                            <defs>
                              <linearGradient id="achievementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#F59E0B" />
                                <stop offset="100%" stopColor="#EF4444" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl">4/12</span>
                          </div>
                        </div>
                      </div>

                      {/* View All Button */}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('achievements');
                        }}
                      >
                        View All Badges
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card 5: Focus Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card-wrapper"
                >
                  <Card className="bg-card border-border h-full shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Learning Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Two Column Layout */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Focus Sessions */}
                        <div 
                          className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
                          onClick={() => onNavigate('dashboard')}
                        >
                          <Target className="w-6 h-6 text-blue-400 mb-2" />
                          <p className="text-xs text-secondary mb-1">Focus Sessions</p>
                          <p className="text-2xl mb-1">3</p>
                          <p className="text-xs text-secondary">Completed Today</p>
                        </div>

                        {/* Focus Score */}
                        <div 
                          className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
                          onClick={() => onNavigate('dashboard')}
                        >
                          <Activity className="w-6 h-6 text-purple-400 mb-2" />
                          <p className="text-xs text-secondary mb-1">Focus Score</p>
                          <p className="text-2xl mb-1">85%</p>
                          <p className="text-xs text-secondary">Average</p>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-secondary mb-1">
                            <span>Weekly Goal</span>
                            <span>42/60 hrs</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                              initial={{ width: 0 }}
                              animate={{ width: '70%' }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-secondary mb-1">
                            <span>Focus Accuracy</span>
                            <span>85%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                              initial={{ width: 0 }}
                              animate={{ width: '85%' }}
                              transition={{ duration: 1, delay: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card 6: Reports */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="card-wrapper"
                >
                  <Card 
                    className="bg-card border-border hover:border-teal-500/30 transition-all cursor-pointer h-full spotlight-hover shadow-sm"
                    onClick={() => onNavigate('reports')}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-teal-400" />
                        Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Weekly Chart */}
                      <div>
                        <p className="text-sm text-secondary mb-3">This Week</p>
                        <div className="flex items-end justify-between gap-1 h-24">
                          {[3, 4, 2, 5, 3, 4, 2].map((hours, index) => (
                            <motion.div
                              key={index}
                              className="flex-1 bg-gradient-to-t from-teal-500 to-blue-500 rounded-t"
                              initial={{ height: 0 }}
                              animate={{ height: `${(hours / 5) * 100}%` }}
                              transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                              style={{ minHeight: '8px' }}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-secondary mt-2">
                          <span>Mon</span>
                          <span>Sun</span>
                        </div>
                      </div>

                      {/* Stats Summary */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-secondary">This Week</p>
                          <p className="text-xl">520</p>
                          <p className="text-xs text-secondary">minutes</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-secondary">This Month</p>
                          <p className="text-xl">2.1k</p>
                          <p className="text-xs text-secondary">minutes</p>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('reports');
                        }}
                      >
                        View Detailed Reports
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Tooltip */}
        <footer className="p-4 border-t border-border/50 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-secondary text-center flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span>Tip: Try Focus Mode for Deep Work</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </p>
          </div>
        </footer>
      </div>

      {/* Welcome Achievement Demo */}
      <AchievementUnlockPopup
        isVisible={showWelcomeAchievement}
        achievementTitle="Welcome to FocusSpark!"
        achievementIcon={<Trophy className="w-12 h-12 text-white" />}
        achievementReward="Blue gradient theme unlocked"
        onClose={() => setShowWelcomeAchievement(false)}
        onViewBadges={() => {
          setShowWelcomeAchievement(false);
          onNavigate('achievements');
        }}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipForward, CheckCircle2, Clock, Zap, PartyPopper } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export function PomodoroTimer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, duration: '25m', completed: true },
    { id: 2, duration: '25m', completed: true },
    { id: 3, duration: '25m', completed: false },
  ]);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      // Timer completed
      handleTimerComplete();
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (isBreak) {
      toast.success('Break complete! Ready for another session?', {
        icon: <Zap className="w-4 h-4" />,
      });
      setTime(25 * 60);
      setIsBreak(false);
    } else {
      toast.success('Session complete! Time for a break.');
      setTime(5 * 60);
      setIsBreak(true);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const skipBreak = () => {
    setTime(25 * 60);
    setIsBreak(false);
    setIsActive(false);
  };

  const markDone = () => {
    // Show confetti effect
    toast.success('Amazing work! Session marked as complete.');
    setTime(25 * 60);
    setIsActive(false);
    setIsBreak(false);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const progress = isBreak
    ? ((5 * 60 - time) / (5 * 60)) * 100
    : ((25 * 60 - time) / (25 * 60)) * 100;

  return (
    <Card className={`border-border ${isBreak ? 'focus-wave-break' : 'focus-wave-active'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {/* Circular Timer - Fully Responsive */}
        <div className="flex items-center justify-center flex-1 py-4">
          <div className="relative w-full max-w-[280px] aspect-square">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r="112"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
            </svg>

            {/* Progress Circle */}
            <motion.svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 256 256"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.circle
                cx="128"
                cy="128"
                r="112"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 112}
                strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 112 * (1 - progress / 100),
                }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* Pulsing Glow Effect */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(59, 130, 246, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-4xl sm:text-5xl lg:text-6xl mb-2"
                animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </motion.div>
              <div className="text-xs sm:text-sm text-secondary">
                {isBreak ? 'Break Time' : 'Focus Session'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={toggleTimer}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
            size="lg"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          {isBreak && (
            <Button onClick={skipBreak} variant="outline" size="lg">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Skip
            </Button>
          )}
          {!isBreak && !isActive && (
            <Button onClick={markDone} variant="outline" size="lg">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Done
            </Button>
          )}
        </div>

        {/* Session History */}
        <div className="mt-auto">
          <p className="text-sm text-secondary mb-3">Recent Sessions</p>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm">Session #{session.id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">{session.duration}</span>
                  {session.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-border" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

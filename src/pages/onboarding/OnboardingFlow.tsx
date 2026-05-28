import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  Eye,
  Palette,
  Bell,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { makeFloatingParticles } from '../../utils/stableParticles';

interface OnboardingFlowProps {
  onComplete: (skipTour?: boolean) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const themeOptions = [
  { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-black' },
  { value: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white' },
] as const;

const featurePages = [
  {
    icon: Target,
    iconClass: 'text-blue-400',
    title: 'Dashboard & Progress',
    description: 'The dashboard gives you a quick view of your study momentum, recent sessions, achievements, and next actions.',
    points: ['Track study streaks and focus trends', 'Review recent learning activity', 'Jump into reports, analytics, and achievements'],
  },
  {
    icon: Clock,
    iconClass: 'text-purple-400',
    title: 'Pomodoro Sessions',
    description: 'FocusSpark helps you work in focused sessions with clear work and break timing.',
    points: ['Customize work and break durations in Settings', 'Review session summaries after focused work', 'Keep your timer flow simple and distraction-light'],
  },
  {
    icon: Eye,
    iconClass: 'text-teal-400',
    title: 'Focus Detection & Extension',
    description: 'The frontend and browser extension work together to support attention-aware studying.',
    points: ['Use camera-based focus detection when enabled', 'Keep privacy visible with local-first focus messaging', 'Let the extension support study flow while you browse'],
  },
];

const supportPages = [
  {
    icon: Bell,
    iconClass: 'text-yellow-400',
    title: 'Notifications & Reminders',
    description: 'Notifications help you remember breaks, refocus moments, and session completions without cluttering onboarding with setup.',
    points: ['Tune reminders later in Settings', 'Preview notification behavior from the app', 'Keep study nudges lightweight'],
  },
  {
    icon: Zap,
    iconClass: 'text-pink-400',
    title: 'Reports, Analytics & Tools',
    description: 'After onboarding, you can explore analytics, reports, profile controls, and account settings from the main app.',
    points: ['Compare focus patterns over time', 'Manage profile and privacy choices', 'Use settings as the place for real preferences'],
  },
];

const backgroundParticles = makeFloatingParticles(30, 131);
const confettiParticles = makeFloatingParticles(100, 149);

export function OnboardingFlow({ onComplete, onThemeChange }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('focusspark-theme') as 'light' | 'dark' | null) || 'light',
  );
  const [showConfetti, setShowConfetti] = useState(false);

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      setShowConfetti(true);
      setTimeout(() => {
        // Stay on completion screen
      }, 1000);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleThemeSelect = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  const renderFeaturePage = (page: (typeof featurePages)[number] | (typeof supportPages)[number]) => {
    const Icon = page.icon;

    return (
      <div className="glass-card rounded-3xl p-12">
        <div className="flex items-center gap-3 mb-6">
          <Icon className={`w-8 h-8 ${page.iconClass}`} />
          <h2 className="text-3xl">{page.title}</h2>
        </div>
        <p className="text-secondary mb-8">{page.description}</p>

        <div className="space-y-4">
          {page.points.map((point) => (
            <div key={point} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
              <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-secondary">{point}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start sm:justify-center px-4 sm:px-6 py-6 sm:py-8 gradient-wave relative overflow-x-hidden overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, particle.smallX, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + particle.duration / 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 confetti"
              style={{
                left: particle.left,
                top: '-10%',
                backgroundColor: particle.color,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6 z-10">
        {[...Array(totalSteps)].map((_, i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === currentStep
                ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                : i < currentStep
                ? 'w-2 bg-blue-500'
                : 'w-2 bg-gray-600'
            }`}
            animate={{ scale: i === currentStep ? 1.2 : 1 }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {currentStep === 0 && (
              <div className="glass-card rounded-3xl p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue-purple">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <h1 className="text-4xl mb-4">Welcome to FocusSpark</h1>
                <p className="text-xl text-secondary mb-8">
                  A quick tour of the app, the study flow, and the extension.
                </p>

                <div className="grid gap-3 text-left">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-sm text-secondary">See what the dashboard, study tools, and reports are for.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-sm text-secondary">Choose a theme now, then adjust real preferences later in Settings.</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="glass-card rounded-3xl p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-8 h-8 text-blue-400" />
                  <h2 className="text-3xl">Choose Your Theme</h2>
                </div>
                <p className="text-secondary mb-8">
                  This is the only choice in onboarding. Everything else can be adjusted later in Settings.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {themeOptions.map((theme) => {
                    const isSelected = selectedTheme === theme.value;

                    return (
                      <motion.button
                        key={theme.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleThemeSelect(theme.value)}
                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/50'
                            : 'border-border hover:border-blue-500/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-full h-24 rounded-xl mb-3 ${theme.bg} ${theme.text} flex items-center justify-center`}>
                          Aa
                        </div>
                        <p className="text-sm">{theme.label}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep >= 2 && currentStep <= 4 && renderFeaturePage(featurePages[currentStep - 2])}

            {currentStep === 5 && renderFeaturePage(supportPages[0])}

            {currentStep === 6 && renderFeaturePage(supportPages[1])}

            {currentStep === 7 && (
              <div className="glass-card rounded-3xl p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mb-6"
                >
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center glow-teal">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </div>
                </motion.div>

                <h1 className="text-5xl mb-4">All Set!</h1>
                <p className="text-xl text-secondary mb-8">
                  You can explore reports, analytics, profile controls, and settings from the dashboard.
                </p>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => onComplete(false)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 px-8 py-6"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep < totalSteps - 1 && (
          <div className="flex justify-between mt-6">
            {currentStep === 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onComplete(true)}
                className="hover:bg-white/10"
              >
                Skip tour
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 glow-blue-purple"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

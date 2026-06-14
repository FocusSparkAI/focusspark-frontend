import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navigation } from '../components/layout/Navigation';
import { HeroSection } from '../pages/home/HeroSection';
import { HeroSectionDark } from '../pages/home/HeroSectionDark';
import { ProblemSolution } from '../pages/home/ProblemSolution';
import { Features } from '../pages/home/Features';
import { Testimonials } from '../pages/home/Testimonials';
import { SciencePage } from '../pages/static/SciencePage';
import { AboutPage } from '../pages/static/AboutPage';
import { ContactPage } from '../pages/static/ContactPage';
import { PrivacyPage } from '../pages/static/PrivacyPage';
import { TermsPage } from '../pages/static/TermsPage';
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { OnboardingFlow } from '../pages/onboarding/OnboardingFlow';
import { StudentDashboard } from '../pages/dashboard/StudentDashboard';
import { GoalsPage } from '../pages/goals/GoalsPage';
import { GoalsHistoryPage } from '../pages/goals/GoalsHistoryPage';
import { AchievementsScreen } from '../pages/achievements/AchievementsScreen';
import { ReportsAnalytics } from '../pages/reports/ReportsAnalytics';
import { ProfileScreen } from '../pages/profile/ProfileScreen';
import { SettingsScreen } from '../pages/settings/SettingsScreen';
import { AnalyticsDashboard } from '../pages/analytics/AnalyticsDashboard';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { Footer } from '../components/layout/Footer';
import { Toaster } from '../components/ui/sonner';
import { FocusProvider } from '../context/FocusContext';
import { BACKEND_ROUTES, buildBackendUrl } from '../config/backend';
import { unlockNotificationSound } from '../utils/notificationSound';

function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/signin" replace state={{ fromProtected: true }} />;
  return children;
}

const publicPages = new Set(['home', 'science', 'about', 'contact', 'privacy', 'terms', 'signin', 'signup', 'forgot-password', 'verify-email']);
const publicPaths = new Set(['/', '/science', '/about', '/contact', '/privacy', '/terms', '/signin', '/signup', '/forgot-password', '/verify-email']);
const DEFAULT_THEME = 'light';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('focusspark-theme');
    return savedTheme === 'dark' ? 'dark' : DEFAULT_THEME;
  });

  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('focusspark-theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const saveThemePreference = async (newTheme: 'light' | 'dark') => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await fetch(buildBackendUrl(BACKEND_ROUTES.study.settings.update), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dark_mode: newTheme === 'dark',
          appearance: { theme: newTheme },
        }),
      });
    } catch {
      // Local theme still applies immediately; backend sync can recover later.
    }
  };

  const loadThemePreference = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(buildBackendUrl(BACKEND_ROUTES.study.settings.get), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;

      const data = await response.json();
      const savedTheme =
        data?.appearance?.theme ??
        (typeof data?.dark_mode === 'boolean' ? (data.dark_mode ? 'dark' : 'light') : null);

      if (savedTheme === 'light' || savedTheme === 'dark') {
        applyTheme(savedTheme);
      }
    } catch {
      // Keep the locally selected theme if backend settings are unavailable.
    }
  }, [applyTheme]);

  const applyThemeAndSave = (newTheme: 'light' | 'dark') => {
    applyTheme(newTheme);
    void saveThemePreference(newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.add('preload');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    const timeoutId = window.setTimeout(() => document.documentElement.classList.remove('preload'), 100);
    return () => window.clearTimeout(timeoutId);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyThemeAndSave(newTheme);
  };

  const handleNavigate = (page: string) => {
    const map: Record<string, string> = {
      home: '/',
      science: '/science',
      about: '/about',
      contact: '/contact',
      privacy: '/privacy',
      terms: '/terms',
      signin: '/signin',
      signup: '/signup',
      'forgot-password': '/forgot-password',
      'verify-email': '/verify-email',
      onboarding: '/onboarding',
      dashboard: '/dashboard',
      goals: '/goals',
      'goals-history': '/goals/history',
      achievements: '/achievements',
      reports: '/reports',
      profile: '/profile',
      settings: '/settings',
      analytics: '/analytics',
      notifications: '/notifications',
    };

    if (!publicPages.has(page) && !localStorage.getItem('auth_token')) {
      navigate('/signin', { replace: true, state: { fromProtected: true } });
      return;
    }

    navigate(map[page] || '/');
  };

  const handleAuthSuccess = (isNew?: boolean) => {
    void loadThemePreference();
    if (isNew) navigate('/onboarding');
    else navigate('/dashboard');
  };

  const handleOnboardingComplete = () => {
    navigate('/dashboard');
  };

  const path = location.pathname;
  const isSpecialPage = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/verify-email',
    '/onboarding',
    '/dashboard',
    '/goals',
    '/goals/history',
    '/achievements',
    '/reports',
    '/profile',
    '/settings',
    '/analytics',
    '/notifications',
  ].includes(path);

  useEffect(() => {
    if (!publicPaths.has(location.pathname) && !localStorage.getItem('auth_token')) {
      navigate('/signin', { replace: true, state: { fromProtected: true } });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!publicPaths.has(location.pathname)) {
      const timeoutId = window.setTimeout(() => void loadThemePreference(), 0);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [loadThemePreference, location.pathname]);

  useEffect(() => {
    unlockNotificationSound();
  }, []);

  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isSpecialPage && (
        <Navigation
          currentPage={path === '/' ? 'home' : path.replace('/', '')}
          onNavigate={handleNavigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      <Routes>
        <Route path="/" element={(
          <>
            {theme === 'dark' ? <HeroSectionDark onNavigate={handleNavigate} /> : <HeroSection onNavigate={handleNavigate} />}
            <ProblemSolution />
            <Features />
            <Testimonials />
          </>
        )} />

        <Route path="/science" element={<SciencePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/signin" element={<SignInPage onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/signup" element={<SignUpPage onNavigate={handleNavigate} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={handleNavigate} />} />
        <Route path="/verify-email" element={<VerifyEmailPage onNavigate={handleNavigate} onContinue={() => handleAuthSuccess(true)} />} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingFlow onComplete={handleOnboardingComplete} onThemeChange={applyThemeAndSave} /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><StudentDashboard onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} /></RequireAuth>} />
        <Route path="/goals" element={<RequireAuth><GoalsPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} /></RequireAuth>} />
        <Route path="/goals/history" element={<RequireAuth><GoalsHistoryPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} /></RequireAuth>} />
        <Route path="/achievements" element={<RequireAuth><AchievementsScreen onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportsAnalytics onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfileScreen onNavigate={handleNavigate} onReplayOnboarding={() => { navigate('/onboarding'); }} /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsScreen onNavigate={handleNavigate} theme={theme} onThemeChange={applyTheme} /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsDashboard onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} /></RequireAuth>} />
        <Route path="*" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
      </Routes>

      {!isSpecialPage && <Footer onNavigate={handleNavigate} />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <FocusProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </FocusProvider>
  );
}

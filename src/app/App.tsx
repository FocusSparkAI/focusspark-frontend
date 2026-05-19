import { useState, useEffect, type ReactNode } from 'react';
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
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { OnboardingFlow } from '../pages/onboarding/OnboardingFlow';
import { StudentDashboard } from '../pages/dashboard/StudentDashboard';
import { AchievementsScreen } from '../pages/achievements/AchievementsScreen';
import { ReportsAnalytics } from '../pages/reports/ReportsAnalytics';
import { ProfileScreen } from '../pages/profile/ProfileScreen';
import { SettingsScreen } from '../pages/settings/SettingsScreen';
import { AnalyticsDashboard } from '../pages/analytics/AnalyticsDashboard';
import { Footer } from '../components/layout/Footer';
import { Toaster } from '../components/ui/sonner';
import { FocusProvider } from '../context/FocusContext';

function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/signin" replace state={{ fromProtected: true }} />;
  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('focusspark-theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    document.documentElement.classList.add('preload');
    const savedTheme = localStorage.getItem('focusspark-theme') as 'light' | 'dark' | null;
    const initialTheme: 'light' | 'dark' = savedTheme || 'light';
    applyTheme(initialTheme);
    setTimeout(() => document.documentElement.classList.remove('preload'), 100);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  };

  const handleNavigate = (page: string) => {
    const map: Record<string, string> = {
      home: '/',
      science: '/science',
      about: '/about',
      contact: '/contact',
      signin: '/signin',
      signup: '/signup',
      'forgot-password': '/forgot-password',
      onboarding: '/onboarding',
      dashboard: '/dashboard',
      achievements: '/achievements',
      reports: '/reports',
      profile: '/profile',
      settings: '/settings',
      analytics: '/analytics',
    };
    navigate(map[page] || '/');
  };

  const handleAuthSuccess = (isNew?: boolean) => {
    setIsAuthenticated(true);
    if (isNew) navigate('/onboarding');
    else navigate('/dashboard');
  };

  const handleOnboardingComplete = (skipTour?: boolean) => {
    setHasCompletedOnboarding(true);
    navigate('/dashboard');
  };

  const path = location.pathname;
  const isSpecialPage = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/onboarding',
    '/dashboard',
    '/achievements',
    '/reports',
    '/profile',
    '/settings',
    '/analytics',
  ].includes(path);

  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isSpecialPage && (
        <Navigation currentPage={path === '/' ? 'home' : path.replace('/', '')} onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
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
        <Route path="/signin" element={<SignInPage onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/signup" element={<SignUpPage onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={handleNavigate} />} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingFlow onComplete={handleOnboardingComplete} onThemeChange={applyTheme} /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><StudentDashboard onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} /></RequireAuth>} />
        <Route path="/achievements" element={<RequireAuth><AchievementsScreen onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportsAnalytics onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfileScreen onNavigate={handleNavigate} onReplayOnboarding={() => { setHasCompletedOnboarding(false); navigate('/onboarding'); }} /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsScreen onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsDashboard onNavigate={handleNavigate} /></RequireAuth>} />
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

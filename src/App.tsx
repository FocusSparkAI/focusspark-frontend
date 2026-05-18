import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { HeroSectionDark } from './components/HeroSectionDark';
import { ProblemSolution } from './components/ProblemSolution';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { SciencePage } from './components/SciencePage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { SignInPage } from './components/SignInPage';
import { SignUpPage } from './components/SignUpPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { StudentDashboard } from './components/StudentDashboard';
import { AchievementsScreen } from './components/AchievementsScreen';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { ProfileScreen } from './components/ProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { WebcamTestScreen } from './components/WebcamTestScreen';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ErrorHandlingDemo } from './components/ErrorHandlingDemo';
import { FocusModeEnvironment } from './components/FocusModeEnvironment';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { FocusProvider } from './context/FocusContext';
import { PomodoroProvider } from './context/PomodoroContext';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    document.documentElement.classList.add('preload');
    const savedTheme = localStorage.getItem('focusspark-theme') as 'light' | 'dark' | null;
    const initialTheme: 'light' | 'dark' = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    setTimeout(() => document.documentElement.classList.remove('preload'), 100);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('focusspark-theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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
      'webcam-test': '/webcam-test',
      developer: '/developer',
      analytics: '/analytics',
      'error-demo': '/error-demo',
      'focus-env': '/focus-env',
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

  // Pages that don't show nav and footer
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
    '/webcam-test',
    '/developer',
    '/analytics',
    '/error-demo',
    '/focus-env',
  ].includes(path);

  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [location.pathname]);

  function RequireAuth({ children }) {
    const token = localStorage.getItem('auth_token');
    if (!token) return <Navigate to="/signin" replace state={{ fromProtected: true }} />;
    return children;
  }

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
        <Route path="/onboarding" element={<RequireAuth><OnboardingFlow onComplete={handleOnboardingComplete} /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><StudentDashboard onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} /></RequireAuth>} />
        <Route path="/achievements" element={<RequireAuth><AchievementsScreen onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportsAnalytics onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfileScreen onNavigate={handleNavigate} onReplayOnboarding={() => { setHasCompletedOnboarding(false); navigate('/onboarding'); }} /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsScreen onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/webcam-test" element={<RequireAuth><WebcamTestScreen onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/developer" element={<RequireAuth><DeveloperDashboard onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsDashboard onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/error-demo" element={<RequireAuth><ErrorHandlingDemo onNavigate={handleNavigate} /></RequireAuth>} />
        <Route path="/focus-env" element={<RequireAuth><FocusModeEnvironment /></RequireAuth>} />
      </Routes>

      {!isSpecialPage && <Footer onNavigate={handleNavigate} />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <FocusProvider>
      <PomodoroProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PomodoroProvider>
    </FocusProvider>
  );
}

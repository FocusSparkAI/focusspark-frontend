import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Home,
  User,
  Clock,
  AlertCircle,
  Camera,
  Bell,
  Palette,
  Shield,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useFocus } from '../../hooks/useFocus';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';
import { DeleteAccountDialog } from '../../components/account/DeleteAccountDialog';
import { getErrorMessage } from '../../utils/apiTypes';
import { formatUserDateTime, setUserTimeZone } from '../../utils/timezone';

interface SettingsScreenProps {
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const categories = [
  { id: 'account', label: 'Account & Auth', icon: User },
  { id: 'ai', label: 'AI Defaults', icon: Bot },
  { id: 'pomodoro', label: 'Pomodoro & Session', icon: Clock },
  { id: 'focus', label: 'Focus Detection', icon: Camera },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
];

const themeOptions = [
  { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-black' },
  { value: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white' },
] as const;

type AIProvider = 'openai' | 'gemini';

const aiProviderOptions: Array<{ value: AIProvider; label: string; model: string }> = [
  { value: 'openai', label: 'ChatGPT', model: 'gpt-4.1' },
  { value: 'gemini', label: 'Gemini', model: 'gemini-2.5-flash' },
];

const aiDefaultModelByProvider: Record<AIProvider, string> = {
  openai: 'gpt-4.1',
  gemini: 'gemini-2.5-flash',
};

export function SettingsScreen({ onNavigate, theme, onThemeChange }: SettingsScreenProps) {
  const { isDetectionEnabled, setIsDetectionEnabled } = useFocus();
  const [draftDetectionEnabled, setDraftDetectionEnabled] = useState(isDetectionEnabled);
  const [activeCategory, setActiveCategory] = useState('account');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);

  // Account settings
  const [email, setEmail] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Pomodoro settings
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [savedPomodoroWork, setSavedPomodoroWork] = useState(25);
  const [savedPomodoroBreak, setSavedPomodoroBreak] = useState(5);

  // Notification settings
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // AI defaults
  const [preferredAiProvider, setPreferredAiProvider] = useState<AIProvider>('openai');
  const [preferredAiModel, setPreferredAiModel] = useState('gpt-4.1');

  const handleCategoryChange = (newCategory: string) => {
    const oldIndex = categories.findIndex((c) => c.id === activeCategory);
    const newIndex = categories.findIndex((c) => c.id === newCategory);
    setSlideDirection(newIndex > oldIndex ? 'right' : 'left');
    setActiveCategory(newCategory);
  };

  const authHeaders = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Not authenticated');
      onNavigate('signin');
      return null;
    }

    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    axios
      .get(buildBackendUrl(BACKEND_ROUTES.profile.get), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data;
        setUserTimeZone(data?.timezone);
        setEmail(data?.email ?? '');
        const rawLastLogin =
          data?.last_login ??
          data?.lastLogin ??
          data?.previous_login ??
          data?.previousLogin ??
          data?.last_login_at ??
          data?.lastLoginAt;
        setLastLogin(rawLastLogin ? formatUserDateTime(String(rawLastLogin)) : '');
      })
      .catch(() => {
        toast.error('Failed to load account settings');
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    axios
      .get(buildBackendUrl(BACKEND_ROUTES.study.settings.get), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data ?? {};
        const savedTheme =
          data?.appearance?.theme ??
          (typeof data?.dark_mode === 'boolean'
            ? data.dark_mode
              ? 'dark'
              : 'light'
            : null);

        if (savedTheme === 'light' || savedTheme === 'dark') {
          onThemeChange(savedTheme);
        }

        const savedWorkMinutes = Number(data?.pomodoro_duration_minutes);
        const savedBreakMinutes = Number(data?.break_duration_minutes);
        if (Number.isFinite(savedWorkMinutes) && savedWorkMinutes > 0) {
          setPomodoroWork(savedWorkMinutes);
          setSavedPomodoroWork(savedWorkMinutes);
        }
        if (Number.isFinite(savedBreakMinutes) && savedBreakMinutes > 0) {
          setPomodoroBreak(savedBreakMinutes);
          setSavedPomodoroBreak(savedBreakMinutes);
        }

        if (typeof data?.focus_alerts_enabled === 'boolean') {
          setIsDetectionEnabled(data.focus_alerts_enabled);
          setDraftDetectionEnabled(data.focus_alerts_enabled);
        }
        if (typeof data?.notifications_enabled === 'boolean') {
          setDesktopNotifications(data.notifications_enabled);
        }
        if (data?.preferred_ai_provider === 'openai' || data?.preferred_ai_provider === 'gemini') {
          setPreferredAiProvider(data.preferred_ai_provider);
        }
        if (data?.preferred_ai_provider === 'openai' || data?.preferred_ai_provider === 'gemini') {
          setPreferredAiModel(aiDefaultModelByProvider[data.preferred_ai_provider]);
        } else if (typeof data?.preferred_ai_model === 'string' && data.preferred_ai_model.trim()) {
          setPreferredAiModel(data.preferred_ai_model);
        }
        setSoundEnabled(data?.accessibility?.notification_sound !== false);
        const savedPomodoro = data?.pomodoro ?? data?.integrations?.pomodoro;
        if (savedPomodoro) {
          const workMinutes = Number(savedPomodoro.work_minutes ?? savedPomodoro.workMinutes);
          const breakMinutes = Number(savedPomodoro.break_minutes ?? savedPomodoro.breakMinutes);

          if (Number.isFinite(workMinutes) && workMinutes > 0) {
            setPomodoroWork(workMinutes);
            setSavedPomodoroWork(workMinutes);
          }
          if (Number.isFinite(breakMinutes) && breakMinutes > 0) {
            setPomodoroBreak(breakMinutes);
            setSavedPomodoroBreak(breakMinutes);
          }
        }
      })
      .catch(() => {
        // Keep the locally selected theme if backend settings are unavailable.
      });
  }, [onThemeChange, setIsDetectionEnabled]);

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Fill all password fields');
      return;
    }

    const headers = authHeaders();
    if (!headers) return;

    try {
      await axios.patch(
        buildBackendUrl(BACKEND_ROUTES.auth.changePassword),
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        { headers },
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update password'));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
      return;
    }

    const headers = authHeaders();
    if (!headers) return;

    try {
      await axios.delete(buildBackendUrl(BACKEND_ROUTES.profile.delete), { headers });
      localStorage.clear();
      setShowDeleteAccountDialog(false);
      setDeleteConfirmStep(1);
      toast.success('Account deleted successfully.');
      onNavigate('home');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete account'));
    }
  };

  const handleThemeChange = async (nextTheme: 'light' | 'dark') => {
    onThemeChange(nextTheme);

    const headers = authHeaders();
    if (!headers) return;

    try {
      await axios.put(
        buildBackendUrl(BACKEND_ROUTES.study.settings.update),
        {
          dark_mode: nextTheme === 'dark',
          appearance: { theme: nextTheme },
        },
        { headers },
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save theme preference'));
    }
  };

  const handleSavePomodoroSettings = async () => {
    if (!Number.isFinite(pomodoroWork) || pomodoroWork < 1 || pomodoroWork > 180) {
      toast.error('Work duration must be between 1 and 180 minutes');
      return;
    }

    if (!Number.isFinite(pomodoroBreak) || pomodoroBreak < 1 || pomodoroBreak > 60) {
      toast.error('Break duration must be between 1 and 60 minutes');
      return;
    }

    const headers = authHeaders();
    if (!headers) return;

    try {
      await axios.put(
        buildBackendUrl(BACKEND_ROUTES.study.settings.update),
        {
          pomodoro_duration_minutes: pomodoroWork,
          break_duration_minutes: pomodoroBreak,
        },
        { headers },
      );
      setSavedPomodoroWork(pomodoroWork);
      setSavedPomodoroBreak(pomodoroBreak);
      toast.success('Pomodoro timings saved.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save Pomodoro settings'));
    }
  };

  const handleSaveFocusSettings = async () => {
    const headers = authHeaders();
    if (!headers) return;

    try {
      await axios.put(
        buildBackendUrl(BACKEND_ROUTES.study.settings.update),
        {
          focus_alerts_enabled: draftDetectionEnabled,
        },
        { headers },
      );
      setIsDetectionEnabled(draftDetectionEnabled);
      toast.success('Focus detection settings saved.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save focus settings'));
    }
  };

  const handleAiProviderChange = (provider: AIProvider) => {
    setPreferredAiProvider(provider);
    setPreferredAiModel(aiDefaultModelByProvider[provider]);
  };

  const handleSaveAiSettings = async () => {
    const headers = authHeaders();
    if (!headers) return;

    const model = preferredAiModel.trim();
    if (!model) {
      toast.error('Choose or enter a model name.');
      return;
    }

    try {
      await axios.put(
        buildBackendUrl(BACKEND_ROUTES.study.settings.update),
        {
          preferred_ai_provider: preferredAiProvider,
          preferred_ai_model: model,
        },
        { headers },
      );
      toast.success('AI defaults saved.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save AI defaults'));
    }
  };

  const handleSaveNotificationSettings = async () => {
    const headers = authHeaders();
    if (!headers) return;

    try {
      await axios.put(
        buildBackendUrl(BACKEND_ROUTES.study.settings.update),
        {
          notifications_enabled: desktopNotifications,
          accessibility: {
            notification_sound: soundEnabled,
          },
        },
        { headers },
      );
      toast.success('Notification settings saved.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save notification settings'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-10">
          <div
            className="flex min-h-16 w-full flex-col items-start gap-3 sm:block"
            style={{ position: 'relative', paddingRight: 160 }}
          >
            <div className="flex min-w-0 items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('dashboard')}
                className="hover:bg-accent"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="gradient-text">Settings</h1>
                <p className="max-w-xl text-sm text-secondary">Customize your FocusSpark experience</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate('profile')}
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-24 shadow-sm">
              <CardContent className="p-4 space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-500'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-secondary'}`} />
                      <span className={`text-sm ${isActive ? '' : 'text-secondary'}`}>
                        {category.label}
                      </span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Settings Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: slideDirection === 'right' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection === 'right' ? -50 : 50 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Account & Auth */}
                {activeCategory === 'account' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Account & Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          className="mt-2"
                          readOnly
                          disabled
                        />
                      </div>

                      <div>
                        <h3 className="mb-3">Change Password</h3>
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              autoComplete="off"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              autoComplete="new-password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              autoComplete="new-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Button onClick={handleSavePassword}>Update</Button>
                        </div>
                      </div>

                      {lastLogin && (
                        <>
                          <Separator />

                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <p className="text-sm text-secondary">
                              <strong>Last Login:</strong> {lastLogin}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* AI Defaults */}
                {activeCategory === 'ai' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-cyan-400" />
                        AI Defaults
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div>
                          <Label>Default Provider</Label>
                          <Select value={preferredAiProvider} onValueChange={(value) => handleAiProviderChange(value as AIProvider)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {aiProviderOptions.map((provider) => (
                                <SelectItem key={provider.value} value={provider.value}>
                                  {provider.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="inline-flex max-w-fit items-center gap-2.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-secondary">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-500 dark:bg-cyan-400/15 dark:text-cyan-300">
                          <Bot className="h-4 w-4" />
                        </span>
                        <span>
                          Used for <span className="text-cyan-600 dark:text-cyan-300">quiz and flashcard</span> generation.
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveAiSettings}>
                          Save AI defaults
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pomodoro & Session */}
                {activeCategory === 'pomodoro' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        Pomodoro & Session Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                          <Input
                            id="work-duration"
                            type="number"
                            min={1}
                            max={180}
                            value={pomodoroWork}
                            onChange={(e) => setPomodoroWork(Number(e.target.value))}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                          <Input
                            id="break-duration"
                            type="number"
                            min={1}
                            max={60}
                            value={pomodoroBreak}
                            onChange={(e) => setPomodoroBreak(Number(e.target.value))}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSavePomodoroSettings}>
                          Save timings
                        </Button>
                      </div>

                      <Separator />

                      {/* Timer Preview */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 sm:p-6">
                        <p className="text-sm text-secondary mb-3">Preview:</p>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center mb-2">
                              <p className="gradient-text">{savedPomodoroWork}</p>
                            </div>
                            <p className="text-xs text-secondary">Work</p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-secondary" />
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center mb-2">
                              <p className="gradient-text">{savedPomodoroBreak}</p>
                            </div>
                            <p className="text-xs text-secondary">Break</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Focus Detection */}
                {activeCategory === 'focus' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-green-400" />
                        Focus Detection Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <Label>Enable Camera-based Focus Detection</Label>
                          <p className="text-xs text-secondary">
                            Use webcam to detect attention and focus in real-time
                          </p>
                        </div>
                        <Switch className="shrink-0" checked={draftDetectionEnabled} onCheckedChange={setDraftDetectionEnabled} />
                      </div>

                      <Separator />

                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-sm flex items-start gap-2">
                          <Shield className="w-4 h-4 mt-0.5 text-green-400" />
                          <span>
                            <strong>Privacy Notice:</strong> All detection runs locally on your device. No video data is stored or transmitted.
                          </span>
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveFocusSettings}>
                          Save focus settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications */}
                {activeCategory === 'notifications' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <Label>Extension Notifications</Label>
                          <p className="text-xs text-secondary">
                            Show reminders and alerts inside the FocusSpark extension
                          </p>
                        </div>
                        <Switch
                          className="shrink-0"
                          checked={desktopNotifications}
                          onCheckedChange={setDesktopNotifications}
                        />
                      </div>

                      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <Label>Sound Enabled</Label>
                          <p className="text-xs text-secondary">
                            Play audio alerts for notifications
                          </p>
                        </div>
                        <Switch className="shrink-0" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveNotificationSettings}>
                          Save notification settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Appearance */}
                {activeCategory === 'appearance' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-pink-400" />
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label>Theme</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          {themeOptions.map((option) => {
                            const isSelected = theme === option.value;

                            return (
                              <motion.button
                                key={option.value}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => handleThemeChange(option.value)}
                                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                                    : 'border-border hover:border-blue-500/50'
                                }`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <div className={`w-full h-24 rounded-xl mb-3 ${option.bg} ${option.text} flex items-center justify-center`}>
                                  Aa
                                </div>
                                <p className="text-sm">{option.label}</p>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Privacy & Data */}
                {activeCategory === 'privacy' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Privacy & Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Button
                        variant="outline"
                        className="w-full border-red-500/50 hover:bg-red-500/10 text-red-400"
                        onClick={() => setShowDeleteAccountDialog(true)}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>

                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <p className="text-xs text-secondary">
                          <strong>Note:</strong> Deleting your account removes all stored data permanently. This action cannot be undone.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        open={showDeleteAccountDialog}
        step={deleteConfirmStep}
        onOpenChange={setShowDeleteAccountDialog}
        onStepChange={setDeleteConfirmStep}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}

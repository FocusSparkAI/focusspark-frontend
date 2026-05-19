import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import {
  Home,
  User,
  Clock,
  Camera,
  Bell,
  Plug,
  Palette,
  Shield,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFocus } from '../../context/FocusContext';

interface SettingsScreenProps {
  onNavigate: (page: string) => void;
}

const categories = [
  { id: 'account', label: 'Account & Auth', icon: User },
  { id: 'pomodoro', label: 'Pomodoro & Session', icon: Clock },
  { id: 'focus', label: 'Focus Detection', icon: Camera },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
];

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { isDetectionEnabled, setIsDetectionEnabled } = useFocus();
  const [activeCategory, setActiveCategory] = useState('account');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Account settings
  const [email, setEmail] = useState('alex.chen@example.com');
  const [lastLogin, setLastLogin] = useState('October 18, 2025 at 2:30 PM');
  const [googleLinked, setGoogleLinked] = useState(true);

  // Pomodoro settings
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [autoStartNext, setAutoStartNext] = useState(true);
  const [skipBreaks, setSkipBreaks] = useState(false);
  const [reviewOnFinish, setReviewOnFinish] = useState(true);

  // Focus Detection settings - using context for camera enablement
  const [focusSensitivity, setFocusSensitivity] = useState(50);
  const [fallbackMethod, setFallbackMethod] = useState('prompts');

  // Notification settings
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(30);

  // Integration settings
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Appearance settings
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const handleCategoryChange = (newCategory: string) => {
    const oldIndex = categories.findIndex((c) => c.id === activeCategory);
    const newIndex = categories.findIndex((c) => c.id === newCategory);
    setSlideDirection(newIndex > oldIndex ? 'right' : 'left');
    setActiveCategory(newCategory);
  };

  const handleSavePassword = () => {
    toast.success('✅ Password updated successfully!');
  };

  const handleConnectGoogle = () => {
    toast.success('🔗 Connecting to Google Drive...');
    setTimeout(() => {
      setGoogleDriveConnected(true);
      toast.success('✅ Google Drive connected!');
    }, 1500);
  };

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
                <h1 className="gradient-text">Settings</h1>
                <p className="text-sm text-secondary">Customize your FocusSpark experience</p>
              </div>
            </div>

            <Button variant="outline" onClick={() => onNavigate('profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">Change Password</Label>
                        <div className="flex gap-2 mt-2">
                          <Input id="password" type="password" placeholder="New password" />
                          <Button onClick={handleSavePassword}>Update</Button>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-3">Linked Logins</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm">Google</p>
                                <p className="text-xs text-secondary">
                                  {googleLinked ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <Badge variant={googleLinked ? 'default' : 'secondary'}>
                              {googleLinked ? 'Linked' : 'Unlinked'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-secondary">
                          <strong>Last Login:</strong> {lastLogin}
                        </p>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                          <Input
                            id="work-duration"
                            type="number"
                            value={pomodoroWork}
                            onChange={(e) => setPomodoroWork(parseInt(e.target.value))}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                          <Input
                            id="break-duration"
                            type="number"
                            value={pomodoroBreak}
                            onChange={(e) => setPomodoroBreak(parseInt(e.target.value))}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-start Next Session</Label>
                            <p className="text-xs text-secondary">
                              Automatically begin the next Pomodoro after break
                            </p>
                          </div>
                          <Switch checked={autoStartNext} onCheckedChange={setAutoStartNext} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Skip Breaks</Label>
                            <p className="text-xs text-secondary">
                              Go straight to next work session
                            </p>
                          </div>
                          <Switch checked={skipBreaks} onCheckedChange={setSkipBreaks} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Review on Finish</Label>
                            <p className="text-xs text-secondary">
                              Review your focus summary after each session
                            </p>
                          </div>
                          <Switch checked={reviewOnFinish} onCheckedChange={setReviewOnFinish} />
                        </div>
                      </div>

                      <Separator />

                      {/* Timer Preview */}
                      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                        <p className="text-sm text-secondary mb-3">Preview:</p>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center mb-2">
                              <p className="gradient-text">{pomodoroWork}</p>
                            </div>
                            <p className="text-xs text-secondary">Work</p>
                          </div>
                          <ChevronRight className="w-6 h-6 text-secondary" />
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center mb-2">
                              <p className="gradient-text">{pomodoroBreak}</p>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Camera-based Focus Detection</Label>
                          <p className="text-xs text-secondary">
                            Use webcam to detect attention and focus in real-time
                          </p>
                        </div>
                        <Switch checked={isDetectionEnabled} onCheckedChange={(checked) => {
                          setIsDetectionEnabled(checked);
                          toast.success(checked ? 'Focus Detection enabled' : 'Focus Detection disabled');
                        }} />
                      </div>

                      {isDetectionEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          <div>
                            <Label>Detection Sensitivity</Label>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-secondary">Gentle</span>
                              <Slider
                                value={[focusSensitivity]}
                                onValueChange={(v) => setFocusSensitivity(v[0])}
                                max={100}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-xs text-secondary">Aggressive</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {!isDetectionEnabled && (
                        <div>
                          <Label htmlFor="fallback">Fallback Method</Label>
                          <Select value={fallbackMethod} onValueChange={setFallbackMethod}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prompts">Feedback Prompts</SelectItem>
                              <SelectItem value="timer">Timer-based</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Separator />

                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-sm flex items-start gap-2">
                          <Shield className="w-4 h-4 mt-0.5 text-green-400" />
                          <span>
                            <strong>Privacy Notice:</strong> All detection runs locally on your device. No video data is stored or transmitted.
                          </span>
                        </p>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Desktop Notifications</Label>
                          <p className="text-xs text-secondary">
                            Show system notifications for focus alerts
                          </p>
                        </div>
                        <Switch
                          checked={desktopNotifications}
                          onCheckedChange={setDesktopNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Sound Enabled</Label>
                          <p className="text-xs text-secondary">
                            Play audio alerts for notifications
                          </p>
                        </div>
                        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="reminder-interval">Refocus Reminder Interval (minutes)</Label>
                        <Input
                          id="reminder-interval"
                          type="number"
                          value={reminderInterval}
                          onChange={(e) => setReminderInterval(parseInt(e.target.value))}
                          className="mt-2 w-32"
                        />
                        <p className="text-xs text-secondary mt-2">
                          Example: Remind me every {reminderInterval} minutes to refocus
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => toast('🔔 Test notification sent!')}
                      >
                        Preview Notification
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Integrations */}
                {activeCategory === 'integrations' && (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plug className="w-5 h-5 text-blue-400" />
                        Integrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                              <span className="text-xl">📁</span>
                            </div>
                            <div>
                              <p>Google Drive</p>
                              <p className="text-xs text-secondary">
                                {googleDriveConnected ? 'Connected' : 'Not connected'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={googleDriveConnected ? 'outline' : 'default'}
                            onClick={handleConnectGoogle}
                            disabled={googleDriveConnected}
                          >
                            {googleDriveConnected ? (
                              <>
                                <Check className="w-4 h-4 mr-2 text-green-400" />
                                Connected
                              </>
                            ) : (
                              'Connect'
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-xl">📅</span>
                            </div>
                            <div>
                              <p>Google Calendar</p>
                              <p className="text-xs text-secondary">
                                {calendarConnected ? 'Connected' : 'Not connected'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={calendarConnected ? 'outline' : 'default'}
                            onClick={() => {
                              setCalendarConnected(true);
                              toast.success('✅ Calendar connected!');
                            }}
                            disabled={calendarConnected}
                          >
                            {calendarConnected ? (
                              <>
                                <Check className="w-4 h-4 mr-2 text-green-400" />
                                Connected
                              </>
                            ) : (
                              'Connect'
                            )}
                          </Button>
                        </div>
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
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
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
                        onClick={() => onNavigate('profile')}
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
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Home,
  User,
  Edit2,
  Check,
  X,
  PlayCircle,
  Trash2,
  Download,
  AlertTriangle,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { BACKEND_ROUTES, buildBackendUrl } from '../../config/backend';

interface ProfileScreenProps {
  onNavigate: (page: string) => void;
  onReplayOnboarding?: () => void;
}

const academicFocusOptions = [
  'Computer Science',
  'Medicine',
  'Engineering',
  'Business',
  'Law',
  'Psychology',
  'Biology',
  'Mathematics',
  'Physics',
  'Other',
];

const resolveAssetUrl = (url: string) => {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return buildBackendUrl(url);
};

export function ProfileScreen({ onNavigate, onReplayOnboarding }: ProfileScreenProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);

  // User data
  const [name, setName] = useState('');
  const [tempName, setTempName] = useState('');
  const [academicFocus, setAcademicFocus] = useState('');
  const [bio, setBio] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const updateProfile = async (updates: Record<string, string>) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Not authenticated');
      onNavigate('signin');
      return false;
    }

    try {
      const url = buildBackendUrl(BACKEND_ROUTES.profile.update);
      await axios.patch(url, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update profile';
      toast.error(message);
      return false;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsProfileLoading(false);
        toast.error('Not authenticated');
        onNavigate('signin');
        return;
      }

      try {
        const url = buildBackendUrl(BACKEND_ROUTES.profile.get);
        const resp = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = resp?.data;
        if (data) {
          setName(data.full_name ?? data.fullName ?? data.name ?? '');
          setTempName(data.full_name ?? data.fullName ?? data.name ?? '');
          setAcademicFocus(data.academic_focus ?? data.academicFocus ?? '');
          setBio(data.bio ?? '');
          setTempBio(data.bio ?? '');
          setAvatarUrl(resolveAssetUrl(data.avatar_url ?? data.avatarUrl ?? ''));
        }
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load profile';
        toast.error(message);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [onNavigate]);

  const handleSaveName = async () => {
    const saved = await updateProfile({ full_name: tempName });
    if (!saved) return;

    setName(tempName);
    setIsEditingName(false);
    toast.success('Name updated successfully.');
  };

  const handleSaveBio = async () => {
    const saved = await updateProfile({ bio: tempBio });
    if (!saved) return;

    setBio(tempBio);
    setIsEditingBio(false);
    toast.success('Bio updated successfully.');
  };

  const handleAcademicFocusChange = async (value: string) => {
    const previousAcademicFocus = academicFocus;
    setAcademicFocus(value);

    const saved = await updateProfile({ academic_focus: value });
    if (saved) {
      toast.success('Academic focus updated.');
    } else {
      setAcademicFocus(previousAcademicFocus);
    }
  };

  const handleReplayOnboarding = () => {
    toast.success('Starting onboarding tour...');
    setTimeout(() => {
      if (onReplayOnboarding) {
        onReplayOnboarding();
      } else {
        onNavigate('onboarding');
      }
    }, 500);
  };

  const handleClearData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Not authenticated');
      setShowClearDataDialog(false);
      onNavigate('signin');
      return;
    }

    try {
      await axios.delete(buildBackendUrl(BACKEND_ROUTES.study.clearData), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowClearDataDialog(false);
      toast.success('Account data cleared successfully.');
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to clear account data';
      toast.error(message);
    }
  };

  const handleExportData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Not authenticated');
      onNavigate('signin');
      return;
    }

    try {
      const response = await axios.get(buildBackendUrl(`${BACKEND_ROUTES.study.export}?format=json`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'focusspark-account-data.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Account data export ready.');
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to export account data';
      toast.error(message);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
      return;
    }

    // proceed with delete
    const doDelete = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Not authenticated');
        setShowDeleteAccountDialog(false);
        onNavigate('signin');
        return;
      }

      try {
        const url = buildBackendUrl(BACKEND_ROUTES.profile.delete);
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });

        localStorage.removeItem('auth_token');
        toast.success('Account deleted. Redirecting to homepage...');
        setShowDeleteAccountDialog(false);
        setDeleteConfirmStep(1);
        setTimeout(() => onNavigate('home'), 1200);
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Delete failed';
        toast.error(message);
      }
    };

    doDelete();
  };

  const handleAvatarUpload = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Not authenticated');
      onNavigate('signin');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(buildBackendUrl(BACKEND_ROUTES.profile.avatar), formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nextAvatarUrl = response.data?.avatar_url ?? response.data?.avatarUrl ?? '';
        setAvatarUrl(resolveAssetUrl(nextAvatarUrl));
        toast.success('Profile picture updated.');
      } catch (err: any) {
        const message = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to upload avatar';
        toast.error(message);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
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
                <h1 className="gradient-text">My Profile</h1>
                <p className="text-sm text-secondary">
                  Keep your account details and study preferences up to date.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate('settings')}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-500/30 ring-offset-4 ring-offset-background">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarUpload}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-secondary mb-1">Profile Picture</p>
                  <p className="text-xs text-secondary">
                    Upload a new profile picture.
                  </p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm text-secondary mb-2 block">Full Name</label>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="icon" onClick={handleSaveName} className="bg-green-500 hover:bg-green-600">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setTempName(name);
                        setIsEditingName(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="flex-1">{name}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setTempName(name);
                        setIsEditingName(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Academic Focus */}
              <div>
                <label className="text-sm text-secondary mb-2 block">Academic Focus</label>
                <Select value={academicFocus} onValueChange={handleAcademicFocusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {academicFocusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm text-secondary mb-2 block">Bio</label>
                {isEditingBio ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      rows={4}
                      className="resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={handleSaveBio} className="bg-green-500 hover:bg-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTempBio(bio);
                          setIsEditingBio(false);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-16 p-4 pr-12 rounded-lg border border-border bg-input-background dark:bg-muted/60 cursor-pointer hover:bg-muted transition-colors relative group"
                    onClick={() => {
                      setTempBio(bio);
                      setIsEditingBio(true);
                    }}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${bio ? '' : 'text-secondary'}`}>
                      {bio || 'Add a short bio'}
                    </p>
                    <Edit2 className="w-4 h-4 absolute top-1/2 right-4 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between"
                style={{ minHeight: 64, padding: '12px 16px' }}
                onClick={handleReplayOnboarding}
              >
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p>Replay Onboarding Tour</p>
                    <p className="text-xs text-secondary">Guided walkthrough of FocusSpark features</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-secondary" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                style={{ minHeight: 64, padding: '12px 16px' }}
                onClick={handleExportData}
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <p>Export Account Data</p>
                    <p className="text-xs text-secondary">Download your data as CSV or JSON</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-secondary" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                style={{ minHeight: 64, padding: '12px 16px' }}
                onClick={() => setShowClearDataDialog(true)}
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-yellow-400" />
                  <div className="text-left">
                    <p>Clear Account Data</p>
                    <p className="text-xs text-secondary">Remove study history, chats, quizzes, and flashcards</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-secondary" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between border-red-500/50 hover:bg-red-500/10 text-red-400"
                style={{ minHeight: 64, padding: '12px 16px' }}
                onClick={() => {
                  setDeleteConfirmStep(1);
                  setShowDeleteAccountDialog(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="text-left">
                    <p>Delete Account</p>
                    <p className="text-xs text-secondary">Permanently remove your account and data</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Clear Account Data?</DialogTitle>
            <DialogDescription>
              This will remove your study history, goals, notifications, achievements, chats, quizzes, flashcards, and uploaded documents. Your account and profile will remain active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDataDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearData} className="bg-yellow-500 hover:bg-yellow-600">
              Clear Account Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="bg-card border-2 border-red-500/30">
          <motion.div
            animate={deleteConfirmStep === 2 ? { x: [0, -5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {deleteConfirmStep === 1 ? 'Delete Account?' : 'Are you absolutely sure?'}
              </DialogTitle>
              <DialogDescription>
                {deleteConfirmStep === 1 ? (
                  <>
                    Deleting your account will permanently remove all stored data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All focus session history</li>
                      <li>Reports and progress data</li>
                      <li>Achievements and badges</li>
                      <li>Focus session records</li>
                      <li>AI chat history</li>
                    </ul>
                    <p className="mt-3 font-semibold text-red-400">This action cannot be undone.</p>
                  </>
                ) : (
                  <p className="text-red-400 font-semibold">
                    This is your final confirmation. All your data will be permanently deleted. There is no way to recover it.
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteAccountDialog(false);
                  setDeleteConfirmStep(1);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteConfirmStep === 1 ? 'Continue' : 'Delete Forever'}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Settings Section - Complete Account Management
// ============================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  User,
  Moon,
  Sun,
  LogOut,
  Bell,
  BookOpen,
  Target,
  Save,
  Camera,
  Lock,
  Shield,
  X,
  Check,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import { useTheme, ACCENT_PRESETS, VISUAL_THEMES } from '@/hooks/useTheme';
import { EduNotifications } from '@/lib/notifications';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { usePwa } from '@/context/PwaContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  role: string;
  institution: string;
  bio: string;
  preferences: {
    theme: string;
    emailNotifications: boolean;
    attendanceReminder: boolean;
    studyReminder: boolean;
    assignmentReminder: boolean;
  };
  attendanceGoal: number;
  theme: string;
  notifications: {
    attendanceReminder: boolean;
    studyReminder: boolean;
    assignmentReminder: boolean;
  };
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
}

interface StorageInfo {
  subjects: number;
  attendance: number;
  materials: number;
}

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme: _theme, setTheme, accentHue, setAccentHue, visualTheme, setVisualTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    profilePhoto: '',
    role: 'student',
    institution: '',
    bio: '',
    preferences: {
      theme: 'system',
      emailNotifications: true,
      attendanceReminder: true,
      studyReminder: true,
      assignmentReminder: true
    },
    attendanceGoal: 75,
    theme: 'system',
    notifications: {
      attendanceReminder: true,
      studyReminder: true,
      assignmentReminder: true
    },
    emailVerified: false,
    lastLogin: '',
    createdAt: ''
  });

  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    subjects: 0,
    attendance: 0,
    materials: 0
  });

  useEffect(() => {
    loadProfile();
    loadStorageInfo();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.get<UserProfile>('/users/me');
      setProfile({
        id: data.id,
        name: data.name,
        email: data.email,
        profilePhoto: data.profilePhoto || '',
        role: data.role || 'student',
        institution: data.institution || '',
        bio: data.bio || '',
        preferences: data.preferences || {
          theme: 'system',
          emailNotifications: true,
          attendanceReminder: true,
          studyReminder: true,
          assignmentReminder: true
        },
        attendanceGoal: data.attendanceGoal || 75,
        theme: data.theme || 'system',
        notifications: data.notifications || {
          attendanceReminder: true,
          studyReminder: true,
          assignmentReminder: true
        },
        emailVerified: data.emailVerified || false,
        lastLogin: data.lastLogin || '',
        createdAt: data.createdAt || ''
      });
      setEditedName(data.name);
      setEditedBio(data.bio || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const data = await api.get<StorageInfo>('/settings/storage');
      setStorageInfo(data);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleSaveName = async () => {
    const name = editedName.trim();
    if (!name) return;

    setIsSaving(true);
    try {
      await api.put('/users/update', { name });
      setProfile(prev => ({ ...prev, name }));
      setIsEditingName(false);
      toast.success('Name updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBio = async () => {
    const bio = editedBio.trim();
    setIsSaving(true);
    try {
      await api.put('/users/update', { bio });
      setProfile(prev => ({ ...prev, bio }));
      setIsEditingBio(false);
      toast.success('Bio updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update bio');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setIsPhotoPreviewOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoPreview) return;
    setIsSaving(true);
    try {
      await api.put('/users/update', { profilePhoto: photoPreview });
      setProfile(prev => ({ ...prev, profilePhoto: photoPreview }));
      setIsPhotoPreviewOpen(false);
      setPhotoPreview('');
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsSaving(true);
    try {
      await api.put('/users/update', { profilePhoto: '' });
      setProfile(prev => ({ ...prev, profilePhoto: '' }));
      setIsPhotoPreviewOpen(false);
      setPhotoPreview('');
      toast.success('Profile photo removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setIsSaving(true);
    try {
      await api.put('/users/preferences', { theme: newTheme });
      setProfile(prev => ({ ...prev, theme: newTheme, preferences: { ...prev.preferences, theme: newTheme } }));
      setTheme(newTheme as 'light' | 'dark' | 'system');
      toast.success('Theme updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update theme');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAttendanceGoalChange = async (goal: number) => {
    setIsSaving(true);
    try {
      await api.put('/users/preferences', { attendanceGoal: goal });
      setProfile(prev => ({ ...prev, attendanceGoal: goal }));
      toast.success('Attendance goal updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof UserProfile['notifications'], value: boolean) => {
    const newNotifications = { ...profile.notifications, [key]: value };
    setProfile(prev => ({ ...prev, notifications: newNotifications }));

    setIsSaving(true);
    try {
      await api.put('/users/preferences', { notifications: newNotifications });
      toast.success('Notification settings updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notifications');
      setProfile(prev => ({ ...prev, notifications: prev.notifications }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await api.get<any>('/import-export/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edutracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      await api.post('/import-export/import', data);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadStorageInfo();
      toast.success('Data imported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await api.delete('/settings/clear');
      loadStorageInfo();
      toast.success('All data cleared successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and account
        </p>
      </div>


      {/* SECTION 1: Profile Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div>
              <p className="font-medium">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
                Change Photo
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label>Full Name</Label>
            {isEditingName ? (
              <div className="flex gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Your name"
                />
                <Button onClick={handleSaveName} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setEditedName(profile.name); setIsEditingName(false); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input value={profile.name} disabled />
                <Button onClick={() => setIsEditingName(true)}>Edit</Button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <div className="flex gap-2">
              <Input value={profile.email} disabled className="flex-1" />
              <Button onClick={() => setIsChangeEmailOpen(true)} variant="outline">
                Change Email
              </Button>
            </div>
          </div>

          {/* Bio */}
          <div className="grid gap-2">
            <Label>Bio</Label>
            {isEditingBio ? (
              <div className="flex gap-2">
                <Input
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
                <Button onClick={handleSaveBio} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setEditedBio(profile.bio); setIsEditingBio(false); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input value={profile.bio || 'No bio yet'} disabled />
                <Button onClick={() => setIsEditingBio(true)}>Edit</Button>
              </div>
            )}
          </div>

          {/* Institution */}
          <div className="grid gap-2">
            <Label>Institution</Label>
            <Input value={profile.institution || ''} placeholder="Your school or university" disabled />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 6: Security */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setIsChangePasswordOpen(true)} variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* SECTION 3: Academic Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Academic Settings
          </CardTitle>
          <CardDescription>
            Configure your academic preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="attendance-goal">Attendance Goal (%)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="attendance-goal"
                type="number"
                min={0}
                max={100}
                value={profile.attendanceGoal}
                onChange={(e) => setProfile(prev => ({ ...prev, attendanceGoal: parseInt(e.target.value) || 75 }))}
                className="w-32"
              />
              <Button
                onClick={() => handleAttendanceGoalChange(profile.attendanceGoal)}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts even when the tab is in the background</p>
            </div>
            <Switch
              checked={EduNotifications.isEnabled()}
              onCheckedChange={async (checked) => {
                if (checked) {
                  const granted = await EduNotifications.requestPermission();
                  if (granted) {
                    toast.success('Browser notifications enabled!');
                    EduNotifications.send('🎉 Notifications Enabled', { body: 'You\'ll now receive study reminders and alerts.' });
                  } else {
                    toast.error('Notification permission denied. Please enable it in your browser settings.');
                  }
                }
              }}
            />
          </div>
          <div className="border-t border-border pt-4" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Attendance Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded about attendance tracking</p>
            </div>
            <Switch
              checked={profile.notifications.attendanceReminder}
              onCheckedChange={(checked) => handleNotificationChange('attendanceReminder', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Study Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded to study</p>
            </div>
            <Switch
              checked={profile.notifications.studyReminder}
              onCheckedChange={(checked) => handleNotificationChange('studyReminder', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Assignment Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded about assignments</p>
            </div>
            <Switch
              checked={profile.notifications.assignmentReminder}
              onCheckedChange={(checked) => handleNotificationChange('assignmentReminder', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {profile.theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the app looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={_theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <Moon className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 mt-4">
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setAccentHue(preset.hue)}
                  className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${accentHue === preset.hue ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-current' : 'border-transparent'
                    }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
            
            <div className="flex flex-col gap-3 mt-6 p-5 border rounded-2xl bg-muted/20">
              <Label className="text-sm font-semibold">Custom Theme Color</Label>
              <p className="text-xs text-muted-foreground mb-1">Slide to build your own custom application theme</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={accentHue} 
                  onChange={(e) => setAccentHue(Number(e.target.value))}
                  className="w-full h-3 rounded-xl appearance-none cursor-pointer border border-border"
                  style={{ 
                    background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)` 
                  }}
                />
                <div 
                  className="w-8 h-8 rounded-full border shadow-sm shrink-0 transition-colors duration-200" 
                  style={{ backgroundColor: `hsl(${accentHue}, 70%, 55%)` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 p-4 border rounded-2xl bg-muted/20">
              <Label className="text-sm font-semibold">Visual Style</Label>
              <p className="text-xs text-muted-foreground">Choose a complete visual theme (only applies in dark mode)</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {VISUAL_THEMES.map((vt) => (
                  <button
                    key={vt.id}
                    onClick={() => setVisualTheme(vt.id)}
                    className={`flex flex-col items-start gap-1 p-2 rounded-lg border-2 transition-all hover:scale-[1.03] text-left ${
                      visualTheme === vt.id
                        ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div
                      className="w-full h-5 rounded border border-border/50"
                      style={{ backgroundColor: vt.preview }}
                    />
                    <span className="text-[11px] font-medium leading-tight truncate w-full">{vt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 7: Account Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login</span>
              <span>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 5: Storage Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Storage Information
          </CardTitle>
          <CardDescription>
            Your data statistics from the cloud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">{storageInfo.subjects}</p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">{storageInfo.attendance}</p>
              <p className="text-sm text-muted-foreground">Attendance Records</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">{storageInfo.materials}</p>
              <p className="text-sm text-muted-foreground">Materials</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 8: Export Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download a backup of all your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExport} disabled={isExporting} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export All Data (JSON)'}
            </Button>
            <Button onClick={() => navigate('/report')} variant="secondary" className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              Generate Semester Report (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 9: Import Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore data from a backup file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select Backup File (JSON)</Label>
              <Input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
                disabled={isImporting}
              />
            </div>
            <Button onClick={handleImport} disabled={isImporting || !selectedFile}>
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 10: App Settings (PWA) */}
      <AppInstallationSection />

      {/* SECTION 11: Danger Zone */}
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              This will permanently delete all your data but keep your account.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={handleClearData} disabled={isClearing} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
            <Button onClick={() => setIsDeleteAccountOpen(true)} variant="destructive">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 11: Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
                navigate('/login', { replace: true });
              }
            }}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* Photo Preview Dialog */}
      <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-muted">
              <img src={photoPreview || profile.profilePhoto} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePhoto} disabled={isSaving}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={() => { setPhotoPreview(''); setIsPhotoPreviewOpen(false); }}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              {profile.profilePhoto && (
                <Button variant="destructive" onClick={handleRemovePhoto} disabled={isSaving}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />

      {/* Change Email Dialog */}
      <ChangeEmailDialog
        open={isChangeEmailOpen}
        onOpenChange={setIsChangeEmailOpen}
        currentEmail={profile.email}
        onEmailChanged={(newEmail) => setProfile(prev => ({ ...prev, email: newEmail }))}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={isDeleteAccountOpen}
        onOpenChange={setIsDeleteAccountOpen}
        email={profile.email}
        onDeleted={() => logout()}
      />
    </div>
  );
}

// ============================================
// Change Email Dialog Component (OTP Verified)
// ============================================
function ChangeEmailDialog({ open, onOpenChange, currentEmail, onEmailChanged }: { open: boolean; onOpenChange: (open: boolean) => void; currentEmail: string; onEmailChanged: (email: string) => void }) {
  const { sendOtp, changeEmail } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetState = () => {
    setStep(1);
    setNewEmail('');
    setOtp('');
    setError('');
  };

  const handleSendOtp = async () => {
    setError('');
    if (!newEmail) {
      setError('Please enter your new email');
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError('This is already your current email');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp();
      setStep(2);
      toast.success('Verification code sent! Check your server console.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      await changeEmail(newEmail.trim(), otp.trim());
      toast.success('Email changed successfully!');
      onEmailChanged(newEmail.toLowerCase().trim());
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetState(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
        </DialogHeader>
        <Alert className="mb-4">
          <AlertDescription>
            Current email: <strong>{currentEmail}</strong>
          </AlertDescription>
        </Alert>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email"
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              A 6-digit code will be logged to the server console
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndChange} className="space-y-4">
            <Alert>
              <AlertDescription>
                A verification code was sent. Check the server console for the 6-digit OTP.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="email-otp">Verification Code</Label>
              <Input
                id="email-otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Change Email'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep(1); setOtp(''); setError(''); }}>
              ← Back
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Change Password Dialog Component (OTP Verified)
// ============================================
function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { sendOtp, changePassword } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetState = () => {
    setStep(1);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
  };

  const handleSendOtp = async () => {
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp();
      setStep(2);
      toast.success('Verification code sent! Check your server console.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword, otp.trim());
      toast.success('Password changed successfully!');
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetState(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              A 6-digit code will be logged to the server console
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndChange} className="space-y-4">
            <Alert>
              <AlertDescription>
                A verification code was sent. Check the server console for the 6-digit OTP.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="password-otp">Verification Code</Label>
              <Input
                id="password-otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Change Password'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep(1); setOtp(''); setError(''); }}>
              ← Back
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Delete Account Dialog Component
// ============================================
function DeleteAccountDialog({ open, onOpenChange, email, onDeleted }: { open: boolean; onOpenChange: (open: boolean) => void; email: string; onDeleted: () => void }) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (confirmEmail !== email) {
      setError('Please enter your email correctly to confirm');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/users/delete', { confirmEmail });
      toast.success('Account deleted successfully');
      onDeleted();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Account</DialogTitle>
        </DialogHeader>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action is irreversible. All your data will be permanently deleted.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2">
            <Label htmlFor="confirm-email">Type <strong>{email}</strong> to confirm</Label>
            <Input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" variant="destructive" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AppInstallationSection() {
  const { isInstallable, installApp } = usePwa();

  if (!isInstallable) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Install EduTrack App
        </CardTitle>
        <CardDescription>
          Install EduTrack on your device for a better experience, offline access, and faster loading.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={installApp} className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Install Now
        </Button>
      </CardContent>
    </Card>
  );
}

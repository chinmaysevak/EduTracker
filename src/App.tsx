// ============================================
// EduTrack - Professional Student Assistant
// ============================================

import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  PlayCircle,
  ClipboardList,
  TrendingUp,
  Settings as SettingsIcon,
  Menu,
  Moon,
  Sun,
  Bell,
  Search,
  Trash2,
  ChevronRight,
  Quote,
  HelpCircle,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import {
  useSubjects,
  useStudyMaterials,
  useStudyTasks,
  useNotifications
} from '@/hooks/useData';
import type { ModuleType } from '@/types';

// Import module components
import Dashboard from '@/sections/Dashboard';
import AttendanceTracker from '@/sections/AttendanceTracker';
import StudyMaterials from '@/sections/StudyMaterials';
import LearningHub from '@/sections/LearningHub';
import StudyPlanner from '@/sections/StudyPlanner';
import ProgressTracker from '@/sections/ProgressTracker';
import Settings from '@/sections/Settings';
import LoginPage from '@/sections/LoginPage';
import FocusMode from '@/sections/FocusMode';

// Navigation items
const navItems: { id: ModuleType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'materials', label: 'Materials', icon: BookOpen },
  { id: 'learning-hub', label: 'Learning', icon: PlayCircle },
  { id: 'planner', label: 'Planner', icon: ClipboardList },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

// Daily quotes for inspiration
const dailyQuotes = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
];

function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(dailyQuotes[0]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { isAuthenticated, user, logout, updateProfile } = useAuth();
  const userName = user?.name || '';



  const openProfileDialog = () => {
    setProfileNameInput(userName);
    setProfileOpen(true);
  };
  const saveProfile = () => {
    const name = profileNameInput.trim();
    if (name) {
      try {
        updateProfile(name);
        setProfileOpen(false);
        toast.success('Profile updated.');
      } catch {
        toast.error('Could not save name.');
      }
    }
  };

  // Data hooks
  const { subjects } = useSubjects();
  const { materials } = useStudyMaterials();
  const { tasks } = useStudyTasks();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Update time every minute for live clock (hour:min display)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Change quote based on day
  useEffect(() => {
    const startOfYear = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / 1000 / 60 / 60 / 24);
    setCurrentQuote(dailyQuotes[dayOfYear % dailyQuotes.length]);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeItem = navItems.find(item => item.id === activeModule);

  // Update document title per page
  useEffect(() => {
    const title = activeItem?.label ? `${activeItem.label} – EduTrack` : 'EduTrack';
    document.title = title;
  }, [activeItem?.label]);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard onNavigate={setActiveModule} dailyQuote={currentQuote} />;
      case 'attendance': return <AttendanceTracker />;
      case 'materials': return <StudyMaterials />;
      case 'learning-hub': return <LearningHub />;
      case 'planner': return <StudyPlanner />;
      case 'progress': return <ProgressTracker />;
      case 'settings': return <Settings />;
      case 'focus': return <FocusMode onExit={() => setActiveModule('dashboard')} />;
      default: return <Dashboard onNavigate={setActiveModule} dailyQuote={currentQuote} />;
    }
  };

  // Format date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Search data
  const searchData = useMemo(() => {
    const items: { title: string; subtitle: string; icon: React.ElementType; action: () => void; group: string }[] = [];

    navItems.forEach(item => {
      items.push({
        title: item.label,
        subtitle: 'Navigate',
        icon: item.icon,
        action: () => { setActiveModule(item.id); setSearchOpen(false); },
        group: 'Navigation'
      });
    });

    subjects.forEach(subject => {
      items.push({
        title: subject.name,
        subtitle: 'Subject',
        icon: BookOpen,
        action: () => { setActiveModule('attendance'); setSearchOpen(false); },
        group: 'Subjects'
      });
    });

    materials.slice(0, 10).forEach(material => {
      items.push({
        title: material.title,
        subtitle: 'Material',
        icon: BookOpen,
        action: () => { setActiveModule('materials'); setSearchOpen(false); },
        group: 'Materials'
      });
    });

    tasks.slice(0, 10).forEach(task => {
      items.push({
        title: task.description,
        subtitle: `Due ${task.targetDate}`,
        icon: ClipboardList,
        action: () => { setActiveModule('planner'); setSearchOpen(false); },
        group: 'Tasks'
      });
    });

    return items;
  }, [subjects, materials, tasks]);

  const groupedSearchItems = useMemo(() => {
    const groups: Record<string, typeof searchData> = {};
    searchData.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [searchData]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Search Command Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search anything..." className="text-base" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedSearchItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item, idx) => (
                <CommandItem
                  key={`${group}-${idx}`}
                  onSelect={item.action}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col sticky top-0 h-screen z-50 glass border-r-0 transition-all duration-300 custom-scrollbar relative ${isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
        {/* Logo and Collapse Button */}
        <div className={`flex items-center justify-between flex-shrink-0 relative z-10 pointer-events-none ${isSidebarCollapsed ? 'p-3' : 'p-4'
          }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveModule('dashboard');
            }}
            type="button"
            className="flex items-center gap-3 w-fit max-w-full shrink-0 self-start pointer-events-auto"
          >
            {/* Professional Logo - Graduation Cap */}
            <div className="relative flex-shrink-0">
              <img
                src="/logo.svg"
                alt="EduTrack"
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-xl tracking-tight">EduTrack</h1>
                <p className="text-xs text-muted-foreground">Student Assistant</p>
              </div>
            )}
          </button>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-8 h-8 rounded-lg flex-shrink-0 hover:bg-muted/50 pointer-events-auto"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''
              }`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 overflow-y-auto custom-scrollbar relative z-20 ${isSidebarCollapsed ? 'px-2' : 'px-3'
          }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center rounded-xl transition-all duration-200 ${isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5 text-left'
                  } ${isActive
                    ? 'bg-primary text-primary-foreground font-medium shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
                {isActive && !isSidebarCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`border-t border-border/50 space-y-2 relative z-20 ${isSidebarCollapsed ? 'p-2' : 'p-3'
          }`}>
          {!isSidebarCollapsed && userName && (
            <div className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50 mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-medium truncate">{userName}</p>
              <Button variant="ghost" size="sm" className="w-full mt-1 h-7 text-xs rounded-lg" onClick={openProfileDialog}>
                <User className="w-3 h-3 mr-1" /> Edit profile
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-foreground ${isSidebarCollapsed ? 'px-3' : ''
              }`}
            onClick={() => setAboutOpen(true)}
            title={isSidebarCollapsed ? 'About & Help' : ''}
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="text-sm">About & Help</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-foreground ${isSidebarCollapsed ? 'px-3' : ''
              }`}
            onClick={toggleTheme}
            title={isSidebarCollapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
          >
            {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
            {!isSidebarCollapsed && <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </Button>
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-red-500"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <span className="text-sm">Logout</span>
            </Button>
          )}
          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              className="w-full justify-center gap-3 h-10 rounded-xl text-muted-foreground hover:text-red-500 px-3"
              onClick={() => setLogoutDialogOpen(true)}
              title="Logout"
            >
              <span className="text-sm">Logout</span>
            </Button>
          )}
        </div>

        {/* Daily Quote - Only show when not collapsed */}
        {!isSidebarCollapsed && (
          <div className="px-3 pb-3 relative z-20">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Daily Inspiration</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed line-clamp-3">
                "{currentQuote.text}"
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">— {currentQuote.author}</p>
            </div>
          </div>
        )}
      </aside>

      {/* About & Help Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About EduTrack</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              EduTrack is your student assistant. Use it to track attendance, manage study materials, plan tasks, follow your progress, and keep a weekly schedule.
            </p>
            <div>
              <p className="font-medium text-foreground mb-1">Keyboard shortcut</p>
              <p>Press <kbd className="inline-flex h-6 items-center rounded border bg-muted px-2 font-mono text-xs">Ctrl+K</kbd> (or <kbd className="inline-flex h-6 items-center rounded border bg-muted px-2 font-mono text-xs">⌘K</kbd> on Mac) to open search and jump to any section.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile (Edit name) Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Your name</Label>
              <Input
                id="profile-name"
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                placeholder="Enter your name"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} disabled={!profileNameInput.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your dashboard and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                logout();
                setLogoutDialogOpen(false);
                toast.success('You have been logged out.');
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled ? 'glass shadow-lg' : 'bg-background'
        }`}>
        <div className="flex items-center justify-between p-3 pr-2">
          <button onClick={() => setActiveModule('dashboard')} className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <img
                src="/logo.svg"
                alt="EduTrack"
                className="w-8 h-8 rounded-lg shadow-md"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-base">EduTrack</h1>
              <p className="text-[9px] text-muted-foreground hidden sm:block">Student Assistant</p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-8 w-8">
              <Search className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="w-3.5 h-3.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0 glass border-l">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <img
                          src="/logo.svg"
                          alt="EduTrack"
                          className="w-8 h-8 rounded-lg shadow-md"
                        />
                      </div>
                      <h2 className="font-semibold text-base">EduTrack</h2>
                    </div>
                  </div>
                  <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveModule(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isActive
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="p-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10 rounded-xl text-muted-foreground hover:text-red-500"
                      onClick={() => { setMobileMenuOpen(false); setLogoutDialogOpen(true); }}
                    >
                      <span className="text-sm">Log out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300">
        {/* Header with Date & Time */}
        <header className={`sticky top-0 z-40 transition-all duration-200 ${isScrolled ? 'glass shadow-sm' : 'bg-transparent'
          }`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Page Title */}
            <div>
              <h2 className="text-2xl font-semibold">{activeItem?.label}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeItem?.label === 'Dashboard'
                  ? (userName ? `Welcome back, ${userName}` : 'Welcome back')
                  : `Manage your ${activeItem?.label.toLowerCase()}`}
              </p>
            </div>

            {/* Right Section - Date, Time, Search, Notifications */}
            <div className="flex items-center gap-4">
              {/* Date & Time Display - Vertical Layout */}
              <div className="hidden md:flex flex-col items-end px-3 py-2 rounded-xl bg-muted/50 border border-border/50 min-w-[120px]">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{formatDate(currentTime)}</div>
                <div className="text-lg font-semibold font-mono leading-tight">{formatTime(currentTime)}</div>
              </div>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px]">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl glass-card">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div>
                      <span className="font-semibold">Notifications</span>
                      <p className="text-xs text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border/30 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/20' : ''
                            }`}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.link) setActiveModule(notification.link);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                  className="text-muted-foreground hover:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 w-full min-h-[calc(100vh-12rem)]">
          {renderModule()}
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-4 px-6 text-center text-xs text-muted-foreground">
          EduTrack · Student Assistant · Search: <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono">Ctrl+K</kbd>
        </footer>
      </main>
    </div>
  );
}

export default App;

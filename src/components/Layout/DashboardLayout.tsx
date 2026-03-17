import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarCheck,
    BookOpen,
    ClipboardList,
    TrendingUp,
    Settings as SettingsIcon,
    Moon,
    Sun,
    Bell,
    Search,
    Trash2,
    ChevronRight,
    LogOut,
    MoreHorizontal,
    Zap,
    Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
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
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useNotifications, useResources, useStudyTasks, useSubjects } from '@/hooks/useData';
// Navigation items - Now mapped to URLs
const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', path: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'planner', path: '/planner', label: 'Planner', icon: ClipboardList },
    { id: 'resources', path: '/resources', label: 'Resources', icon: BookOpen },
    { id: 'progress', path: '/progress', label: 'Progress', icon: TrendingUp },
    { id: 'advisor', path: '/advisor', label: 'AI Advisor', icon: Brain }, // ADDED AI ADVISOR
    { id: 'settings', path: '/settings', label: 'Settings', icon: SettingsIcon },
];

// Bottom tab bar items (subset for mobile)
const bottomTabItems = navItems.slice(0, 4);
const drawerExtraItems = navItems.slice(4);

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const { toggleTheme, isDark } = useTheme({
        onThemeChange: (newTheme) => {
            api.put('/users/preferences', { theme: newTheme }).catch(console.error);
        }
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchOpen, setSearchOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

    const { user, logout } = useAuth();
    const userName = user?.name || '';

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        let greeting: string;
        if (hour >= 5 && hour < 12) greeting = "Good Morning";
        else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
        else if (hour >= 17 && hour < 22) greeting = "Good Evening";
        else greeting = "Good Night";
        return userName ? `${greeting}, ${userName}` : greeting;
    };

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const { subjects } = useSubjects();
    const { getPendingTasks, getOverdueTasks } = useStudyTasks();
    const { notifications, unreadCount, markAllAsRead, markAsRead, deleteNotification } = useNotifications();
    const { resources } = useResources();

    // Find active item by current URL path
    const activeItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];
    const isFocusMode = location.pathname === '/focus';

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date: Date) => date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

    // Search items
    const searchItems = useMemo(() => {
        const items: { title: string; subtitle: string; icon: React.ElementType; action: () => void; group: string }[] = [];

        navItems.forEach(item => {
            items.push({
                title: item.label,
                subtitle: `Go to ${item.label}`,
                icon: item.icon,
                action: () => { navigate(item.path); setSearchOpen(false); },
                group: 'Navigation'
            });
        });

        items.push({
            title: 'Focus Mode',
            subtitle: 'Start a focus session',
            icon: Zap,
            action: () => { navigate('/focus'); setSearchOpen(false); },
            group: 'Navigation'
        });

        subjects.forEach(subject => {
            items.push({ title: subject.name, subtitle: 'Subject', icon: BookOpen, action: () => { navigate('/attendance'); setSearchOpen(false); }, group: 'Subjects' });
        });

        getPendingTasks().slice(0, 5).forEach(task => {
            items.push({ title: task.description, subtitle: 'Pending Task', icon: ClipboardList, action: () => { navigate('/planner'); setSearchOpen(false); }, group: 'Tasks' });
        });

        getOverdueTasks().slice(0, 3).forEach(task => {
            items.push({ title: task.description, subtitle: '⚠️ Overdue', icon: ClipboardList, action: () => { navigate('/planner'); setSearchOpen(false); }, group: 'Tasks' });
        });

        resources.slice(0, 5).forEach(resource => {
            items.push({ title: resource.title, subtitle: resource.type, icon: BookOpen, action: () => { navigate('/resources'); setSearchOpen(false); }, group: 'Resources' });
        });

        return items;
    }, [subjects, resources, getPendingTasks, getOverdueTasks, navigate]);

    const groupedSearchItems = useMemo(() => {
        const groups: Record<string, typeof searchItems> = {};
        searchItems.forEach(item => {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
        });
        return groups;
    }, [searchItems]);

    const handleLogout = () => {
        logout();
        setLogoutDialogOpen(false);
        toast.success('You have been logged out.');
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground font-display">
            {/* Absolute Portal Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
                <div className="pointer-events-auto">
                    <PWAInstallPrompt />
                </div>
            </div>

            {/* ══ Search Command Dialog ══ */}
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

            {/* ══ Logout Confirmation ══ */}
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
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleLogout}>
                            Log out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ══════════════════════════════════════
           DESKTOP: Auto-Hide Sidebar that PUSHES content (lg+)
         ══════════════════════════════════════ */}
            <div className="hidden lg:flex flex-shrink-0 group/sidebar h-screen sticky top-0 z-40 self-start py-4 pl-4 pointer-events-none">
                {/* Invisible trigger zone at left edge - wider for easier access */}
                <div className="absolute left-0 top-0 w-8 h-full z-50 pointer-events-auto" />

                <aside id="app-sidebar" className="w-0 group-hover/sidebar:w-64 h-full overflow-hidden bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2rem] custom-scrollbar flex flex-col transition-all duration-300 ease-in-out shadow-2xl pointer-events-auto">
                    <div className="flex items-center flex-shrink-0 p-4 transition-all duration-300 justify-between cursor-pointer min-w-[16rem]">
                        <button onClick={() => navigate('/dashboard')} type="button" className="flex items-center gap-3 w-fit max-w-full shrink-0">
                            <div className="relative flex-shrink-0 group/logo">
                                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                                <img
                                    src={`${import.meta.env.BASE_URL}logo.png`}
                                    onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}logo.svg` }}
                                    alt="EduTrack"
                                    className="w-10 h-10 relative z-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center z-20">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="overflow-hidden whitespace-nowrap">
                                <h1 className="font-bold text-xl tracking-tight text-left">EduTrack</h1>
                                <p className="text-xs text-muted-foreground text-left">Student Assistant</p>
                            </div>
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-3 overflow-x-hidden min-w-[16rem]">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <button
                                    key={item.id}
                                    id={item.id === 'advisor' ? 'smart-advisor-tab' : item.id === 'progress' ? 'progress-tracker-tab' : undefined}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center px-3 py-2.5 rounded-xl text-left transition-all duration-200 justify-start gap-3 ${isActive
                                        ? 'bg-primary text-primary-foreground font-medium shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    title={item.label}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <div className="flex flex-1 items-center overflow-hidden whitespace-nowrap">
                                        <span className="text-sm truncate">{item.label}</span>
                                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />}
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="border-t border-border/50 p-3 space-y-2 flex flex-col items-stretch min-w-[16rem]">
                        <Button
                            variant="ghost"
                            className="flex items-center h-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full justify-start gap-3 px-3"
                            onClick={() => setLogoutDialogOpen(true)}
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm whitespace-nowrap">Logout</span>
                        </Button>
                    </div>
                </aside>
            </div>

            {/* ══════════════════════════════════════
           MOBILE: Bottom Tab Bar + Vaul Drawer (< lg)
         ══════════════════════════════════════ */}
            <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled ? 'glass shadow-lg' : 'bg-background'}`}>
                <div className="flex items-center justify-between px-4 py-2.5">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                        <img
                            src={`${import.meta.env.BASE_URL}logo.png`}
                            onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}logo.svg` }}
                            alt="EduTrack"
                            className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(59,130,246,0.2)]"
                        />
                        <h1 className="font-semibold text-base">EduTrack</h1>
                    </button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-9 w-9 touch-compact">
                            <Search className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 touch-compact">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative h-9 w-9 touch-compact">
                                    <Bell className="w-4 h-4" />
                                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72 p-0 rounded-2xl glass-card">
                                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                                    <span className="font-semibold text-sm">Notifications</span>
                                    {unreadCount > 0 && (
                                        <Button variant="ghost" size="sm" className="h-6 text-xs touch-compact" onClick={markAllAsRead}>
                                            Mark all read
                                        </Button>
                                    )}
                                </div>
                                <div className="max-h-[250px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-6 text-center text-muted-foreground text-sm">No notifications</div>
                                    ) : (
                                        notifications.slice(0, 6).map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-3 border-b border-border/30 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/20' : ''}`}
                                                onClick={() => {
                                                    markAsRead(notification.id);
                                                    if (notification.link) navigate(`/${notification.link}`);
                                                }}
                                            >
                                                <div className="flex gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notification.message}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                        className="text-muted-foreground hover:text-red-500 touch-compact"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <nav className="bottom-nav lg:hidden glass border-t border-white/10">
                <div className="flex items-stretch h-full max-w-lg mx-auto">
                    {bottomTabItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`bottom-nav-item ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => navigate('/focus')}
                        className={`bottom-nav-item ${isFocusMode ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <Zap className="w-5 h-5" />
                        <span className={isFocusMode ? 'font-semibold' : ''}>Focus</span>
                    </button>
                    <button
                        onClick={() => setMoreDrawerOpen(true)}
                        className={`bottom-nav-item ${drawerExtraItems.some(i => location.pathname.startsWith(i.path)) ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <MoreHorizontal className="w-5 h-5" />
                        <span>More</span>
                    </button>
                </div>
            </nav>

            <Drawer open={moreDrawerOpen} onOpenChange={setMoreDrawerOpen}>
                <DrawerContent className="glass-card">
                    <DrawerHeader>
                        <DrawerTitle>More</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-6 space-y-2">
                        {drawerExtraItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { navigate(item.path); setMoreDrawerOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                        <div className="border-t border-border/50 pt-2 mt-2">
                            <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-foreground hover:bg-muted transition-all">
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                            <button onClick={() => { setMoreDrawerOpen(false); setLogoutDialogOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm">Log out</span>
                            </button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* ══════════════════════════════════════
           Main Content Area
         ══════════════════════════════════════ */}
            <main className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
                <header className={`sticky top-0 z-30 w-full backdrop-blur bg-background/80 border-b border-white/10 transition-all duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-fluid-md py-3">
                        <div className="hidden lg:block">
                            <h2 className="text-2xl font-semibold">{activeItem?.label}</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {activeItem?.label === 'Dashboard' ? getGreeting() : `Manage your ${activeItem?.label.toLowerCase()}`}
                            </p>
                        </div>
                        <div className="lg:hidden h-[44px]" />

                        <div className="hidden lg:flex items-center gap-4">
                            <div className="flex flex-col items-end px-3 py-2 rounded-xl bg-muted/50 border border-border/50 min-w-[120px]">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">{formatDate(currentTime)}</div>
                                <div className="text-lg font-semibold mono-data leading-tight">{formatTime(currentTime)}</div>
                            </div>

                            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground">
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                                <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px]">⌘K</kbd>
                            </button>

                            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-xl">
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl glass-card">
                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold">Notifications</span>
                                            <p className="text-xs text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}</p>
                                        </div>
                                        {unreadCount > 0 && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>Mark all read</Button>}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-8 text-center text-muted-foreground text-sm">No notifications yet</div>
                                        ) : (
                                            notifications.slice(0, 8).map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-border/30 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-muted/20' : ''}`}
                                                    onClick={() => {
                                                        markAsRead(notification.id);
                                                        if (notification.link) navigate(`/${notification.link}`);
                                                    }}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                            <Bell className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                                                                <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="text-muted-foreground hover:text-red-500">
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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

                {/* Dynamic Route Content Injected Here */}
                <div className="flex-1 w-full px-3 sm:px-4 md:px-fluid-md py-4 pb-[calc(var(--bottom-nav-height)+1rem)] lg:pb-4">
                    <Outlet />
                </div>

                <footer className="hidden lg:block border-t border-white/10 py-2 px-4 text-center text-xs text-muted-foreground">
                    EduTrack · Student Assistant · Search: <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono">Ctrl+K</kbd>
                </footer>
            </main>
        </div>
    );
}

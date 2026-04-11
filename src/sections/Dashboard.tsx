// ============================================
// Dashboard — Premium Animated Redesign (Sortable)
// ============================================

import {
  CalendarCheck,
  ClipboardList,
  BookOpen,
  ArrowUpRight,
  Target,
  Zap,
  Sparkles,
  Settings2,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GlassyDataCard } from '@/components/ui/GlassyDataCard';
import {
  useSubjects,
  useAttendance,
  useTimetable,
  useStudyTasks,
  useSyllabus
} from '@/hooks/useData';
import { AttendanceWidget } from '@/components/dashboard/AttendanceWidget';
import {
  ExamCountdownWidget
} from '@/components/dashboard/SmartWidgets';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { TimetableWidget } from '@/components/dashboard/TimetableWidget';
import { ResumeSessionCard } from '@/components/dashboard/ResumeSessionCard';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { EduNotifications } from '@/lib/notifications';

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWidget } from '@/components/dashboard/SortableWidget';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/** Tiny SVG ring chart for subject attendance */
function MiniRing({ percentage, color, size = 36 }: { percentage: number; color: string; size?: number }) {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <svg width={size} height={size} className="flex-shrink-0 -rotate-90 ring-glow">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={3.5} className="text-muted/30" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={3.5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

const DEFAULT_LAYOUT = [
  'welcome',
  'stat-pending',
  'stat-exam',
  'stat-progress',
  'stat-classes',
  'timetable',
  'attendance',
  'quick-actions',
  'subjects'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subjects } = useSubjects();
  const { calculateSubjectAttendance } = useAttendance();
  const { getTodayClasses } = useTimetable();
  const { getPendingTasks, getOverdueTasks } = useStudyTasks();
  const { getOverallProgress } = useSyllabus();

  const todayClasses = getTodayClasses();
  const subjectIds = subjects.map(s => s.id);
  const overallProgress = getOverallProgress(subjectIds);
  const pendingTasksCount = getPendingTasks().length;
  const overdueTasksCount = getOverdueTasks().length;

  // Edit Mode State
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [items, setItems] = useState<string[]>(DEFAULT_LAYOUT);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Load layout from localStorage on mount
  useEffect(() => {
    if (user?.id) {
        const saved = localStorage.getItem(`dashboard_layout_${user.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Simple validation to ensure it's an array of matching length
                if (Array.isArray(parsed) && parsed.length === DEFAULT_LAYOUT.length) {
                    setItems(parsed);
                }
            } catch (e) {
                console.error("Failed to parse saved layout", e);
            }
        }
    }
    
    // Listen for cross-component reset signal (e.g. from Settings)
    const handleReset = () => {
        setItems(DEFAULT_LAYOUT);
    };
    window.addEventListener('dashboard-layout-reset', handleReset);
    return () => window.removeEventListener('dashboard-layout-reset', handleReset);
  }, [user?.id]);

  const saveLayout = () => {
      if (user?.id) {
          localStorage.setItem(`dashboard_layout_${user.id}`, JSON.stringify(items));
          setIsEditingLayout(false);
          toast.success("Dashboard layout saved successfully");
      }
  };

  const cancelLayout = () => {
      if (user?.id) {
          const saved = localStorage.getItem(`dashboard_layout_${user.id}`);
          if (saved) {
              setItems(JSON.parse(saved));
          } else {
              setItems(DEFAULT_LAYOUT);
          }
      }
      setIsEditingLayout(false);
      toast.info("Layout changes discarded");
  };

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Auto-schedule push notifications for today's classes
  useEffect(() => {
    if (!EduNotifications.isEnabled() || todayClasses.length === 0) return;
    const sessions = todayClasses.map(c => ({
      subject: c.subject,
      startTime: c.startTime,
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],
    }));
    EduNotifications.scheduleSessionReminders(sessions, 15);

    subjects.forEach(s => {
      const stats = calculateSubjectAttendance(s.id);
      if (stats.total >= 5 && stats.percentage < 65) {
        EduNotifications.sendAttendanceAlert(s.name, stats.percentage);
      }
    });

    return () => EduNotifications.clearScheduled();
  }, [todayClasses, subjects]);

  // Widget Library Configuration mapped to components
  const WIDGETS = useMemo<Record<string, { spanClasses: string; element: React.ReactNode }>>(() => ({
    'welcome': {
      spanClasses: 'col-span-1 md:col-span-12',
      element: <div data-tutorial="welcome-section"><WelcomeSection onNavigate={(path) => navigate(`/${path}`)} /></div>
    },
    'stat-pending': {
      spanClasses: 'col-span-1 md:col-span-6 lg:col-span-3 min-h-[120px]',
      element: (
        <div data-tutorial="stat-pending" className="h-full">
          <GlassyDataCard
            title="Pending Tasks"
            value={pendingTasksCount}
            subtitle={overdueTasksCount > 0 ? `${overdueTasksCount} overdue` : 'All on track'}
            glowColor={overdueTasksCount > 0 ? 'amber' : undefined}
            icon={<ClipboardList className="w-4 h-4 text-amber-500" />}
            onClick={() => navigate('/planner?filter=pending')}
          />
        </div>
      )
    },
    'stat-exam': {
      spanClasses: 'col-span-1 md:col-span-6 lg:col-span-3 min-h-[120px]',
      element: <ExamCountdownWidget onNavigate={(path) => navigate(`/${path}`)} />
    },
    'stat-progress': {
      spanClasses: 'col-span-1 md:col-span-6 lg:col-span-3 min-h-[120px]',
      element: (
        <GlassyDataCard
          title="Overall Progress"
          value={`${overallProgress.student}%`}
          subtitle="Syllabus completion"
          glowColor="emerald"
          icon={<Target className="w-4 h-4 text-emerald-500" />}
          onClick={() => navigate('/progress')}
        >
          <Progress value={overallProgress.student} className="h-1.5 mt-3" />
        </GlassyDataCard>
      )
    },
    'stat-classes': {
      spanClasses: 'col-span-1 md:col-span-6 lg:col-span-3 min-h-[120px]',
      element: (
        <GlassyDataCard
          title="Today's Classes"
          value={todayClasses.length}
          subtitle={todayClasses.length > 0 ? 'Scheduled today' : 'No classes today'}
          glowColor="blue"
          icon={<BookOpen className="w-4 h-4 text-blue-500" />}
          onClick={() => navigate('/attendance')}
        />
      )
    },
    'timetable': {
      spanClasses: 'col-span-1 md:col-span-12',
      element: <div data-tutorial="timetable-widget"><TimetableWidget /></div>
    },
    'attendance': {
      spanClasses: 'col-span-1 md:col-span-12 lg:col-span-8 flex flex-col',
      element: <div className="flex-1" data-tutorial="attendance-widget"><AttendanceWidget onNavigate={(path) => navigate(`/${path}`)} /></div>
    },
    'resume-streak': {
      spanClasses: 'col-span-1 md:col-span-12 lg:col-span-4 flex flex-col gap-5',
      element: (
        <>
          <div className="flex-1 w-full"><ResumeSessionCard onNavigate={(path) => navigate(`/${path}`)} /></div>
        </>
      )
    },
    'quick-actions': {
      spanClasses: 'col-span-1 md:col-span-12 lg:col-span-4 flex flex-col',
      element: (
        <Card className="card-professional flex-1 w-full flex flex-col" data-tutorial="quick-actions">
          <CardHeader className="pb-2">
            <h3 className="font-semibold font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col justify-between flex-1">
            <div className="flex items-center justify-around py-2">
              {[
                { icon: CalendarCheck, label: 'Attendance', path: '/attendance', color: 'text-blue-500', bg: 'from-blue-500/15 to-indigo-500/15', glow: 'group-hover:shadow-blue-500/20' },
                { icon: ClipboardList, label: 'Add Task', path: '/planner', color: 'text-amber-500', bg: 'from-amber-500/15 to-orange-500/15', glow: 'group-hover:shadow-amber-500/20' },
                { icon: Target, label: 'Progress', path: '/progress', color: 'text-emerald-500', bg: 'from-emerald-500/15 to-teal-500/15', glow: 'group-hover:shadow-emerald-500/20' },
                { icon: BookOpen, label: 'Materials', path: '/resources', color: 'text-purple-500', bg: 'from-purple-500/15 to-violet-500/15', glow: 'group-hover:shadow-purple-500/20' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1.5 group`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.bg} ${item.color} group-hover:scale-110 group-hover:shadow-lg ${item.glow} transition-all duration-300`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-2">
              <Button data-tutorial="focus-dashboard-btn" className="w-full btn-gradient btn-glow h-11 rounded-xl gap-2 text-sm font-bold" onClick={() => navigate('/focus')}>
                <Zap className="w-4 h-4" />
                Start Focus Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    },
    'subjects': {
      spanClasses: 'col-span-1 md:col-span-12 lg:col-span-8 flex flex-col',
      element: (
        <Card className="card-professional flex-1 w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Your Subjects
              </h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs group" onClick={() => navigate('/attendance')}>
                View All <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {subjects.slice(0, 5).map(subject => {
                const stats = calculateSubjectAttendance(subject.id);
                const color = stats.percentage >= 75
                  ? '#10b981'
                  : stats.percentage >= 60
                    ? '#f59e0b'
                    : '#ef4444';
                return (
                  <div
                    key={subject.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                    onClick={() => navigate('/attendance')}
                  >
                    <MiniRing percentage={stats.percentage} color={subject.color || '#666'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{subject.name}</p>
                      <p className="text-xs text-muted-foreground mono-data">{stats.present}/{stats.total} classes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold mono-data`} style={{ color }}>
                        {stats.percentage}%
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )
    }
  }), [pendingTasksCount, overdueTasksCount, overallProgress.student, todayClasses, navigate, subjects, calculateSubjectAttendance]);

  return (
    <div className="settings-bg space-y-5 pb-6">
      
      {/* Tutorial Trigger Button */}
      <TutorialTrigger />

      {/* Settings / Edit Layout Header */}
      <div className="flex items-center justify-end mb-2 w-full pr-1">
          {!isEditingLayout ? (
              <Button variant="outline" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground border-border/50 bg-background/50 backdrop-blur" onClick={() => setIsEditingLayout(true)} data-tutorial="customize-layout">
                  <Settings2 className="w-4 h-4" />
                  Customize Layout
              </Button>
          ) : (
              <div className="flex items-center gap-3 bg-card border border-primary/30 p-2 rounded-2xl shadow-lg animate-in slide-in-from-top-2">
                  <span className="text-xs font-semibold px-2 text-primary">Edit Mode Active</span>
                  <Button variant="ghost" size="sm" onClick={cancelLayout} className="gap-1.5 h-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <X className="w-4 h-4" /> Cancel
                  </Button>
                  <Button variant="default" size="sm" onClick={saveLayout} className="gap-1.5 h-8">
                      <Save className="w-4 h-4" /> Save Layout
                  </Button>
              </div>
          )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full items-stretch">
          <SortableContext
            items={items}
            strategy={rectSortingStrategy}
          >
            {items.map((id) => (
              <SortableWidget
                key={id}
                id={id}
                spanClasses={WIDGETS[id]?.spanClasses || 'col-span-1 md:col-span-12'}
                isEditing={isEditingLayout}
              >
                {WIDGETS[id]?.element}
              </SortableWidget>
            ))}
          </SortableContext>
        </div>

        <DragOverlay 
          dropAnimation={{
            duration: 250,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            sideEffects: defaultDropAnimationSideEffects({
               styles: { active: { opacity: '0.4' } }
            })
          }}
        >
          {activeId ? (
            <div className={`${WIDGETS[activeId]?.spanClasses || ''} opacity-95 scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden`}>
               {WIDGETS[activeId]?.element}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

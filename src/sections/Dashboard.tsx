// ============================================
// Dashboard — Premium Animated Redesign
// ============================================

import {
  CalendarCheck,
  ClipboardList,
  BookOpen,
  ArrowUpRight,
  Target,
  Zap,
  Sparkles
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
  StreakWidget,
  ExamCountdownWidget
} from '@/components/dashboard/SmartWidgets';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { TimetableWidget } from '@/components/dashboard/TimetableWidget';
import { ResumeSessionCard } from '@/components/dashboard/ResumeSessionCard';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EduNotifications } from '@/lib/notifications';

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

export default function Dashboard() {
  const navigate = useNavigate();
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

  return (
    <div className="settings-bg space-y-5">
      <WelcomeSection onNavigate={(path) => navigate(`/${path}`)} />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full items-stretch">
        <GlassyDataCard
          title="Pending Tasks"
          value={pendingTasksCount}
          subtitle={overdueTasksCount > 0 ? `${overdueTasksCount} overdue` : 'All on track'}
          glowColor={overdueTasksCount > 0 ? 'amber' : undefined}
          icon={<ClipboardList className="w-4 h-4 text-amber-500" />}
          onClick={() => navigate('/planner?filter=pending')}
        />

        <ExamCountdownWidget onNavigate={(path) => navigate(`/${path}`)} />

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

        <GlassyDataCard
          title="Today's Classes"
          value={todayClasses.length}
          subtitle={todayClasses.length > 0 ? 'Scheduled today' : 'No classes today'}
          glowColor="blue"
          icon={<BookOpen className="w-4 h-4 text-blue-500" />}
          onClick={() => navigate('/attendance')}
        />
      </div>

      {/* ── Timetable (full width) ── */}
      <TimetableWidget />

      {/* ── Attendance + Resume/Streak ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        <div className="lg:col-span-8 space-y-5">
          <AttendanceWidget onNavigate={(path) => navigate(`/${path}`)} />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <ResumeSessionCard onNavigate={(path) => navigate(`/${path}`)} />
          <StreakWidget />
        </div>
      </div>

      {/* ── Quick Actions + Subjects (Premium redesign) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Quick Actions — Circular icon buttons with gradient glow */}
        <Card className="lg:col-span-4 card-professional card-shine">
          <CardHeader className="pb-2">
            <h3 className="font-semibold font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent>
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
            <div className="mt-3">
              <Button className="w-full btn-gradient btn-glow h-11 rounded-xl gap-2 text-sm font-bold" onClick={() => navigate('/focus')}>
                <Zap className="w-4 h-4" />
                Start Focus Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subjects — With mini ring charts and enhanced styling */}
        <Card className="lg:col-span-8 card-professional card-shine">
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
      </div>
    </div>
  );
}

// ============================================
// Dashboard — Glassy Engineering Console Layout
// Asymmetric grid prioritizing Attendance Health
// ============================================

import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  ArrowUpRight,
  Target
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
import { WeeklyPerformanceWidget } from '@/components/dashboard/WeeklyPerformanceWidget';
import { BackupReminderWidget } from '@/components/dashboard/BackupReminderWidget';
import { StudyHeatmapWidget } from '@/components/dashboard/StudyHeatmapWidget';
import { AttendanceTrendWidget } from '@/components/dashboard/AttendanceTrendWidget';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EduNotifications } from '@/lib/notifications';

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

    // Attendance alerts for at-risk subjects
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
      <TimetableWidget />
      <BackupReminderWidget />

      {/* ══ Asymmetric Hero: Attendance Health (dominant) + Right Column ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Left — Primary Focus: Attendance Health + Performance */}
        <div className="lg:col-span-8 space-y-5">
          <AttendanceWidget onNavigate={(path) => navigate(`/${path}`)} />
          <WeeklyPerformanceWidget />
        </div>

        {/* Right — Secondary: Status Widgets */}
        <div className="lg:col-span-4 space-y-4">
          <ResumeSessionCard onNavigate={(path) => navigate(`/${path}`)} />
          <StreakWidget />
          <ExamCountdownWidget onNavigate={(path) => navigate(`/${path}`)} />
        </div>
      </div>

      {/* ══ Stats Row — GlassyDataCards ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full items-start">
        <GlassyDataCard
          title="Pending Tasks"
          value={pendingTasksCount}
          subtitle={overdueTasksCount > 0 ? `${overdueTasksCount} overdue` : 'All on track'}
          glowColor={overdueTasksCount > 0 ? 'amber' : undefined}
          icon={<ClipboardList className="w-4 h-4 text-amber-500" />}
          onClick={() => navigate('/planner')}
        />

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

      {/* ══ Advanced Data Insights ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        <AttendanceTrendWidget />
        <StudyHeatmapWidget />
      </div>

      {/* ══ Bottom Section: Quick Actions + Subjects ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* Quick Actions — Compact */}
        <Card className="lg:col-span-4 card-professional">
          <CardHeader className="pb-2">
            <h3 className="font-semibold font-display">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl" onClick={() => navigate('/attendance')}>
                <CalendarCheck className="w-4 h-4" />
                <span className="text-xs">Attendance</span>
              </Button>
              <Button variant="outline" className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl" onClick={() => navigate('/planner')}>
                <ClipboardList className="w-4 h-4" />
                <span className="text-xs">Add Task</span>
              </Button>
              <Button variant="outline" className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl" onClick={() => navigate('/progress')}>
                <Target className="w-4 h-4" />
                <span className="text-xs">Progress</span>
              </Button>
              <Button variant="outline" className="h-auto py-2 flex flex-col items-center gap-1 rounded-xl" onClick={() => navigate('/resources')}>
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">Materials</span>
              </Button>
              <div className="col-span-2 mt-1.5">
                <Button className="w-full btn-gradient h-9 rounded-xl" onClick={() => navigate('/focus')}>
                  <span className="text-xs font-semibold">Start Focus Session</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects — Wider */}
        <Card className="lg:col-span-8 card-professional">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-display">Your Subjects</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/attendance')}>
                View All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjects.slice(0, 5).map(subject => {
                const stats = calculateSubjectAttendance(subject.id);
                return (
                  <div
                    key={subject.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    onClick={() => navigate('/attendance')}
                  >
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: subject.color || '#666' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{subject.name}</p>
                      <p className="text-xs text-muted-foreground mono-data">{stats.present}/{stats.total} classes</p>
                    </div>
                    <span className={`text-sm font-semibold mono-data ${stats.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
                      stats.percentage >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {stats.percentage}%
                    </span>
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

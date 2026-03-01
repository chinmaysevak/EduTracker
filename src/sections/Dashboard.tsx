// ============================================
// Dashboard - Professional Design
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
import type { ModuleType } from '@/types';

interface DashboardProps {
  onNavigate: (module: ModuleType) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
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

  return (
    <div className="space-y-6">
      <WelcomeSection onNavigate={onNavigate} />

      <TimetableWidget />

      {/* Backup Reminder */}
      <BackupReminderWidget />

      {/* Hero Section: Action Panel & Smart Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyPerformanceWidget />
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <ResumeSessionCard onNavigate={onNavigate} />
          <StreakWidget />
          <ExamCountdownWidget onNavigate={onNavigate} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AttendanceWidget onNavigate={onNavigate} />

        <Card className="card-professional hover-lift cursor-pointer" onClick={() => onNavigate('planner')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              {overdueTasksCount > 0 && (
                <span className="text-xs font-medium text-red-600">{overdueTasksCount} overdue</span>
              )}
            </div>
            <p className="text-2xl font-semibold">{pendingTasksCount}</p>
            <p className="text-sm text-muted-foreground">Pending Tasks</p>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift cursor-pointer" onClick={() => onNavigate('progress')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{overallProgress.student}%</p>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <Progress value={overallProgress.student} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift cursor-pointer" onClick={() => onNavigate('attendance')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{todayClasses.length}</p>
            <p className="text-sm text-muted-foreground">Today's Classes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Subjects */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-professional">
            <CardHeader className="pb-3">
              <h3 className="font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl" onClick={() => onNavigate('attendance')}>
                  <CalendarCheck className="w-4 h-4" />
                  <span className="text-xs">Attendance</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl" onClick={() => onNavigate('planner')}>
                  <ClipboardList className="w-4 h-4" />
                  <span className="text-xs">Add Task</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl" onClick={() => onNavigate('progress')}>
                  <Target className="w-4 h-4" />
                  <span className="text-xs">Progress</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl" onClick={() => onNavigate('materials')}>
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs">Materials</span>
                </Button>
                <div className="col-span-2 mt-2">
                  <Button className="w-full btn-gradient h-10 rounded-xl" onClick={() => onNavigate('focus')}>
                    <span className="text-xs font-semibold">Start Focus Session</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 card-professional">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Your Subjects</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onNavigate('attendance')}>
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
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onNavigate('attendance')}
                    >
                      <div
                        className="w-2 h-10 rounded-full"
                        style={{ backgroundColor: subject.color || '#666' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{subject.name}</p>
                        <p className="text-xs text-muted-foreground">{stats.present}/{stats.total} classes</p>
                      </div>
                      <span className={`text-sm font-semibold ${stats.percentage >= 75 ? 'text-emerald-600' :
                        stats.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
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
    </div>
  );
}

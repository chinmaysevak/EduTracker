// ============================================
// Academic Planner Module (Complete)
// ============================================

import { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Filter,
  Search,
  ClipboardList,
  AlertTriangle,
  ListTodo,
  Calendar,
  BookOpen,
  Timer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubjects, useStudyTasks, useExams, useStudyPlannerSessions } from '@/hooks/useData';
import { toast } from 'sonner';
import type { StudyTask, Exam, StudySession } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';

export default function StudyPlanner() {
  const { subjects } = useSubjects();
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, getPendingTasks, getCompletedTasks, getOverdueTasks, getTodaysTasks } = useStudyTasks();
  const { exams, addExam, updateExam, deleteExam, getUpcomingExams, getOverdueExams } = useExams();
  const { sessions, addSession, updateSession, deleteSession, getTodaysSessions, getUpcomingSessions } = useStudyPlannerSessions();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<StudyTask | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [taskFormData, setTaskFormData] = useState({
    subjectId: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedMinutes: '',
    marks: ''
  });

  const [examFormData, setExamFormData] = useState({
    subjectId: '',
    title: '',
    examDate: '',
    syllabus: '',
    preparationStatus: 'not_started' as 'not_started' | 'in_progress' | 'completed',
    notes: ''
  });

  const [sessionFormData, setSessionFormData] = useState({
    subjectId: '',
    title: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    notes: ''
  });

  const filteredTasks = tasks.filter(t => {
    const matchesSubject = selectedSubject === 'all' || t.subjectId === selectedSubject;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const overdueTasks = getOverdueTasks();
  const todaysTasks = getTodaysTasks();
  const upcomingExams = getUpcomingExams();
  const overdueExams = getOverdueExams();
  const todaysSessions = getTodaysSessions();
  const upcomingSessions = getUpcomingSessions();

  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || subjectId;
  const getSubjectColor = (subjectId: string) => subjects.find(s => s.id === subjectId)?.color || '#6b7280';

  const getTaskStatus = (task: StudyTask): 'overdue' | 'due_today' | 'urgent' | 'upcoming' | 'completed' => {
    if (task.status === 'completed') return 'completed';
    const today = new Date().toISOString().split('T')[0];
    const taskDate = task.targetDate;
    if (taskDate < today) return 'overdue';
    if (taskDate === today) return 'due_today';
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    if (taskDate <= threeDaysFromNow.toISOString().split('T')[0]) return 'urgent';
    return 'upcoming';
  };

  const handleAddTask = () => {
    if (taskFormData.description.trim() && taskFormData.subjectId) {
      addTask({
        subjectId: taskFormData.subjectId,
        description: taskFormData.description.trim(),
        targetDate: taskFormData.targetDate,
        priority: taskFormData.priority,
        estimatedMinutes: taskFormData.estimatedMinutes ? parseInt(taskFormData.estimatedMinutes) : undefined,
        marks: taskFormData.marks ? parseInt(taskFormData.marks) : undefined
      });
      resetTaskForm();
      setIsAddTaskDialogOpen(false);
      toast.success('Task added successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleUpdateTask = () => {
    if (editingTask && taskFormData.description.trim()) {
      updateTask(editingTask.id, {
        description: taskFormData.description.trim(),
        targetDate: taskFormData.targetDate,
        priority: taskFormData.priority,
        estimatedMinutes: taskFormData.estimatedMinutes ? parseInt(taskFormData.estimatedMinutes) : undefined,
        marks: taskFormData.marks ? parseInt(taskFormData.marks) : undefined
      });
      setEditingTask(null);
      resetTaskForm();
      toast.success('Task updated');
    }
  };

  const handleAddExam = () => {
    if (examFormData.title.trim() && examFormData.subjectId && examFormData.examDate) {
      addExam({
        subjectId: examFormData.subjectId,
        title: examFormData.title.trim(),
        examDate: examFormData.examDate,
        syllabus: examFormData.syllabus,
        preparationStatus: examFormData.preparationStatus,
        notes: examFormData.notes
      });
      resetExamForm();
      setIsAddExamDialogOpen(false);
      toast.success('Exam added successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleUpdateExam = () => {
    if (editingExam && examFormData.title.trim()) {
      updateExam(editingExam.id, {
        title: examFormData.title.trim(),
        examDate: examFormData.examDate,
        syllabus: examFormData.syllabus,
        preparationStatus: examFormData.preparationStatus,
        notes: examFormData.notes
      });
      setEditingExam(null);
      resetExamForm();
      toast.success('Exam updated');
    }
  };

  const handleAddSession = () => {
    if (sessionFormData.title.trim() && sessionFormData.subjectId) {
      addSession({
        subjectId: sessionFormData.subjectId,
        title: sessionFormData.title.trim(),
        sessionDate: sessionFormData.sessionDate,
        startTime: sessionFormData.startTime,
        endTime: sessionFormData.endTime,
        notes: sessionFormData.notes,
        completed: false
      });
      resetSessionForm();
      setIsAddSessionDialogOpen(false);
      toast.success('Study session added');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleUpdateSession = () => {
    if (editingSession && sessionFormData.title.trim()) {
      updateSession(editingSession.id, {
        title: sessionFormData.title.trim(),
        sessionDate: sessionFormData.sessionDate,
        startTime: sessionFormData.startTime,
        endTime: sessionFormData.endTime,
        notes: sessionFormData.notes
      });
      setEditingSession(null);
      resetSessionForm();
      toast.success('Session updated');
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      subjectId: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      estimatedMinutes: '',
      marks: ''
    });
  };

  const resetExamForm = () => {
    setExamFormData({
      subjectId: '',
      title: '',
      examDate: '',
      syllabus: '',
      preparationStatus: 'not_started',
      notes: ''
    });
  };

  const resetSessionForm = () => {
    setSessionFormData({
      subjectId: '',
      title: '',
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      notes: ''
    });
  };

  const openEditTask = (task: StudyTask) => {
    setEditingTask(task);
    setTaskFormData({
      subjectId: task.subjectId || '',
      description: task.description,
      targetDate: task.targetDate,
      priority: task.priority || 'medium',
      estimatedMinutes: task.estimatedMinutes?.toString() || '',
      marks: task.marks?.toString() || ''
    });
  };

  const openEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamFormData({
      subjectId: exam.subjectId,
      title: exam.title,
      examDate: exam.examDate,
      syllabus: exam.syllabus || '',
      preparationStatus: exam.preparationStatus,
      notes: exam.notes || ''
    });
  };

  const openEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSessionFormData({
      subjectId: session.subjectId,
      title: session.title,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      notes: session.notes || ''
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.targetDate === dateStr);
    const dayExams = exams.filter(e => e.examDate === dateStr);
    const daySessions = sessions.filter(s => s.sessionDate === dateStr);
    return { tasks: dayTasks, exams: dayExams, sessions: daySessions };
  };

  const stats = {
    total: tasks.length,
    pending: getPendingTasks().length,
    completed: getCompletedTasks().length,
    overdue: overdueTasks.length,
    today: todaysTasks.length,
    upcomingExams: upcomingExams.length,
    overdueExams: overdueExams.length,
    todaySessions: todaysSessions.length,
    upcomingSessions: upcomingSessions.length
  };

  const calendarDays = getDaysInMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Academic Planner</h2>
          <p className="text-muted-foreground mt-1">Manage tasks, exams, and study sessions</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <TaskDialog
              formData={taskFormData}
              setFormData={setTaskFormData}
              subjects={subjects}
              onSubmit={handleAddTask}
              title="Add New Task"
            />
          </Dialog>

          <Dialog open={isAddExamDialogOpen} onOpenChange={setIsAddExamDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <BookOpen className="w-4 h-4" />
                Add Exam
              </Button>
            </DialogTrigger>
            <ExamDialog
              formData={examFormData}
              setFormData={setExamFormData}
              subjects={subjects}
              onSubmit={handleAddExam}
              title="Add New Exam"
            />
          </Dialog>

          <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <Timer className="w-4 h-4" />
                Add Session
              </Button>
            </DialogTrigger>
            <SessionDialog
              formData={sessionFormData}
              setFormData={setSessionFormData}
              subjects={subjects}
              onSubmit={handleAddSession}
              title="Add Study Session"
            />
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon={<ClipboardList className="w-6 h-6 text-white" />} value={stats.total} label="Total Tasks" color="from-violet-400 to-purple-500" />
        <StatCard icon={<Clock className="w-6 h-6 text-white" />} value={stats.pending} label="Pending" color="from-amber-400 to-orange-500" />
        <StatCard icon={<CheckCircle2 className="w-6 h-6 text-white" />} value={stats.completed} label="Completed" color="from-emerald-400 to-teal-500" />
        <StatCard icon={<AlertTriangle className="w-6 h-6 text-white" />} value={stats.overdue} label="Overdue" color="from-rose-400 to-red-500" />
        <StatCard icon={<BookOpen className="w-6 h-6 text-white" />} value={stats.upcomingExams} label="Upcoming Exams" color="from-blue-400 to-indigo-500" />
        <StatCard icon={<Timer className="w-6 h-6 text-white" />} value={stats.upcomingSessions} label="Study Sessions" color="from-cyan-400 to-blue-500" />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 rounded-xl h-12">
          <TabsTrigger value="tasks" className="rounded-lg">Tasks ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg">Calendar</TabsTrigger>
          <TabsTrigger value="exams" className="rounded-lg">Exams ({upcomingExams.length})</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-lg">Sessions ({upcomingSessions.length})</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <EmptyState message="No pending tasks" subMessage="All caught up!" />
            ) : (
              pendingTasks.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskStatus(task.id)}
                  onEdit={() => openEditTask(task)}
                  onDelete={() => setTaskToDelete(task)}
                  getStatus={getTaskStatus}
                  getSubjectName={getSubjectName}
                  getSubjectColor={getSubjectColor}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Completed ({completedTasks.length})
              </h3>
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskStatus(task.id)}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => setTaskToDelete(task)}
                    getStatus={getTaskStatus}
                    getSubjectName={getSubjectName}
                    getSubjectColor={getSubjectColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <Card className="border-0">
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const events = getEventsForDate(day);
                  const hasEvents = events.tasks.length > 0 || events.exams.length > 0 || events.sessions.length > 0;
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 rounded-xl text-left transition-all
                        ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                        ${isToday(day) ? 'bg-violet-100 dark:bg-violet-900/30' : 'hover:bg-muted'}
                        ${isSelected ? 'ring-2 ring-violet-500' : ''}
                        ${hasEvents ? 'bg-card border border-border' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">{format(day, 'd')}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {events.tasks.slice(0, 2).map((t, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-amber-500" title={t.description} />
                        ))}
                        {events.exams.slice(0, 2).map((e, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-red-500" title={e.title} />
                        ))}
                        {events.sessions.slice(0, 2).map((s, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-blue-500" title={s.title} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <div className="mt-6 p-4 rounded-xl bg-muted/50">
                  <h4 className="font-semibold mb-3">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h4>
                  {(() => {
                    const events = getEventsForDate(selectedDate);
                    if (events.tasks.length === 0 && events.exams.length === 0 && events.sessions.length === 0) {
                      return <p className="text-sm text-muted-foreground">No events scheduled</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {events.tasks.map(t => (
                          <div key={t.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>{t.description}</span>
                            <Badge variant="secondary" className="ml-auto">{getSubjectName(t.subjectId || '')}</Badge>
                          </div>
                        ))}
                        {events.exams.map(e => (
                          <div key={e.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span>Exam: {e.title}</span>
                            <Badge variant="destructive" className="ml-auto">{getSubjectName(e.subjectId)}</Badge>
                          </div>
                        ))}
                        {events.sessions.map(s => (
                          <div key={s.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>{s.title} ({s.startTime} - {s.endTime})</span>
                            <Badge className="ml-auto bg-blue-500">{getSubjectName(s.subjectId)}</Badge>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4 mt-6">
          {upcomingExams.length === 0 && overdueExams.length === 0 ? (
            <EmptyState message="No exams scheduled" subMessage="Add your first exam to get started" />
          ) : (
            <>
              {overdueExams.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-rose-500 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue ({overdueExams.length})
                  </h3>
                  {overdueExams.map(exam => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      onEdit={() => openEditExam(exam)}
                      onDelete={() => setExamToDelete(exam)}
                      onStatusChange={(status) => updateExam(exam.id, { preparationStatus: status })}
                      getSubjectName={getSubjectName}
                      getSubjectColor={getSubjectColor}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Exams ({upcomingExams.length})
                </h3>
                {upcomingExams.map(exam => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onEdit={() => openEditExam(exam)}
                    onDelete={() => setExamToDelete(exam)}
                    onStatusChange={(status) => updateExam(exam.id, { preparationStatus: status })}
                    getSubjectName={getSubjectName}
                    getSubjectColor={getSubjectColor}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4 mt-6">
          {upcomingSessions.length === 0 ? (
            <EmptyState message="No study sessions scheduled" subMessage="Add a study session to plan your time" />
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map(session => (
                <div key={session.id} className="flex items-start gap-4 p-4 rounded-2xl border bg-card border-border">
                  <button onClick={() => { const completed = sessions.find(s => s.id === session.id)?.completed; updateSession(session.id, { completed: !completed }); }} className="mt-1 flex-shrink-0">
                    {session.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-muted-foreground hover:text-violet-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${session.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{session.title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSubjectColor(session.subjectId) }} />
                        <span className="text-xs text-muted-foreground">{getSubjectName(session.subjectId)}</span>
                      </div>
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        {new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        {session.startTime} - {session.endTime}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditSession(session)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500" onClick={() => setSessionToDelete(session)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => { setEditingTask(null); resetTaskForm(); }}>
        <DialogContent className="sm:max-w-lg card-modern border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Task</DialogTitle>
          </DialogHeader>
          <TaskDialog
            formData={taskFormData}
            setFormData={setTaskFormData}
            subjects={subjects}
            onSubmit={handleUpdateTask}
            title="Update Task"
            isEdit
          />
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editingExam} onOpenChange={() => { setEditingExam(null); resetExamForm(); }}>
        <DialogContent className="sm:max-w-lg card-modern border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Exam</DialogTitle>
          </DialogHeader>
          <ExamDialog
            formData={examFormData}
            setFormData={setExamFormData}
            subjects={subjects}
            onSubmit={handleUpdateExam}
            title="Update Exam"
            isEdit
          />
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={!!editingSession} onOpenChange={() => { setEditingSession(null); resetSessionForm(); }}>
        <DialogContent className="sm:max-w-lg card-modern border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Study Session</DialogTitle>
          </DialogHeader>
          <SessionDialog
            formData={sessionFormData}
            setFormData={setSessionFormData}
            subjects={subjects}
            onSubmit={handleUpdateSession}
            title="Update Session"
            isEdit
          />
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete && `"${taskToDelete.description}" will be permanently removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (taskToDelete) { deleteTask(taskToDelete.id); setTaskToDelete(null); toast.success('Task deleted'); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Exam Confirmation */}
      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {examToDelete && `"${examToDelete.title}" will be permanently removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (examToDelete) { deleteExam(examToDelete.id); setExamToDelete(null); toast.success('Exam deleted'); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Session Confirmation */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToDelete && `"${sessionToDelete.title}" will be permanently removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (sessionToDelete) { deleteSession(sessionToDelete.id); setSessionToDelete(null); toast.success('Session deleted'); } }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ========== Sub-Components ==========

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <Card className="card-modern card-hover border-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message, subMessage }: { message: string; subMessage: string }) {
  return (
    <Card className="card-modern border-0">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
      </CardContent>
    </Card>
  );
}

interface TaskDialogProps {
  formData: {
    subjectId: string;
    description: string;
    targetDate: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: string;
    marks: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    subjectId: string;
    description: string;
    targetDate: string;
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: string;
    marks: string;
  }>>;
  subjects: { id: string; name: string }[];
  onSubmit: () => void;
  title: string;
  isEdit?: boolean;
}

function TaskDialog({ formData, setFormData, subjects, onSubmit, title, isEdit }: TaskDialogProps) {
  return (
    <DialogContent className="sm:max-w-lg card-modern border-0">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-white" />
          </div>
          {title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div>
          <Label className="text-sm font-medium">Subject *</Label>
          <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
            <SelectTrigger className="mt-1.5 rounded-xl h-12">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Task Description *</Label>
          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., Complete Chapter 5 exercises" className="mt-1.5 rounded-xl h-12" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Est. Time (mins)</Label>
            <Input type="number" value={formData.estimatedMinutes} onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })} placeholder="e.g. 60" className="mt-1.5 rounded-xl h-12" />
          </div>
          <div>
            <Label className="text-sm font-medium">Marks / Weight</Label>
            <Input type="number" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: e.target.value })} placeholder="e.g. 100" className="mt-1.5 rounded-xl h-12" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Target Date *</Label>
          <Input type="date" value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} className="mt-1.5 rounded-xl h-12" />
        </div>
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' })}>
            <SelectTrigger className="mt-1.5 rounded-xl h-12">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onSubmit} className="w-full btn-gradient rounded-xl h-12">
          {isEdit ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </DialogContent>
  );
}

interface ExamDialogProps {
  formData: {
    subjectId: string;
    title: string;
    examDate: string;
    syllabus: string;
    preparationStatus: 'not_started' | 'in_progress' | 'completed';
    notes: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    subjectId: string;
    title: string;
    examDate: string;
    syllabus: string;
    preparationStatus: 'not_started' | 'in_progress' | 'completed';
    notes: string;
  }>>;
  subjects: { id: string; name: string }[];
  onSubmit: () => void;
  title: string;
  isEdit?: boolean;
}

function ExamDialog({ formData, setFormData, subjects, onSubmit, title, isEdit }: ExamDialogProps) {
  return (
    <DialogContent className="sm:max-w-lg card-modern border-0">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div>
          <Label className="text-sm font-medium">Subject *</Label>
          <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
            <SelectTrigger className="mt-1.5 rounded-xl h-12">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Exam Title *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Midterm Exam" className="mt-1.5 rounded-xl h-12" />
        </div>
        <div>
          <Label className="text-sm font-medium">Exam Date *</Label>
          <Input type="date" value={formData.examDate} onChange={(e) => setFormData({ ...formData, examDate: e.target.value })} className="mt-1.5 rounded-xl h-12" />
        </div>
        <div>
          <Label className="text-sm font-medium">Syllabus</Label>
          <Input value={formData.syllabus} onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })} placeholder="Topics to cover" className="mt-1.5 rounded-xl h-12" />
        </div>
        <div>
          <Label className="text-sm font-medium">Preparation Status</Label>
          <Select value={formData.preparationStatus} onValueChange={(v) => setFormData({ ...formData, preparationStatus: v as 'not_started' | 'in_progress' | 'completed' })}>
            <SelectTrigger className="mt-1.5 rounded-xl h-12">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes" className="mt-1.5 rounded-xl h-12" />
        </div>
        <Button onClick={onSubmit} className="w-full btn-gradient rounded-xl h-12">
          {isEdit ? 'Update Exam' : 'Add Exam'}
        </Button>
      </div>
    </DialogContent>
  );
}

interface SessionDialogProps {
  formData: {
    subjectId: string;
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    notes: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    subjectId: string;
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    notes: string;
  }>>;
  subjects: { id: string; name: string }[];
  onSubmit: () => void;
  title: string;
  isEdit?: boolean;
}

function SessionDialog({ formData, setFormData, subjects, onSubmit, title, isEdit }: SessionDialogProps) {
  return (
    <DialogContent className="sm:max-w-lg card-modern border-0">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Timer className="w-5 h-5 text-white" />
          </div>
          {title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div>
          <Label className="text-sm font-medium">Subject *</Label>
          <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
            <SelectTrigger className="mt-1.5 rounded-xl h-12">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">Session Title *</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Study Chapter 5" className="mt-1.5 rounded-xl h-12" />
        </div>
        <div>
          <Label className="text-sm font-medium">Date *</Label>
          <Input type="date" value={formData.sessionDate} onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })} className="mt-1.5 rounded-xl h-12" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Start Time *</Label>
            <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="mt-1.5 rounded-xl h-12" />
          </div>
          <div>
            <Label className="text-sm font-medium">End Time *</Label>
            <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="mt-1.5 rounded-xl h-12" />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Session notes" className="mt-1.5 rounded-xl h-12" />
        </div>
        <Button onClick={onSubmit} className="w-full btn-gradient rounded-xl h-12">
          {isEdit ? 'Update Session' : 'Add Session'}
        </Button>
      </div>
    </DialogContent>
  );
}

interface TaskCardProps {
  task: StudyTask;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getStatus: (task: StudyTask) => string;
  getSubjectName: (id: string) => string;
  getSubjectColor: (id: string) => string;
  formatDate: (date: string) => string;
}

function TaskCard({ task, onToggle, onEdit, onDelete, getStatus, getSubjectName, getSubjectColor, formatDate }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const status = getStatus(task);
  const subjectColor = task.subjectId ? getSubjectColor(task.subjectId) : '#ccc';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-muted/30 border-muted' : 'bg-card border-border'} ${status === 'overdue' ? 'border-rose-200 dark:border-rose-800 bg-rose-50/30' : ''} ${status === 'due_today' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30' : ''}`}>
      <button onClick={onToggle} className="mt-1 flex-shrink-0">
        {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-muted-foreground hover:text-violet-500" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.description}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
            <span className="text-xs text-muted-foreground">{task.subjectId ? getSubjectName(task.subjectId) : 'No Subject'}</span>
          </div>
          <Badge variant="secondary" className="rounded-lg text-xs">{formatDate(task.targetDate)}</Badge>
          <Badge className={`rounded-lg text-xs ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}>
            {task.priority?.charAt(0).toUpperCase()}{task.priority?.slice(1)}
          </Badge>
          {status === 'overdue' && <Badge variant="destructive" className="rounded-lg text-xs">Overdue</Badge>}
          {status === 'due_today' && !isCompleted && <Badge className="rounded-lg text-xs bg-amber-500">Due Today</Badge>}
          {status === 'urgent' && !isCompleted && <Badge className="rounded-lg text-xs bg-orange-500">Urgent</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

interface ExamCardProps {
  exam: Exam;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: 'not_started' | 'in_progress' | 'completed') => void;
  getSubjectName: (id: string) => string;
  getSubjectColor: (id: string) => string;
}

function ExamCard({ exam, onEdit, onDelete, onStatusChange, getSubjectName, getSubjectColor }: ExamCardProps) {
  const subjectColor = getSubjectColor(exam.subjectId);
  const daysUntil = Math.ceil((new Date(exam.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border bg-card border-border">
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{exam.title}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
            <span className="text-xs text-muted-foreground">{getSubjectName(exam.subjectId)}</span>
          </div>
          <Badge variant="secondary" className="rounded-lg text-xs">
            {new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Badge>
          <Badge className={`rounded-lg text-xs ${daysUntil <= 3 ? 'bg-rose-500' : daysUntil <= 7 ? 'bg-amber-500' : 'bg-blue-500'}`}>
            {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Overdue'}
          </Badge>
        </div>
        <div className="mt-2">
          <Select value={exam.preparationStatus} onValueChange={(v) => onStatusChange(v as 'not_started' | 'in_progress' | 'completed')}>
            <SelectTrigger className="w-40 h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

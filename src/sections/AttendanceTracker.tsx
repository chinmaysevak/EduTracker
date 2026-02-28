// ============================================
// Attendance Tracker - Modern Design
// ============================================

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Minus,
  Calendar as CalendarIcon,
  Trash2,
  TrendingUp,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Filter,
  Award,
  AlertCircle,
  BookOpen,
  Percent,
  CalendarCheck,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSubjects, useAttendance, useTimetable } from '@/hooks/useData';
import { toast } from 'sonner';
import type { AttendanceStatus } from '@/types';
import { AttendancePredictionModal } from '@/components/attendance/AttendancePredictionModal';
import { SubjectManagerModal } from '@/components/subjects/SubjectManagerModal';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function formatDateLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type SortField = 'name' | 'percentage' | 'present' | 'absent' | 'total';
type SortOrder = 'asc' | 'desc';

export default function AttendanceTracker() {
  const { subjects, addSubject, removeSubject } = useSubjects();
  const { attendanceData, markAttendance, calculateSubjectAttendance, getOverallAttendance, getDayAttendance, getMonthlyStats, addExtraClass, removeExtraClass, markExtraClassAttendance, getExtraClasses } = useAttendance();
  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;
  const { isSubjectScheduled } = useTimetable();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatDateLocal(new Date()));
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  // Subject Manager & Prediction State
  const [managingSubjectId, setManagingSubjectId] = useState<string | null>(null);
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('percentage');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'good' | 'warning' | 'critical'>('all');

  const [isAddingExtraClass, setIsAddingExtraClass] = useState(false);
  const [extraClassName, setExtraClassName] = useState('');
  const [extraClassStartTime, setExtraClassStartTime] = useState('');
  const [extraClassEndTime, setExtraClassEndTime] = useState('');

  const extraClasses = getExtraClasses(selectedDate);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const daysFromMonday = (firstDay.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - daysFromMonday);

    const days: Date[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    setCalendarDays(days);
  }, [currentDate]);

  // ... rest of functions ...

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(formatDateLocal(today));
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim());
      setNewSubjectName('');
      setIsAddSubjectOpen(false);
    }
  };

  const handleMarkAttendance = (subjectId: string, status: AttendanceStatus) => {
    const currentStatus = getAttendance(selectedDate, subjectId);
    const newStatus = currentStatus === status ? null : status;
    markAttendance(selectedDate, subjectId, newStatus);
  };

  const getAttendance = (date: string, subjectId: string): AttendanceStatus => {
    const dayData = attendanceData.find(d => d.date === date);
    return dayData?.subjects[subjectId] || null;
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getDaySummary = (date: Date) => {
    const dateStr = formatDateLocal(date);
    const dayData = getDayAttendance(dateStr);
    const subjectsPresent = Object.values(dayData).filter(s => s === 'present').length;
    const subjectsAbsent = Object.values(dayData).filter(s => s === 'absent').length;
    const subjectsCancelled = Object.values(dayData).filter(s => s === 'cancelled').length;
    return { subjectsPresent, subjectsAbsent, subjectsCancelled, total: Object.keys(dayData).length };
  };

  const getScheduledSubjects = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return subjects.filter(s => isSubjectScheduled(s.name, dayOfWeek));
  };

  const overallStats = getOverallAttendance();

  const filteredAndSortedSubjects = useMemo(() => {
    let data = subjects.map(s => {
      const stats = calculateSubjectAttendance(s.id);
      const today = new Date();
      const monthlyStats = getMonthlyStats(s.id, today.getFullYear(), today.getMonth());
      return {
        ...s,
        stats,
        monthlyStats,
        status: stats.percentage >= 75 ? 'good' : stats.percentage >= 60 ? 'warning' : 'critical'
      };
    });

    if (searchQuery) {
      data = data.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterStatus !== 'all') {
      data = data.filter(s => s.status === filterStatus);
    }

    data.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'percentage':
          comparison = a.stats.percentage - b.stats.percentage;
          break;
        case 'present':
          comparison = a.stats.present - b.stats.present;
          break;
        case 'absent':
          comparison = (a.stats.total - a.stats.present) - (b.stats.total - b.stats.present);
          break;
        case 'total':
          comparison = a.stats.total - b.stats.total;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [subjects, attendanceData, searchQuery, filterStatus, sortField, sortOrder]);

  const selectedDayScheduled = getScheduledSubjects();
  const selectedDayAllSubjects = subjects;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleAddExtraClass = () => {
    if (extraClassName.trim()) {
      addExtraClass(
        selectedDate,
        extraClassName.trim(),
        extraClassStartTime || undefined,
        extraClassEndTime || undefined
      );
      setExtraClassName('');
      setExtraClassStartTime('');
      setExtraClassEndTime('');
      setIsAddingExtraClass(false);
    }
  };

  const handleMarkExtraClassAttendance = (extraClassId: string, status: AttendanceStatus) => {
    const currentStatus = extraClasses.find(ec => ec.id === extraClassId)?.status || null;
    const newStatus = currentStatus === status ? null : status;
    markExtraClassAttendance(selectedDate, extraClassId, newStatus);
  };

  const handleExportCSV = () => {
    const rows: { date: string; subject: string; status: string }[] = [];
    attendanceData.forEach(day => {
      Object.entries(day.subjects).forEach(([subjectId, status]) => {
        rows.push({
          date: day.date,
          subject: getSubjectName(subjectId),
          status: status || ''
        });
      });
      (day.extraClasses || []).forEach(ec => {
        rows.push({
          date: day.date,
          subject: ec.name,
          status: ec.status || ''
        });
      });
    });
    if (rows.length === 0) {
      toast.info('No attendance data to export.');
      return;
    }
    const header = 'Date,Subject,Status';
    const csv = [header, ...rows.map(r => `${r.date},${r.subject.replace(/,/g, ';')},${r.status}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance exported.');
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 75) return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0"><Award className="w-3 h-3 mr-1" /> Good</Badge>;
    if (percentage >= 60) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0"><AlertCircle className="w-3 h-3 mr-1" /> Warning</Badge>;
    return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-0"><X className="w-3 h-3 mr-1" /> Critical</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Attendance Tracker</h2>
          <p className="text-muted-foreground mt-1">Monitor your class attendance and performance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800" onClick={() => setIsPredictionOpen(true)}>
            <TrendingUp className="w-4 h-4" />
            Forecast
          </Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md card-modern border-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  Add New Subject
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label className="text-sm font-medium">Subject Name</Label>
                  <Input
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g., Data Structures"
                    className="mt-1.5 rounded-xl h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  />
                </div>
                <Button onClick={handleAddSubject} className="w-full btn-gradient rounded-xl h-12">
                  Add Subject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {/* Stats Overview - Modern Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* ... existing stats cards ... */}
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${overallStats.percentage >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                overallStats.percentage >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                }`}>
                {overallStats.percentage >= 75 ? 'Excellent' : overallStats.percentage >= 60 ? 'Good' : 'At Risk'}
              </div>
            </div>
            <p className="text-3xl font-bold">{overallStats.percentage}%</p>
            <p className="text-sm text-muted-foreground mt-1">Overall Attendance</p>
            <p className="text-xs text-muted-foreground mt-2">{overallStats.present}/{overallStats.total} classes</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{overallStats.present}</p>
            <p className="text-sm text-muted-foreground mt-1">Classes Present</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-500">{overallStats.total - overallStats.present}</p>
            <p className="text-sm text-muted-foreground mt-1">Classes Absent</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{subjects.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Subjects</p>
          </CardContent>
        </Card>
      </div>



      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Modern Design */}
        <Card className="lg:col-span-2 card-modern border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
                  <p className="text-sm text-muted-foreground">Select a date to mark attendance</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-10 w-10 rounded-xl">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="h-10 rounded-xl">Today</Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-10 w-10 rounded-xl">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dateStr = formatDateLocal(date);
                const isSelected = dateStr === selectedDate;
                const summary = getDaySummary(date);
                const hasData = summary.total > 0;
                const dayOfWeek = date.getDay();
                const scheduledCount = subjects.filter(s => isSubjectScheduled(s.name, dayOfWeek)).length;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                      min-h-[80px] p-2 rounded-2xl border-2 transition-all duration-300 text-left relative
                      ${isCurrentMonth(date) ? 'bg-card' : 'bg-muted/30'}
                      ${isSelected ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/20 shadow-lg shadow-violet-500/20' : 'border-transparent hover:border-border'}
                      ${isToday(date) && !isSelected ? 'ring-2 ring-violet-500/30' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-semibold
                      ${isCurrentMonth(date) ? 'text-foreground' : 'text-muted-foreground'}
                      ${isToday(date) ? 'bg-violet-500 text-white px-2 py-0.5 rounded-lg' : ''}
                    `}>
                      {date.getDate()}
                    </span>

                    {hasData && (
                      <div className="flex gap-0.5 mt-2 flex-wrap">
                        {summary.subjectsPresent > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        {summary.subjectsAbsent > 0 && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                        {summary.subjectsCancelled > 0 && (
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>
                    )}

                    {scheduledCount > 0 && !hasData && (
                      <div className="absolute bottom-2 right-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-muted-foreground">Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Attendance Panel - Modern */}
        <Card className="card-modern border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  {(() => {
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                  })()}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDayScheduled.length > 0 ? `${selectedDayScheduled.length} classes scheduled` : 'No classes scheduled'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayScheduled.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled Classes</p>
                {selectedDayScheduled.map(subject => {
                  const status = getAttendance(selectedDate, subject.id);
                  return (
                    <SubjectAttendanceRow
                      key={subject.id}
                      subject={subject}
                      status={status}
                      onMark={(s) => handleMarkAttendance(subject.id, s)}
                    />
                  );
                })}
              </div>
            )}

            {(extraClasses.length > 0 || isAddingExtraClass) && (
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Extra Classes</p>
                  {!isAddingExtraClass && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setIsAddingExtraClass(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  )}
                </div>

                {isAddingExtraClass && (
                  <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 space-y-3">
                    <Input
                      placeholder="Subject name"
                      value={extraClassName}
                      onChange={(e) => setExtraClassName(e.target.value)}
                      className="rounded-xl h-10"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={extraClassStartTime}
                        onChange={(e) => setExtraClassStartTime(e.target.value)}
                        className="rounded-xl h-10"
                      />
                      <Input
                        type="time"
                        value={extraClassEndTime}
                        onChange={(e) => setExtraClassEndTime(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-10 rounded-xl btn-gradient"
                        onClick={handleAddExtraClass}
                        disabled={!extraClassName.trim()}
                      >
                        <Check className="w-4 h-4 mr-1" /> Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => {
                          setIsAddingExtraClass(false);
                          setExtraClassName('');
                          setExtraClassStartTime('');
                          setExtraClassEndTime('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {extraClasses.map(extraClass => (
                  <div
                    key={extraClass.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/30 dark:bg-violet-900/10 border border-violet-200/50 dark:border-violet-800/50 group"
                  >
                    <div
                      className="w-2 h-10 rounded-full"
                      style={{ backgroundColor: extraClass.color || '#8b5cf6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{extraClass.name}</p>
                      {(extraClass.startTime || extraClass.endTime) && (
                        <p className="text-xs text-muted-foreground">
                          {extraClass.startTime} {extraClass.endTime && `- ${extraClass.endTime}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMarkExtraClassAttendance(extraClass.id, 'present')}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${extraClass.status === 'present'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted hover:bg-emerald-100 hover:text-emerald-600'
                          }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMarkExtraClassAttendance(extraClass.id, 'absent')}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${extraClass.status === 'absent'
                          ? 'bg-rose-500 text-white'
                          : 'bg-muted hover:bg-rose-100 hover:text-rose-600'
                          }`}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removeExtraClass(selectedDate, extraClass.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-rose-100 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDayAllSubjects.filter(s => !selectedDayScheduled.find(ss => ss.id === s.id)).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other Subjects</p>
                {selectedDayAllSubjects
                  .filter(s => !selectedDayScheduled.find(ss => ss.id === s.id))
                  .map(subject => {
                    const status = getAttendance(selectedDate, subject.id);
                    return (
                      <SubjectAttendanceRow
                        key={subject.id}
                        subject={subject}
                        status={status}
                        onMark={(s) => handleMarkAttendance(subject.id, s)}
                      />
                    );
                  })}
              </div>
            )}

            {!isAddingExtraClass && extraClasses.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 rounded-xl border-dashed border-violet-300 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                onClick={() => setIsAddingExtraClass(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Extra Class
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Subject Table - Modern */}
      <Card className="card-modern border-0">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Subject-wise Attendance</CardTitle>
                <p className="text-sm text-muted-foreground">Detailed breakdown by subject</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl w-full sm:w-56"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-11 rounded-xl">
                    <Filter className="w-4 h-4" />
                    {filterStatus === 'all' ? 'All' : filterStatus === 'good' ? 'Good' : filterStatus === 'warning' ? 'Warning' : 'Critical'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Subjects</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('good')}>Good (≥75%)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('warning')}>Warning (60-74%)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('critical')}>Critical (&lt;60%)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <button className="col-span-4 flex items-center gap-1 hover:text-foreground" onClick={() => handleSort('name')}>
              Subject <ArrowUpDown className="w-3 h-3" />
            </button>
            <button className="col-span-2 flex items-center justify-center gap-1 hover:text-foreground" onClick={() => handleSort('percentage')}>
              Attendance <ArrowUpDown className="w-3 h-3" />
            </button>
            <button className="col-span-1 flex items-center justify-center gap-1 hover:text-foreground" onClick={() => handleSort('present')}>
              Present <ArrowUpDown className="w-3 h-3" />
            </button>
            <button className="col-span-1 flex items-center justify-center gap-1 hover:text-foreground" onClick={() => handleSort('absent')}>
              Absent <ArrowUpDown className="w-3 h-3" />
            </button>
            <button className="col-span-1 flex items-center justify-center gap-1 hover:text-foreground" onClick={() => handleSort('total')}>
              Total <ArrowUpDown className="w-3 h-3" />
            </button>
            <div className="col-span-3">Progress</div>
          </div>

          {/* Table Body */}
          <div className="space-y-2 mt-4">
            {filteredAndSortedSubjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground">No subjects found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Add subjects to start tracking attendance'}
                </p>
              </div>
            ) : (
              filteredAndSortedSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="group flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300"
                >
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: subject.color || '#6b7280' }}
                    >
                      {subject.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{subject.name}</p>
                      <div className="sm:hidden text-xs text-muted-foreground">
                        {subject.stats.percentage}% • {subject.stats.present} present
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">Attendance:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${subject.stats.percentage >= 75 ? 'text-emerald-600' :
                        subject.stats.percentage >= 60 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                        {subject.stats.percentage}%
                      </span>
                      <span className="hidden sm:inline">{getStatusBadge(subject.stats.percentage)}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">Present:</span>
                    <span className="text-sm font-semibold text-emerald-600">{subject.stats.present}</span>
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">Absent:</span>
                    <span className="text-sm font-semibold text-rose-500">{subject.stats.total - subject.stats.present}</span>
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-xs font-medium text-muted-foreground">Total:</span>
                    <span className="text-sm font-semibold">{subject.stats.total}</span>
                  </div>

                  <div className="sm:col-span-3 flex flex-col justify-center gap-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between text-xs w-full">
                      <span className="font-semibold text-foreground">75% Goal Info</span>
                      {subject.stats.total > 0 && (
                        <span className={`font-medium ${subject.stats.percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(() => {
                            const currentPresent = subject.stats.present;
                            const currentTotal = subject.stats.total;

                            if (subject.stats.percentage >= 75) {
                              const canMiss = Math.floor((currentPresent / 0.75) - currentTotal);
                              return canMiss > 0 ? `Can miss ${canMiss} class${canMiss > 1 ? 'es' : ''}` : 'On track';
                            } else {
                              const needed = Math.ceil((0.75 * currentTotal - currentPresent) / 0.25);
                              return `Need ${needed} class${needed > 1 ? 'es' : ''}`;
                            }
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden w-full relative">
                      {/* Target 75% Line Marker */}
                      <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-foreground/20 z-10" />

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${subject.stats.percentage >= 75 ? 'bg-emerald-500' :
                            subject.stats.percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        style={{ width: `${subject.stats.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center w-full mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setManagingSubjectId(subject.id);
                        }}
                        className="text-[10px] font-medium text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        Manage Topics
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          className="text-rose-600"
                          onClick={() => removeSubject(subject.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Subject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredAndSortedSubjects.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Good: {filteredAndSortedSubjects.filter(s => s.stats.percentage >= 75).length}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Warning: {filteredAndSortedSubjects.filter(s => s.stats.percentage >= 60 && s.stats.percentage < 75).length}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Critical: {filteredAndSortedSubjects.filter(s => s.stats.percentage < 60).length}</span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <SubjectManagerModal
        subjectId={managingSubjectId}
        isOpen={!!managingSubjectId}
        onClose={() => setManagingSubjectId(null)}
      />

      <AttendancePredictionModal
        isOpen={isPredictionOpen}
        onClose={() => setIsPredictionOpen(false)}
      />
    </div>
  );
}

// Subject Attendance Row Component
interface SubjectAttendanceRowProps {
  subject: { id: string; name: string; color?: string };
  status: AttendanceStatus;
  onMark: (status: AttendanceStatus) => void;
}

function SubjectAttendanceRow({ subject, status, onMark }: SubjectAttendanceRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
      <div
        className="w-2 h-10 rounded-full"
        style={{ backgroundColor: subject.color || '#9ca3af' }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{subject.name}</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onMark('present')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${status === 'present'
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-muted hover:bg-emerald-100 hover:text-emerald-600'
            }`}
          title="Present"
        >
          <Check className="w-4 h-4" />
        </button>

        <button
          onClick={() => onMark('absent')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${status === 'absent'
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
            : 'bg-muted hover:bg-rose-100 hover:text-rose-600'
            }`}
          title="Absent"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={() => onMark('cancelled')}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${status === 'cancelled'
            ? 'bg-gray-500 text-white'
            : 'bg-muted hover:bg-gray-200'
            }`}
          title="Cancelled"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Data Hooks for All Modules
// ============================================

import { useLocalStorage } from './useLocalStorage';
import { defaultTimetable, defaultCustomTimes, getSubjectColor, generateTimetableWithTimes, extractSubjects } from '@/config/timetable';
import type {
  Subject,
  DailyAttendance,
  StudyMaterial,
  YouTubePlaylist,
  StudyTask,
  CourseProgress,
  AttendanceStatus,
  TimetableSlot,
  Topic,
  FocusSessionLog
} from '@/types';

// Extend types locally if not yet updated in types/index.ts
// Ideally we should update types/index.ts, but for now we patch here to avoid breaking content
// We will update types/index.ts in a separate step to ensure consistency.

// ============================================
// Subjects Hook - With Add/Remove functionality
// ============================================
export function useSubjects(timetableData?: Record<string, string[]>, userId?: string) {
  const initialSubjects = timetableData ? extractSubjects(timetableData) :
    ["Mathematical Aptitude", "Lab On Advance Java", "Optimization Technique", "Cyber Security", "HTML CSS", "Advance Java", "Computer Network", "Lab On HTML"];

  const defaultSubjects: Subject[] = initialSubjects.map((name: string, index: number) => ({
    id: `sub-${index + 1}`,
    name,
    color: getSubjectColor(name),
    difficulty: 3,
    totalTopics: 10
  }));

  const [subjects, setSubjects] = useLocalStorage<Subject[]>('edu-tracker-subjects', defaultSubjects, userId);

  const addSubject = (name: string, difficulty: number = 3): string => {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      color: getSubjectColor(name.trim()),
      difficulty,
      totalTopics: 10
    };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject.id;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);
  const getSubjectByName = (name: string) => subjects.find(s => s.name === name);

  return { subjects, addSubject, updateSubject, removeSubject, getSubjectById, getSubjectByName };
}

// ... existing code ...

// ============================================
// User Profile Hook (Gamification)
// ============================================
import type { UserProfile, Badge } from '@/types';

export function useUserProfile(userId?: string) {
  const defaultProfile: UserProfile = {
    name: 'Student',
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    badges: []
  };

  const [profile, setProfile] = useLocalStorage<UserProfile>('edu-tracker-profile', defaultProfile, userId);

  const addXP = (amount: number) => {
    setProfile(prev => {
      const newXP = prev.xp + amount;
      // Level up every 1000 XP * level
      const xpNeeded = prev.level * 1000;
      let newLevel = prev.level;
      if (newXP >= xpNeeded) {
        newLevel += 1;
        // Optionally trigger level up notification here
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => {
      if (prev.lastStudyDate === today) return prev; // Already updated today

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = prev.currentStreak;

      if (prev.lastStudyDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset streak
      }

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastStudyDate: today
      };
    });
  };

  const awardBadge = (badge: Badge) => {
    setProfile(prev => {
      if (prev.badges.some(b => b.id === badge.id)) return prev;
      return { ...prev, badges: [...prev.badges, badge] };
    });
  };

  return { profile, addXP, updateStreak, awardBadge, setProfile };
}

// ============================================
// Academic Insights Hook
// ============================================
import { calculateAttendanceSafeZone, calculateSubjectPriority, calculateExamReadiness } from '@/lib/academicMath';

export function useAcademicInsights() {
  const { subjects } = useSubjects();
  const { calculateSubjectAttendance } = useAttendance();
  const { tasks } = useStudyTasks();

  const getSubjectInsights = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return null;

    const attendance = calculateSubjectAttendance(subjectId);
    const attendanceAnalysis = calculateAttendanceSafeZone(attendance.present, attendance.total);

    const priorityScore = calculateSubjectPriority(subject, tasks);

    // Calculate pseudo 'assignments completed' for readiness
    const subjectTasks = tasks.filter(t => t.subjectId === subjectId);
    const completedTasks = subjectTasks.filter(t => t.status === 'completed').length;

    const readiness = calculateExamReadiness(
      subject,
      attendance.percentage,
      completedTasks,
      subjectTasks.length
    );

    return {
      attendanceAnalysis,
      priorityScore,
      readiness
    };
  };

  const getTopPrioritySubjects = () => {
    return subjects
      .map(s => ({ subject: s, score: calculateSubjectPriority(s, tasks) }))
      .sort((a, b) => b.score - a.score);
  };

  return { getSubjectInsights, getTopPrioritySubjects };
}


// ============================================
// Attendance Hook - Per-subject tracking
// ============================================
export function useAttendance(userId?: string) {
  const [attendanceData, setAttendanceData] = useLocalStorage<DailyAttendance[]>('edu-tracker-attendance-v2', [], userId);

  const markAttendance = (date: string, subjectId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);

      if (dayIndex === -1) {
        if (status === null) return prev;
        return [...prev, { date, subjects: { [subjectId]: status } }];
      }

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };

      if (status === null) {
        const { [subjectId]: _, ...rest } = dayData.subjects;
        dayData.subjects = rest;
        if (Object.keys(dayData.subjects).length === 0 && (!dayData.extraClasses || dayData.extraClasses.length === 0)) {
          return prev.filter(d => d.date !== date);
        }
      } else {
        dayData.subjects = { ...dayData.subjects, [subjectId]: status };
      }

      updated[dayIndex] = dayData;
      return updated;
    });
  };

  // Add extra class for a specific date
  const addExtraClass = (date: string, name: string, startTime?: string, endTime?: string) => {
    const newExtraClass = {
      id: `extra-${Date.now()}`,
      name: name.trim(),
      startTime,
      endTime,
      status: null as AttendanceStatus,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
    };

    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);

      if (dayIndex === -1) {
        return [...prev, { date, subjects: {}, extraClasses: [newExtraClass] }];
      }

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };
      dayData.extraClasses = [...(dayData.extraClasses || []), newExtraClass];
      updated[dayIndex] = dayData;
      return updated;
    });

    return newExtraClass.id;
  };

  // Remove extra class from a specific date
  const removeExtraClass = (date: string, extraClassId: string) => {
    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);

      if (dayIndex === -1) return prev;

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };
      dayData.extraClasses = (dayData.extraClasses || []).filter(ec => ec.id !== extraClassId);

      // Remove day if no subjects and no extra classes
      if (Object.keys(dayData.subjects).length === 0 && dayData.extraClasses.length === 0) {
        return prev.filter(d => d.date !== date);
      }

      updated[dayIndex] = dayData;
      return updated;
    });
  };

  // Mark attendance for extra class
  const markExtraClassAttendance = (date: string, extraClassId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);

      if (dayIndex === -1) return prev;

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };

      if (!dayData.extraClasses) return prev;

      dayData.extraClasses = dayData.extraClasses.map(ec =>
        ec.id === extraClassId ? { ...ec, status } : ec
      );

      updated[dayIndex] = dayData;
      return updated;
    });
  };

  // Get extra classes for a specific date
  const getExtraClasses = (date: string): import('@/types').ExtraClass[] => {
    const dayData = attendanceData.find(d => d.date === date);
    return dayData?.extraClasses || [];
  };

  const getAttendance = (date: string, subjectId: string): AttendanceStatus => {
    const dayData = attendanceData.find(d => d.date === date);
    return dayData?.subjects[subjectId] || null;
  };

  const getDayAttendance = (date: string): Record<string, AttendanceStatus> => {
    const dayData = attendanceData.find(d => d.date === date);
    return dayData?.subjects || {};
  };

  const calculateSubjectAttendance = (subjectId: string): { percentage: number; present: number; total: number } => {
    const relevantDays = attendanceData.filter(day => day.subjects[subjectId] !== undefined);
    const validRecords = relevantDays.filter(day => day.subjects[subjectId] !== 'cancelled');

    if (validRecords.length === 0) return { percentage: 0, present: 0, total: 0 };

    const presentCount = validRecords.filter(day => day.subjects[subjectId] === 'present').length;
    return {
      percentage: Math.round((presentCount / validRecords.length) * 100),
      present: presentCount,
      total: validRecords.length
    };
  };

  const getOverallAttendance = (): { percentage: number; present: number; total: number } => {
    let totalPresent = 0;
    let totalClasses = 0;

    attendanceData.forEach(day => {
      Object.entries(day.subjects).forEach(([_, status]) => {
        if (status !== 'cancelled') {
          totalClasses++;
          if (status === 'present') totalPresent++;
        }
      });
    });

    return {
      percentage: totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0,
      present: totalPresent,
      total: totalClasses
    };
  };

  const getMonthlyStats = (subjectId: string, year: number, month: number) => {
    const monthData = attendanceData.filter(day => {
      const date = new Date(day.date);
      return date.getFullYear() === year && date.getMonth() === month && day.subjects[subjectId];
    });

    const present = monthData.filter(d => d.subjects[subjectId] === 'present').length;
    const absent = monthData.filter(d => d.subjects[subjectId] === 'absent').length;
    const cancelled = monthData.filter(d => d.subjects[subjectId] === 'cancelled').length;

    return { present, absent, cancelled, total: present + absent };
  };

  return {
    attendanceData,
    markAttendance,
    getAttendance,
    getDayAttendance,
    calculateSubjectAttendance,
    getOverallAttendance,
    getMonthlyStats,
    addExtraClass,
    removeExtraClass,
    markExtraClassAttendance,
    getExtraClasses
  };
}

// ============================================
// Timetable Hook - Now editable with localStorage
// ============================================
export function useTimetable(userId?: string) {
  const [timetableData, setTimetableData] = useLocalStorage<Record<string, string[]>>('edu-tracker-timetable-data', defaultTimetable, userId);
  const [customTimes, setCustomTimes] = useLocalStorage<Record<string, { startTime: string; endTime: string }[]>>('edu-tracker-timetable-times', defaultCustomTimes, userId);

  const fullTimetable = generateTimetableWithTimes(timetableData, customTimes);

  const getTimetableForDay = (dayOfWeek: number): TimetableSlot[] => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const daySchedule = fullTimetable.find(d => d.day === dayName);
    return daySchedule?.slots || [];
  };

  const getTodayClasses = (): TimetableSlot[] => {
    const today = new Date().getDay();
    return getTimetableForDay(today);
  };

  const getWeekSchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((day, index) => ({
      day,
      dayIndex: index,
      classes: getTimetableForDay(index)
    }));
  };

  const isSubjectScheduled = (subjectName: string, dayOfWeek: number): boolean => {
    const dayClasses = getTimetableForDay(dayOfWeek);
    return dayClasses.some(c => c.subject === subjectName);
  };

  // Add a class to a specific day
  const addClass = (day: string, subject: string, startTime: string, endTime: string) => {
    setTimetableData(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), subject]
    }));

    setCustomTimes(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { startTime, endTime }]
    }));
  };

  // Remove a class from a specific day
  const removeClass = (day: string, index: number) => {
    setTimetableData(prev => ({
      ...prev,
      [day]: prev[day]?.filter((_, i) => i !== index) || []
    }));

    setCustomTimes(prev => ({
      ...prev,
      [day]: prev[day]?.filter((_, i) => i !== index) || []
    }));
  };

  // Update a class
  const updateClass = (day: string, index: number, updates: Partial<{ subject: string; startTime: string; endTime: string }>) => {
    if (updates.subject !== undefined) {
      setTimetableData(prev => ({
        ...prev,
        [day]: prev[day]?.map((s, i) => i === index ? updates.subject! : s) || []
      }));
    }

    if (updates.startTime !== undefined || updates.endTime !== undefined) {
      setCustomTimes(prev => ({
        ...prev,
        [day]: prev[day]?.map((t, i) => i === index ? {
          startTime: updates.startTime || t.startTime,
          endTime: updates.endTime || t.endTime
        } : t) || []
      }));
    }
  };

  // Reset to default
  const resetTimetable = () => {
    setTimetableData(defaultTimetable);
    setCustomTimes(defaultCustomTimes);
  };

  return {
    fullTimetable,
    timetableData,
    customTimes,
    getTimetableForDay,
    getTodayClasses,
    getWeekSchedule,
    isSubjectScheduled,
    addClass,
    removeClass,
    updateClass,
    resetTimetable
  };
}

// ============================================
// Study Materials Hook - With IndexedDB
// ============================================
import { saveFile, deleteFile as deleteDbFile } from '@/lib/db';

export function useStudyMaterials(userId?: string) {
  const [materials, setMaterials] = useLocalStorage<StudyMaterial[]>('edu-tracker-materials', [], userId);

  const addMaterial = async (material: Omit<StudyMaterial, 'id' | 'createdAt'>, file?: File) => {
    let fileId = undefined;

    if (material.type === 'pdf' && file) {
      try {
        fileId = await saveFile(file);
      } catch (error) {
        console.error("Failed to save file to DB", error);
        return; // Handle error appropriately in UI
      }
    }

    const newMaterial: StudyMaterial = {
      ...material,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      fileId // Store reference to DB file
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (id: string, updates: Partial<StudyMaterial>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaterial = async (id: string) => {
    const material = materials.find(m => m.id === id);
    if (material?.fileId) {
      try {
        await deleteDbFile(material.fileId);
      } catch (e) {
        console.error("Failed to delete file from DB", e);
      }
    }
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const getMaterialsForSubject = (subjectId: string) => {
    return materials.filter(m => m.subjectId === subjectId);
  };

  return {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialsForSubject
  };
}

// ============================================
// YouTube Playlists Hook
// ============================================
export function usePlaylists(userId?: string) {
  const [playlists, setPlaylists] = useLocalStorage<YouTubePlaylist[]>('edu-tracker-playlists', [], userId);

  const addPlaylist = (playlist: Omit<YouTubePlaylist, 'id' | 'addedAt'>) => {
    const newPlaylist: YouTubePlaylist = {
      ...playlist,
      id: `pl-${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const updatePlaylist = (id: string, updates: Partial<YouTubePlaylist>) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const getPlaylistsForSubject = (subjectId: string) => {
    return playlists.filter(p => p.subjectId === subjectId);
  };

  return {
    playlists,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylistsForSubject
  };
}

// ============================================
// Study Tasks Hook
// ============================================
export function useStudyTasks(userId?: string) {
  const [tasks, setTasks] = useLocalStorage<StudyTask[]>('edu-tracker-tasks', [], userId);
  const { updateStreak } = useUserProfile(userId);

  const addTask = (task: Omit<StudyTask, 'id' | 'createdAt' | 'status'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';

        if (newStatus === 'completed') {
          updateStreak();
        }

        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const getPendingTasks = () => tasks.filter(t => t.status === 'pending');
  const getCompletedTasks = () => tasks.filter(t => t.status === 'completed');
  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.status === 'pending' && t.targetDate < today);
  };
  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.targetDate === today);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getPendingTasks,
    getCompletedTasks,
    getOverdueTasks,
    getTodaysTasks
  };
}

// ============================================
// Course Progress Hook
// ============================================
export function useCourseProgress(userId?: string) {
  const [progressData, setProgressData] = useLocalStorage<CourseProgress[]>('edu-tracker-progress', [], userId);

  const setProgress = (subjectId: string, progress: Partial<CourseProgress>) => {
    setProgressData(prev => {
      const index = prev.findIndex(p => p.subjectId === subjectId);

      if (index === -1) {
        return [...prev, {
          subjectId,
          totalUnits: progress.totalUnits || 0,
          teacherCompletedUnits: progress.teacherCompletedUnits || 0,
          studentCompletedUnits: progress.studentCompletedUnits || 0
        }];
      }

      const updated = [...prev];
      updated[index] = { ...updated[index], ...progress };
      return updated;
    });
  };

  const getProgressForSubject = (subjectId: string): CourseProgress => {
    return progressData.find(p => p.subjectId === subjectId) || {
      subjectId,
      totalUnits: 0,
      teacherCompletedUnits: 0,
      studentCompletedUnits: 0
    };
  };

  const calculateTeacherProgress = (subjectId: string): number => {
    const progress = getProgressForSubject(subjectId);
    if (progress.totalUnits === 0) return 0;
    return Math.round((progress.teacherCompletedUnits / progress.totalUnits) * 100);
  };

  const calculateStudentProgress = (subjectId: string): number => {
    const progress = getProgressForSubject(subjectId);
    if (progress.totalUnits === 0) return 0;
    return Math.round((progress.studentCompletedUnits / progress.totalUnits) * 100);
  };

  const getOverallProgress = (): number => {
    if (progressData.length === 0) return 0;
    const percentages = progressData.map(p => calculateStudentProgress(p.subjectId));
    return Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  };

  return {
    progressData,
    setProgress,
    getProgressForSubject,
    calculateTeacherProgress,
    calculateStudentProgress,
    getOverallProgress
  };
}

// ============================================
// Notifications Hook
// ============================================
const defaultNotifications: import('@/types').Notification[] = [
  {
    id: 'welcome-1',
    title: 'Welcome to EduFlow!',
    message: 'Get started by exploring your dashboard and tracking your attendance.',
    type: 'system',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tip-1',
    title: 'Pro Tip: Use the Search',
    message: 'Press ⌘K or click the search bar to quickly find anything in your app.',
    type: 'system',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useLocalStorage<import('@/types').Notification[]>('edu-tracker-notifications', defaultNotifications, userId);

  const addNotification = (notification: Omit<import('@/types').Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: import('@/types').Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Generate notifications based on app data
  const generateSmartNotifications = (
    tasks: import('@/types').StudyTask[],
    attendanceData: import('@/types').DailyAttendance[],
    subjects: import('@/types').Subject[]
  ) => {
    const newNotifications: Omit<import('@/types').Notification, 'id' | 'createdAt' | 'read'>[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Check for overdue tasks
    const overdueTasks = tasks.filter(t => t.status === 'pending' && t.targetDate < today);
    if (overdueTasks.length > 0) {
      newNotifications.push({
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} pending`,
        type: 'task',
        link: 'planner'
      });
    }

    // Check for today's tasks
    const todaysTasks = tasks.filter(t => t.status === 'pending' && t.targetDate === today);
    if (todaysTasks.length > 0) {
      newNotifications.push({
        title: "Today's Tasks",
        message: `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''} due today`,
        type: 'task',
        link: 'planner'
      });
    }

    // Check for low attendance
    subjects.forEach(subject => {
      const subjectAttendance = attendanceData.filter(day => day.subjects && day.subjects[subject.id] !== undefined);
      const present = subjectAttendance.filter(day => day.subjects[subject.id] === 'present').length;
      const total = subjectAttendance.filter(day => day.subjects[subject.id] !== 'cancelled').length;

      if (total > 0) {
        const percentage = Math.round((present / total) * 100);
        if (percentage < 60 && total >= 5) {
          newNotifications.push({
            title: 'Low Attendance Alert',
            message: `${subject.name} attendance is ${percentage}% - below 60%`,
            type: 'attendance',
            link: 'attendance'
          });
        }
      }
    });

    return newNotifications;
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    generateSmartNotifications
  };
}

// ============================================
// Topic Tracking Hook
// ============================================
export function useTopics() {
  const [topics, setTopics] = useLocalStorage<Topic[]>('edu-tracker-topics', []);

  const addTopic = (topic: Omit<Topic, 'id' | 'status'>) => {
    const newTopic: Topic = {
      ...topic,
      id: `topic-${Date.now()}`,
      status: 'pending'
    };
    setTopics(prev => [...prev, newTopic]);
  };

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const getTopicsForSubject = (subjectId: string) => {
    return topics.filter(t => t.subjectId === subjectId);
  };

  return { topics, addTopic, updateTopic, deleteTopic, getTopicsForSubject };
}

// ============================================
// Focus History Hook
// ============================================
export function useFocusHistory() {
  const [history, setHistory] = useLocalStorage<FocusSessionLog[]>('edu-tracker-focus-history', []);

  const logSession = (session: Omit<FocusSessionLog, 'id'>) => {
    const newLog: FocusSessionLog = {
      ...session,
      id: `focus-${Date.now()}`
    };
    setHistory(prev => [newLog, ...prev]);
  };

  const getHistoryForSubject = (subjectId: string) => {
    return history.filter(h => h.subjectId === subjectId);
  };

  const getTotalStudyTime = (subjectId?: string) => {
    const relevantLogs = subjectId ? history.filter(h => h.subjectId === subjectId) : history;
    return relevantLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  };

  return { history, logSession, getHistoryForSubject, getTotalStudyTime };
}

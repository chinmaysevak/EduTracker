// ============================================
// Data Hooks for All Modules — API-backed
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { defaultCustomTimes, getSubjectColor, generateTimetableWithTimes } from '@/config/timetable';
import type {
  Subject,
  DailyAttendance,
  StudyTask,
  AttendanceStatus,
  TimetableSlot,
  Topic,
  FocusSessionLog,
  Exam,
  StudySession
} from '@/types';

// ============================================
// Generic hook to fetch & cache API data
// ============================================
function useApiCollection<T>(endpoint: string, defaultValue: T[]) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<T[]>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;
    api.get<T[]>(endpoint)
      .then(res => { setData(res); setLoaded(true); })
      .catch(err => { console.error(`Failed to fetch ${endpoint}:`, err); setLoaded(true); });
  }, [isAuthenticated, endpoint]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) { setData(defaultValue); setLoaded(false); fetchedRef.current = false; }
  }, [isAuthenticated, defaultValue]);

  return { data, setData, loaded };
}

// ============================================
// Subjects Hook
// ============================================
export function useSubjects(_timetableData?: Record<string, string[]>, _userId?: string) {
  const { data: subjects, setData: setSubjects } = useApiCollection<Subject>('/subjects', []);

  const addSubject = (name: string, difficulty: number = 3): string => {
    const tempId = `sub-${Date.now()}`;
    const newSubject: Subject = {
      id: tempId,
      name: name.trim(),
      color: getSubjectColor(name.trim()),
      difficulty,
      totalTopics: 10
    };
    setSubjects(prev => [...prev, newSubject]);

    // Sync to server — replace temp id with server id
    api.post<Subject>('/subjects', { name: name.trim(), color: newSubject.color, difficulty, totalTopics: 10 })
      .then(saved => {
        setSubjects(prev => prev.map(s => s.id === tempId ? { ...s, id: saved.id } : s));
      })
      .catch(err => {
        console.error('Failed to add subject:', err);
        setSubjects(prev => prev.filter(s => s.id !== tempId));
      });

    return tempId;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    api.put(`/subjects/${id}`, updates).catch(err => console.error('Failed to update subject:', err));
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    api.delete(`/subjects/${id}`).catch(err => console.error('Failed to delete subject:', err));
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);
  const getSubjectByName = (name: string) => subjects.find(s => s.name === name);

  return { subjects, addSubject, updateSubject, removeSubject, getSubjectById, getSubjectByName };
}

// ============================================
// User Profile Hook (Gamification)
// ============================================
import type { UserProfile, Badge } from '@/types';

export function useUserProfile(_userId?: string) {
  const { isAuthenticated } = useAuth();
  const defaultProfile: UserProfile = {
    name: 'Student',
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    badges: []
  };

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;
    api.get<UserProfile>('/profile')
      .then(res => setProfile(res))
      .catch(err => console.error('Failed to fetch profile:', err));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) { setProfile(defaultProfile); fetchedRef.current = false; }
  }, [isAuthenticated]);

  // Debounced save to server
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const syncProfile = useCallback((newProfile: UserProfile) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      api.put('/profile', newProfile).catch(err => console.error('Failed to save profile:', err));
    }, 500);
  }, []);

  const addXP = (amount: number) => {
    setProfile(prev => {
      const newXP = prev.xp + amount;
      const xpNeeded = prev.level * 1000;
      let newLevel = prev.level;
      if (newXP >= xpNeeded) {
        newLevel += 1;
      }
      const updated = { ...prev, xp: newXP, level: newLevel };
      syncProfile(updated);
      return updated;
    });
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => {
      if (prev.lastStudyDate === today) return prev;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let newStreak = prev.currentStreak;

      if (prev.lastStudyDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const updated = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastStudyDate: today
      };
      syncProfile(updated);
      return updated;
    });
  };

  const awardBadge = (badge: Badge) => {
    setProfile(prev => {
      if (prev.badges.some(b => b.id === badge.id)) return prev;
      const updated = { ...prev, badges: [...prev.badges, badge] };
      syncProfile(updated);
      return updated;
    });
  };

  return { profile, addXP, updateStreak, awardBadge, setProfile: (val: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    const resolve = (v: UserProfile | ((prev: UserProfile) => UserProfile)) => {
      setProfile(prev => {
        const next = typeof v === 'function' ? v(prev) : v;
        syncProfile(next);
        return next;
      });
    };
    resolve(val);
  }};
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
// Attendance Hook
// ============================================
export function useAttendance(_userId?: string) {
  const { data: attendanceData, setData: setAttendanceData } = useApiCollection<DailyAttendance>('/attendance', []);

  const syncAttendance = useCallback((date: string, updated: DailyAttendance) => {
    api.post('/attendance', { date, subjects: updated.subjects, extraClasses: updated.extraClasses })
      .then(saved => {
        setAttendanceData(prev => prev.map(a => a.date === date ? { ...a, id: saved.id } : a));
      })
      .catch(err => console.error('Failed to sync attendance:', err));
  }, [setAttendanceData]);

  const markAttendance = (date: string, subjectId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);

      if (dayIndex === -1) {
        if (status === null) return prev;
        const newDay: DailyAttendance = { date, subjects: { [subjectId]: status } };
        syncAttendance(date, newDay);
        return [...prev, newDay];
      }

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };

      if (status === null) {
        const { [subjectId]: _, ...rest } = dayData.subjects;
        dayData.subjects = rest;
        if (Object.keys(dayData.subjects).length === 0 && (!dayData.extraClasses || dayData.extraClasses.length === 0)) {
          syncAttendance(date, dayData);
          return prev.filter(d => d.date !== date);
        }
      } else {
        dayData.subjects = { ...dayData.subjects, [subjectId]: status };
      }

      updated[dayIndex] = dayData;
      syncAttendance(date, dayData);
      return updated;
    });
  };

  const addExtraClass = (date: string, name: string, startTime?: string, endTime?: string) => {
    const newExtraClass = {
      id: `extra-${Date.now()}`,
      name: name.trim(),
      startTime,
      endTime,
      status: null as AttendanceStatus,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    };

    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);

      if (dayIndex === -1) {
        const newDay: DailyAttendance = { date, subjects: {}, extraClasses: [newExtraClass] };
        syncAttendance(date, newDay);
        return [...prev, newDay];
      }

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };
      dayData.extraClasses = [...(dayData.extraClasses || []), newExtraClass];
      updated[dayIndex] = dayData;
      syncAttendance(date, dayData);
      return updated;
    });

    return newExtraClass.id;
  };

  const removeExtraClass = (date: string, extraClassId: string) => {
    setAttendanceData(prev => {
      const dayIndex = prev.findIndex(d => d.date === date);
      if (dayIndex === -1) return prev;

      const updated = [...prev];
      const dayData = { ...updated[dayIndex] };
      dayData.extraClasses = (dayData.extraClasses || []).filter(ec => ec.id !== extraClassId);

      if (Object.keys(dayData.subjects).length === 0 && dayData.extraClasses.length === 0) {
        syncAttendance(date, dayData);
        return prev.filter(d => d.date !== date);
      }

      updated[dayIndex] = dayData;
      syncAttendance(date, dayData);
      return updated;
    });
  };

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
      syncAttendance(date, dayData);
      return updated;
    });
  };

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
// Timetable Hook
// ============================================
export function useTimetable(_userId?: string) {
  const { isAuthenticated } = useAuth();
  const emptyTimetable: Record<string, string[]> = {
    "Monday": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []
  };
  const [timetableData, setTimetableData] = useState<Record<string, string[]>>(emptyTimetable);
  const [customTimes, setCustomTimes] = useState<Record<string, { startTime: string; endTime: string }[]>>(defaultCustomTimes);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;
    api.get<{ timetableData: Record<string, string[]>; customTimes: Record<string, { startTime: string; endTime: string }[]> }>('/timetable')
      .then(res => {
        if (res.timetableData && Object.keys(res.timetableData).length > 0) setTimetableData(res.timetableData);
        if (res.customTimes && Object.keys(res.customTimes).length > 0) setCustomTimes(res.customTimes);
      })
      .catch(err => console.error('Failed to fetch timetable:', err));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) { setTimetableData(emptyTimetable); setCustomTimes(defaultCustomTimes); fetchedRef.current = false; }
  }, [isAuthenticated]);

  const syncTimetable = useCallback((data: Record<string, string[]>, times: Record<string, { startTime: string; endTime: string }[]>) => {
    api.put('/timetable', { timetableData: data, customTimes: times })
      .catch(err => console.error('Failed to sync timetable:', err));
  }, []);

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

  const addClass = (day: string, subject: string, startTime: string, endTime: string) => {
    const newData = { ...timetableData, [day]: [...(timetableData[day] || []), subject] };
    const newTimes = { ...customTimes, [day]: [...(customTimes[day] || []), { startTime, endTime }] };
    setTimetableData(newData);
    setCustomTimes(newTimes);
    syncTimetable(newData, newTimes);
  };

  const removeClass = (day: string, index: number) => {
    const newData = { ...timetableData, [day]: timetableData[day]?.filter((_, i) => i !== index) || [] };
    const newTimes = { ...customTimes, [day]: customTimes[day]?.filter((_, i) => i !== index) || [] };
    setTimetableData(newData);
    setCustomTimes(newTimes);
    syncTimetable(newData, newTimes);
  };

  const updateClass = (day: string, index: number, updates: Partial<{ subject: string; startTime: string; endTime: string }>) => {
    let newData = timetableData;
    let newTimes = customTimes;

    if (updates.subject !== undefined) {
      newData = { ...timetableData, [day]: timetableData[day]?.map((s, i) => i === index ? updates.subject! : s) || [] };
      setTimetableData(newData);
    }

    if (updates.startTime !== undefined || updates.endTime !== undefined) {
      newTimes = { ...customTimes, [day]: customTimes[day]?.map((t, i) => i === index ? {
        startTime: updates.startTime || t.startTime,
        endTime: updates.endTime || t.endTime
      } : t) || [] };
      setCustomTimes(newTimes);
    }

    syncTimetable(newData, newTimes);
  };

  const resetTimetable = () => {
    setTimetableData(emptyTimetable);
    setCustomTimes(defaultCustomTimes);
    syncTimetable(emptyTimetable, defaultCustomTimes);
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
// Resources Hook
// ============================================
import { saveFile, deleteFile as deleteDbFile } from '@/lib/db';
import type { Resource } from '@/types';

export function useResources(_userId?: string) {
  const { data: resources, setData: setResources } = useApiCollection<Resource>('/resources', []);

  const addResource = async (resource: Omit<Resource, 'id' | 'createdAt'>, file?: File) => {
    let fileId = undefined;

    if (resource.type === 'file' && file) {
      try {
        fileId = await saveFile(file);
      } catch (error) {
        console.error("Failed to save file to DB", error);
        return;
      }
    }

    const newResource: Resource = {
      ...resource,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
      fileId
    };
    setResources(prev => [newResource, ...prev]);

    api.post<Resource>('/resources', {
      type: resource.type, title: resource.title, subjectId: resource.subjectId,
      isFavorite: resource.isFavorite, tags: resource.tags, fileUrl: resource.fileUrl,
      fileType: resource.fileType, fileSize: resource.fileSize, fileId,
      url: resource.url, youtubeUrl: resource.youtubeUrl, thumbnailUrl: resource.thumbnailUrl,
      content: resource.content
    }).then(saved => {
      setResources(prev => prev.map(r => r.id === newResource.id ? { ...r, id: saved.id } : r));
    }).catch(err => console.error('Failed to save resource:', err));
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    api.put(`/resources/${id}`, updates).catch(err => console.error('Failed to update resource:', err));
  };

  const deleteResource = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (resource?.fileId) {
      try { await deleteDbFile(resource.fileId); } catch (e) { console.error("Failed to delete file from DB", e); }
    }
    setResources(prev => prev.filter(r => r.id !== id));
    api.delete(`/resources/${id}`).catch(err => console.error('Failed to delete resource:', err));
  };

  const toggleFavorite = (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (resource) {
      const newFav = !resource.isFavorite;
      setResources(prev => prev.map(r => r.id === id ? { ...r, isFavorite: newFav } : r));
      api.put(`/resources/${id}`, { isFavorite: newFav }).catch(err => console.error('Failed to toggle favorite:', err));
    }
  };

  const getResourcesForSubject = (subjectId: string) => {
    return resources.filter(r => r.subjectId === subjectId);
  };

  return {
    resources,
    addResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    getResourcesForSubject
  };
}

// ============================================
// Study Tasks Hook
// ============================================
export function useStudyTasks(_userId?: string) {
  const { data: tasks, setData: setTasks } = useApiCollection<StudyTask>('/tasks', []);
  const { updateStreak } = useUserProfile();

  const addTask = (task: Omit<StudyTask, 'id' | 'createdAt' | 'status'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);

    api.post<StudyTask>('/tasks', {
      ...task, status: 'pending', createdAt: newTask.createdAt
    }).then(saved => {
      setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: saved.id } : t));
    }).catch(err => console.error('Failed to create task:', err));
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    api.put(`/tasks/${id}`, updates).catch(err => console.error('Failed to update task:', err));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    api.delete(`/tasks/${id}`).catch(err => console.error('Failed to delete task:', err));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        if (newStatus === 'completed') updateStreak();
        const updates = {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
        api.put(`/tasks/${id}`, updates).catch(err => console.error('Failed to toggle task:', err));
        return { ...t, ...updates };
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
// Syllabus Progress Hook
// ============================================
import type { SyllabusUnit, SyllabusTopic } from '@/types';

export function useSyllabus(_userId?: string) {
  const { data: units, setData: setUnits } = useApiCollection<SyllabusUnit>('/syllabus/units', []);
  const { data: topics, setData: setTopics } = useApiCollection<SyllabusTopic>('/syllabus/topics', []);

  // --- Units ---
  const addUnit = (subjectId: string, name: string) => {
    const subjectUnits = units.filter(u => u.subjectId === subjectId);
    const newUnit: SyllabusUnit = {
      id: `unit-${Date.now()}`,
      subjectId,
      name,
      teacherCompleted: false,
      studentCompleted: false,
      order: subjectUnits.length
    };
    setUnits(prev => [...prev, newUnit]);

    api.post<SyllabusUnit>('/syllabus/units', { subjectId, name, order: newUnit.order })
      .then(saved => { setUnits(prev => prev.map(u => u.id === newUnit.id ? { ...u, id: saved.id } : u)); })
      .catch(err => console.error('Failed to create unit:', err));
  };

  const updateUnit = (id: string, updates: Partial<SyllabusUnit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    api.put(`/syllabus/units/${id}`, updates).catch(err => console.error('Failed to update unit:', err));
  };

  const deleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
    setTopics(prev => prev.filter(t => t.unitId !== id));
    api.delete(`/syllabus/units/${id}`).catch(err => console.error('Failed to delete unit:', err));
  };

  const toggleUnitTeacherCompletion = (id: string) => {
    const unit = units.find(u => u.id === id);
    if (unit) {
      const newState = !unit.teacherCompleted;
      setUnits(prev => prev.map(u => u.id === id ? { ...u, teacherCompleted: newState } : u));
      setTopics(prev => prev.map(t => t.unitId === id ? { ...t, teacherCompleted: newState } : t));
      api.put(`/syllabus/units/${id}`, { teacherCompleted: newState }).catch(err => console.error('Failed to toggle unit:', err));
    }
  };

  const toggleUnitStudentCompletion = (id: string) => {
    const unit = units.find(u => u.id === id);
    if (unit) {
      const newState = !unit.studentCompleted;
      setUnits(prev => prev.map(u => u.id === id ? { ...u, studentCompleted: newState } : u));
      setTopics(prev => prev.map(t => t.unitId === id ? { ...t, studentCompleted: newState } : t));
      api.put(`/syllabus/units/${id}`, { studentCompleted: newState }).catch(err => console.error('Failed to toggle unit:', err));
    }
  };

  // --- Topics ---
  const addTopic = (unitId: string, name: string) => {
    const unitTopics = topics.filter(t => t.unitId === unitId);
    const newTopic: SyllabusTopic = {
      id: `topic-${Date.now()}`,
      unitId,
      name,
      teacherCompleted: false,
      studentCompleted: false,
      order: unitTopics.length
    };
    setTopics(prev => [...prev, newTopic]);

    api.post<SyllabusTopic>('/syllabus/topics', { unitId, name, order: newTopic.order })
      .then(saved => { setTopics(prev => prev.map(t => t.id === newTopic.id ? { ...t, id: saved.id } : t)); })
      .catch(err => console.error('Failed to create topic:', err));
  };

  const updateTopic = (id: string, updates: Partial<SyllabusTopic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    api.put(`/syllabus/topics/${id}`, updates).catch(err => console.error('Failed to update topic:', err));
  };

  const deleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    api.delete(`/syllabus/topics/${id}`).catch(err => console.error('Failed to delete topic:', err));
  };

  const toggleTopicTeacherCompletion = (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (topic) {
      const newState = !topic.teacherCompleted;
      setTopics(prev => prev.map(t => t.id === id ? { ...t, teacherCompleted: newState } : t));
      api.put(`/syllabus/topics/${id}`, { teacherCompleted: newState }).catch(err => console.error('Failed to toggle topic:', err));
    }
  };

  const toggleTopicStudentCompletion = (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (topic) {
      const newState = !topic.studentCompleted;
      setTopics(prev => prev.map(t => t.id === id ? { ...t, studentCompleted: newState } : t));
      api.put(`/syllabus/topics/${id}`, { studentCompleted: newState }).catch(err => console.error('Failed to toggle topic:', err));
    }
  };

  // --- Calculations ---
  const getSubjectProgress = (subjectId: string) => {
    const subjectUnits = units.filter(u => u.subjectId === subjectId);
    if (subjectUnits.length === 0) return { teacher: 0, student: 0, totalUnits: 0, completedTopics: 0, totalTopics: 0, teacherCompletedUnits: 0, studentCompletedUnits: 0 };

    const unitIds = subjectUnits.map(u => u.id);
    const subjectTopics = topics.filter(t => unitIds.includes(t.unitId));

    if (subjectTopics.length > 0) {
      const teacherCompletedTopics = subjectTopics.filter(t => t.teacherCompleted).length;
      const studentCompletedTopics = subjectTopics.filter(t => t.studentCompleted).length;

      return {
        teacher: Math.round((teacherCompletedTopics / subjectTopics.length) * 100),
        student: Math.round((studentCompletedTopics / subjectTopics.length) * 100),
        totalUnits: subjectUnits.length,
        teacherCompletedUnits: subjectUnits.filter(u => u.teacherCompleted).length,
        studentCompletedUnits: subjectUnits.filter(u => u.studentCompleted).length,
        completedTopics: studentCompletedTopics,
        totalTopics: subjectTopics.length
      };
    } else {
      const teacherCompletedUnits = subjectUnits.filter(u => u.teacherCompleted).length;
      const studentCompletedUnits = subjectUnits.filter(u => u.studentCompleted).length;

      return {
        teacher: Math.round((teacherCompletedUnits / subjectUnits.length) * 100),
        student: Math.round((studentCompletedUnits / subjectUnits.length) * 100),
        totalUnits: subjectUnits.length,
        teacherCompletedUnits,
        studentCompletedUnits,
        completedTopics: 0,
        totalTopics: 0
      };
    }
  };

  const getOverallProgress = (subjectIds: string[]) => {
    if (subjectIds.length === 0) return { teacher: 0, student: 0 };

    let totalTeacher = 0;
    let totalStudent = 0;

    subjectIds.forEach(id => {
      const p = getSubjectProgress(id);
      totalTeacher += p.teacher;
      totalStudent += p.student;
    });

    return {
      teacher: Math.round(totalTeacher / subjectIds.length),
      student: Math.round(totalStudent / subjectIds.length)
    };
  };

  return {
    units,
    topics,
    addUnit,
    updateUnit,
    deleteUnit,
    toggleUnitTeacherCompletion,
    toggleUnitStudentCompletion,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicTeacherCompletion,
    toggleTopicStudentCompletion,
    getSubjectProgress,
    getOverallProgress
  };
}

// ============================================
// Notifications Hook
// ============================================
const defaultNotifications: import('@/types').Notification[] = [];

export function useNotifications(_userId?: string) {
  const { data: notifications, setData: setNotifications } = useApiCollection<import('@/types').Notification>('/notifications', defaultNotifications);

  const addNotification = (notification: Omit<import('@/types').Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: import('@/types').Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    api.post<import('@/types').Notification>('/notifications', {
      title: notification.title, message: notification.message,
      type: notification.type, link: notification.link
    }).then(saved => {
      setNotifications(prev => prev.map(n => n.id === newNotification.id ? { ...n, id: saved.id } : n));
    }).catch(err => console.error('Failed to create notification:', err));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.put(`/notifications/${id}`, { read: true }).catch(err => console.error('Failed to mark read:', err));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.put('/notifications/read-all/batch', {}).catch(err => console.error('Failed to mark all read:', err));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    api.delete(`/notifications/${id}`).catch(err => console.error('Failed to delete notification:', err));
  };

  const clearAll = () => {
    // Delete each notification on server
    notifications.forEach(n => api.delete(`/notifications/${n.id}`).catch(() => {}));
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const generateSmartNotifications = (
    tasks: import('@/types').StudyTask[],
    attendanceData: import('@/types').DailyAttendance[],
    subjects: import('@/types').Subject[]
  ) => {
    const newNotifications: Omit<import('@/types').Notification, 'id' | 'createdAt' | 'read'>[] = [];
    const today = new Date().toISOString().split('T')[0];

    const overdueTasks = tasks.filter(t => t.status === 'pending' && t.targetDate < today);
    if (overdueTasks.length > 0) {
      newNotifications.push({
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} pending`,
        type: 'task',
        link: 'planner'
      });
    }

    const todaysTasks = tasks.filter(t => t.status === 'pending' && t.targetDate === today);
    if (todaysTasks.length > 0) {
      newNotifications.push({
        title: "Today's Tasks",
        message: `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''} due today`,
        type: 'task',
        link: 'planner'
      });
    }

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
// Topic Tracking Hook (separate from Syllabus)
// ============================================
export function useTopics(_userId?: string) {
  const { data: topics, setData: setTopics } = useApiCollection<Topic>('/topics', []);

  const addTopic = (topic: Omit<Topic, 'id' | 'status'>) => {
    const newTopic: Topic = {
      ...topic,
      id: `topic-${Date.now()}`,
      status: 'pending'
    };
    setTopics(prev => [...prev, newTopic]);

    api.post<Topic>('/topics', { ...topic, status: 'pending' })
      .then(saved => { setTopics(prev => prev.map(t => t.id === newTopic.id ? { ...t, id: saved.id } : t)); })
      .catch(err => console.error('Failed to create topic:', err));
  };

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    api.put(`/topics/${id}`, updates).catch(err => console.error('Failed to update topic:', err));
  };

  const deleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    api.delete(`/topics/${id}`).catch(err => console.error('Failed to delete topic:', err));
  };

  const getTopicsForSubject = (subjectId: string) => {
    return topics.filter(t => t.subjectId === subjectId);
  };

  return { topics, addTopic, updateTopic, deleteTopic, getTopicsForSubject };
}

// ============================================
// Focus History Hook
// ============================================
export function useFocusHistory(_userId?: string) {
  const { data: history, setData: setHistory } = useApiCollection<FocusSessionLog>('/focus-sessions', []);

  const logSession = (session: Omit<FocusSessionLog, 'id'>) => {
    const newLog: FocusSessionLog = {
      ...session,
      id: `focus-${Date.now()}`
    };
    setHistory(prev => [newLog, ...prev]);

    api.post<FocusSessionLog>('/focus-sessions', session)
      .then(saved => { setHistory(prev => prev.map(h => h.id === newLog.id ? { ...h, id: saved.id } : h)); })
      .catch(err => console.error('Failed to log focus session:', err));
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

// ============================================
// Exams Hook
// ============================================
export function useExams(_userId?: string) {
  const { data: exams, setData: setExams } = useApiCollection<Exam>('/exams', []);

  const addExam = (exam: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExams(prev => [...prev, newExam]);

    api.post<Exam>('/exams', exam)
      .then(saved => { setExams(prev => prev.map(e => e.id === newExam.id ? { ...e, id: saved.id } : e)); })
      .catch(err => console.error('Failed to create exam:', err));
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    api.put(`/exams/${id}`, updates).catch(err => console.error('Failed to update exam:', err));
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    api.delete(`/exams/${id}`).catch(err => console.error('Failed to delete exam:', err));
  };

  const getExamsForSubject = (subjectId: string) => {
    return exams.filter(e => e.subjectId === subjectId);
  };

  const getUpcomingExams = () => {
    const today = new Date().toISOString().split('T')[0];
    return exams.filter(e => e.examDate >= today).sort((a, b) =>
      new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );
  };

  const getOverdueExams = () => {
    const today = new Date().toISOString().split('T')[0];
    return exams.filter(e => e.examDate < today && e.preparationStatus !== 'completed');
  };

  return { exams, addExam, updateExam, deleteExam, getExamsForSubject, getUpcomingExams, getOverdueExams };
}

// ============================================
// Study Sessions Hook
// ============================================
export function useStudyPlannerSessions(_userId?: string) {
  const { data: sessions, setData: setSessions } = useApiCollection<StudySession>('/studysessions', []);

  const addSession = (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...session,
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [...prev, newSession]);

    api.post<StudySession>('/studysessions', session)
      .then(saved => { setSessions(prev => prev.map(s => s.id === newSession.id ? { ...s, id: saved.id } : s)); })
      .catch(err => console.error('Failed to create study session:', err));
  };

  const updateSession = (id: string, updates: Partial<StudySession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    api.put(`/studysessions/${id}`, updates).catch(err => console.error('Failed to update study session:', err));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    api.delete(`/studysessions/${id}`).catch(err => console.error('Failed to delete study session:', err));
  };

  const toggleSessionComplete = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      const newCompleted = !session.completed;
      setSessions(prev => prev.map(s => s.id === id ? { ...s, completed: newCompleted } : s));
      api.put(`/studysessions/${id}`, { completed: newCompleted }).catch(err => console.error('Failed to toggle session:', err));
    }
  };

  const getSessionsForDate = (date: string) => {
    return sessions.filter(s => s.sessionDate === date);
  };

  const getSessionsForSubject = (subjectId: string) => {
    return sessions.filter(s => s.subjectId === subjectId);
  };

  const getTodaysSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.sessionDate === today);
  };

  const getUpcomingSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.sessionDate >= today).sort((a, b) =>
      new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );
  };

  return {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    toggleSessionComplete,
    getSessionsForDate,
    getSessionsForSubject,
    getTodaysSessions,
    getUpcomingSessions
  };
}


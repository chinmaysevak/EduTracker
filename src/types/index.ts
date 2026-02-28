// ============================================
// Edu Tracker - Type Definitions
// ============================================

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | null;

export interface ExtraClass {
  id: string;
  name: string;
  color?: string;
  startTime?: string;
  endTime?: string;
  status: AttendanceStatus;
}

export interface DailyAttendance {
  date: string; // ISO date string (YYYY-MM-DD)
  subjects: Record<string, AttendanceStatus>; // subjectId -> status
  extraClasses?: ExtraClass[]; // One-time extra classes for this day
}

export interface Subject {
  id: string;
  name: string;
  color?: string;
  difficulty?: number; // 1-5 scale (1=Easy, 5=Hard). Default 3.
  totalTopics?: number;
  examDate?: string; // ISO date string
}

// Study Material Types
export interface StudyMaterial {
  id: string;
  subjectId: string;
  title: string;
  type: 'note' | 'pdf' | 'link';
  content: string;
  fileId?: string; // Reference to IndexedDB file
  createdAt: string;
}

// YouTube Playlist Types
export interface YouTubePlaylist {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  thumbnail?: string;
  channelName?: string;
  videoCount?: number;
  addedAt: string;
}

// Study Planner Types
export type TaskStatus = 'pending' | 'completed';
export type TaskType = 'study' | 'assignment' | 'exam' | 'project';
export type RecurrenceType = 'none' | 'daily' | 'weekly';

export interface StudyTask {
  id: string;
  subjectId?: string;
  description: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  type?: TaskType;
  isRecurring?: boolean;
  recurrencePattern?: RecurrenceType;
  recurringDays?: number[]; // 0-6 for weekly
  createdAt: string;
  marks?: number; // Weight for priority
  estimatedMinutes?: number; // For scheduling
  autoPriorityScore?: number; // Calculated dynamic score
  completedAt?: string; // Timestamp when task was completed
}

// Gamification & User Profile
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // For streak calculation
  badges: Badge[];
  lastStudiedSubjectId?: string;
  lastSessionEnd?: string;
}

// Focus Mode
export interface FocusSession {
  id: string;
  subjectId?: string;
  startTime: string;
  duration: number; // in minutes
  completed: boolean;
  notes?: string;
}

// Course Progress Types
export interface CourseProgress {
  subjectId: string;
  totalUnits: number;
  teacherCompletedUnits: number;
  studentCompletedUnits: number;
}

// Navigation Types
export type ModuleType =
  | 'dashboard'
  | 'attendance'
  | 'materials'
  | 'learning-hub'
  | 'planner'
  | 'progress'
  | 'settings'
  | 'focus';

// Timetable Types
export interface TimetableSlot {
  subject: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  day: string;
  slots: TimetableSlot[];
}

// Notification Types
export type NotificationType = 'attendance' | 'task' | 'material' | 'progress' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: ModuleType;
}

// Import/Export Types
export interface EduTrackerExport {
  version: string;
  exportDate: string;
  data: {
    subjects: Subject[];
    attendance: DailyAttendance[];
    materials: StudyMaterial[];
    playlists: YouTubePlaylist[];
    tasks: StudyTask[];
    progress: CourseProgress[];
    notifications: Notification[];
    timetable: Record<string, string[]>;
    customTimes: Record<string, { startTime: string; endTime: string }[]>;
  };
}
// Topic Tracking for "Backlog Detection"
export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  status: 'pending' | 'revision' | 'mastered';
  difficulty: 'easy' | 'medium' | 'hard'; // Weight: 1, 2, 3
  completedDate?: string;
}

// Focus History for "Weekly Performance"
export interface FocusSessionLog {
  id: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
}

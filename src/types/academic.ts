// ============================================
// Smart Academic Assistant System - Core Engine
// ============================================

export interface StudyRecommendation {
  subject: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string; // e.g., "2h 30m"
  reason: string;
  tasks: string[];
}

export interface AcademicPerformanceIndex {
  overall: number; // 0-100
  level: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  attendance: number;
  taskCompletion: number;
  progress: number;
  studyConsistency: number;
  improvementSuggestions: string[];
}

export interface RiskAssessment {
  level: 'high' | 'moderate' | 'low';
  factors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface WeeklyPlan {
  weekOf: string;
  dailyPlan: {
    [date: string]: {
      subjects: string[];
      studyTime: string;
      tasks: string[];
      priority: 'high' | 'medium' | 'low';
    };
  };
  weeklyGoals: string[];
  totalEstimatedHours: string;
}

export interface ProductivityMetrics {
  eduScore: number; // 0-100
  consistency: number; // 0-100
  attendanceRate: number; // 0-100
  taskCompletionRate: number; // 0-100
  studyStreak: number; // days
  weeklyTrend: 'improving' | 'stable' | 'declining';
  subjectPerformance: {
    [subject: string]: {
      score: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

export interface MonthlyReport {
  month: string;
  year: number;
  academicPerformanceIndex: AcademicPerformanceIndex;
  weakSubjects: string[];
  recommendations: string[];
  productivityMetrics: ProductivityMetrics;
  attendanceSummary: {
    total: number;
    present: number;
    percentage: number;
    bySubject: { [subject: string]: number };
  };
  taskSummary: {
    completed: number;
    pending: number;
    overdue: number;
  };
}

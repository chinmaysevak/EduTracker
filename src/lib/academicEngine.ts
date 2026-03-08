import type { StudyRecommendation, AcademicPerformanceIndex, RiskAssessment, WeeklyPlan, ProductivityMetrics } from '@/types/academic';
import type { Subject, StudyTask, DailyAttendance } from '@/types';

// Helper: calculate attendance for a subject from raw data
function calcSubjectAttendance(
  subjectId: string,
  attendanceData: DailyAttendance[]
): { percentage: number; present: number; total: number } {
  const relevantDays = attendanceData.filter(day => day.subjects[subjectId] !== undefined);
  const validRecords = relevantDays.filter(day => day.subjects[subjectId] !== 'cancelled');
  if (validRecords.length === 0) return { percentage: 100, present: 0, total: 0 };
  const present = validRecords.filter(day => day.subjects[subjectId] === 'present').length;
  return { percentage: Math.round((present / validRecords.length) * 100), present, total: validRecords.length };
}

export class SmartAcademicEngine {
  static generateDailyRecommendations(
    subjects: Subject[],
    tasks: StudyTask[],
    attendanceData: DailyAttendance[]
  ): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];
    const today = new Date().toISOString().split('T')[0];

    subjects.forEach(subject => {
      const attendance = calcSubjectAttendance(subject.id, attendanceData);
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id && t.status === 'pending');
      const upcomingTasks = subjectTasks.filter(t => t.targetDate <= today);

      if (attendance.percentage < 65) {
        recommendations.push({
          subject: subject.name,
          priority: 'high',
          estimatedTime: '1h 30m',
          reason: `Low attendance (${attendance.percentage}%) — needs immediate attention`,
          tasks: upcomingTasks.map(t => t.description)
        });
      } else if (attendance.percentage < 75) {
        recommendations.push({
          subject: subject.name,
          priority: 'medium',
          estimatedTime: '1h',
          reason: `Moderate attendance (${attendance.percentage}%) — room for improvement`,
          tasks: upcomingTasks.map(t => t.description)
        });
      } else if (subjectTasks.length > 0) {
        recommendations.push({
          subject: subject.name,
          priority: 'low',
          estimatedTime: '45m',
          reason: `${subjectTasks.length} pending task(s) to complete`,
          tasks: upcomingTasks.map(t => t.description)
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static calculatePerformanceIndex(
    subjects: Subject[],
    tasks: StudyTask[],
    attendanceData: DailyAttendance[]
  ): AcademicPerformanceIndex {
    const attendanceScores = subjects.map(s => calcSubjectAttendance(s.id, attendanceData).percentage);
    const avgAttendance = attendanceScores.length > 0
      ? attendanceScores.reduce((a, b) => a + b, 0) / attendanceScores.length
      : 0;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const progress = Math.min(avgAttendance + taskCompletion / 2, 100);
    const studyConsistency = Math.min(tasks.length / 30 * 100, 100);

    const overall = (avgAttendance * 0.35) + (taskCompletion * 0.25) + (progress * 0.30) + (studyConsistency * 0.10);

    let level: AcademicPerformanceIndex['level'];
    if (overall >= 85) level = 'excellent';
    else if (overall >= 70) level = 'good';
    else if (overall >= 55) level = 'average';
    else if (overall >= 40) level = 'poor';
    else level = 'critical';

    const suggestions: string[] = [];
    if (avgAttendance < 75) suggestions.push('Improve class attendance to at least 75%');
    if (taskCompletion < 70) suggestions.push('Complete pending tasks to boost your score');
    if (studyConsistency < 60) suggestions.push('Maintain a consistent study schedule');
    if (suggestions.length === 0) suggestions.push('Great work! Keep up your current performance');

    return {
      overall: Math.round(overall),
      level,
      attendance: Math.round(avgAttendance),
      taskCompletion: Math.round(taskCompletion),
      progress: Math.round(progress),
      studyConsistency: Math.round(studyConsistency),
      improvementSuggestions: suggestions
    };
  }

  static assessRisk(
    subjects: Subject[],
    tasks: StudyTask[],
    attendanceData: DailyAttendance[]
  ): RiskAssessment {
    const attendanceScores = subjects.map(s => calcSubjectAttendance(s.id, attendanceData).percentage);
    const avgAttendance = attendanceScores.length > 0
      ? attendanceScores.reduce((a, b) => a + b, 0) / attendanceScores.length
      : 100;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    let level: RiskAssessment['level'];
    const factors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (avgAttendance < 65 || pendingTasks > 5) {
      level = 'high';
      if (avgAttendance < 65) factors.push(`Low attendance (${Math.round(avgAttendance)}%)`);
      if (pendingTasks > 5) factors.push(`High task backlog (${pendingTasks} pending)`);
      warnings.push('Academic performance is at risk — immediate action needed');
      recommendations.push('Prioritize attending classes and completing overdue tasks');
    } else if (avgAttendance < 75 || pendingTasks > 3) {
      level = 'moderate';
      factors.push(`Attendance at ${Math.round(avgAttendance)}%`);
      warnings.push('Monitor your progress closely this week');
      recommendations.push('Focus on bringing attendance above 75%');
    } else {
      level = 'low';
      recommendations.push('Keep up the great work! Maintain current performance');
    }

    return { level, factors, warnings, recommendations };
  }

  static generateWeeklyPlan(
    subjects: Subject[],
    tasks: StudyTask[]
  ): WeeklyPlan {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const dailyPlan: WeeklyPlan['dailyPlan'] = {};
    const weeklyGoals: string[] = [];
    let totalHours = 0;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayTasks = tasks.filter(t => t.targetDate === dateStr && t.status === 'pending');
      const studyTime = Math.max(2, dayTasks.length * 1.5);

      dailyPlan[dateStr] = {
        subjects: subjects.slice(0, 3).map(s => s.name),
        studyTime: `${Math.round(studyTime)}h`,
        tasks: dayTasks.map(t => t.description),
        priority: dayTasks.length > 2 ? 'high' : dayTasks.length > 0 ? 'medium' : 'low'
      };

      totalHours += studyTime;
    }

    weeklyGoals.push('Complete all pending tasks', 'Maintain 80%+ attendance', 'Review weak subjects');

    return {
      weekOf: weekStart.toISOString().split('T')[0],
      dailyPlan,
      weeklyGoals,
      totalEstimatedHours: `${Math.round(totalHours)}h`
    };
  }

  static calculateProductivityMetrics(
    subjects: Subject[],
    tasks: StudyTask[],
    attendanceData: DailyAttendance[]
  ): ProductivityMetrics {
    const attendanceScores = subjects.map(s => calcSubjectAttendance(s.id, attendanceData).percentage);
    const attendanceRate = attendanceScores.length > 0
      ? attendanceScores.reduce((a, b) => a + b, 0) / attendanceScores.length
      : 0;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= lastMonth);
    const consistency = Math.min((recentTasks.length / 30) * 100, 100);

    const studyStreak = Math.min(completedTasks, 30);
    const eduScore = (attendanceRate * 0.4) + (taskCompletionRate * 0.4) + (consistency * 0.2);

    const weeklyTrend: ProductivityMetrics['weeklyTrend'] =
      taskCompletionRate > 70 ? 'improving' :
        taskCompletionRate > 50 ? 'stable' : 'declining';

    const subjectPerformance: ProductivityMetrics['subjectPerformance'] = {};
    subjects.forEach(subject => {
      const attendance = calcSubjectAttendance(subject.id, attendanceData).percentage;
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
      const completedSubjectTasks = subjectTasks.filter(t => t.status === 'completed').length;
      const completionRate = subjectTasks.length > 0 ? (completedSubjectTasks / subjectTasks.length) * 100 : 0;

      const score = (attendance * 0.6) + (completionRate * 0.4);
      subjectPerformance[subject.name] = {
        score: Math.round(score),
        trend: score > 70 ? 'up' : score > 50 ? 'stable' : 'down'
      };
    });

    return {
      eduScore: Math.round(eduScore),
      consistency: Math.round(consistency),
      attendanceRate: Math.round(attendanceRate),
      taskCompletionRate: Math.round(taskCompletionRate),
      studyStreak,
      weeklyTrend,
      subjectPerformance
    };
  }
}

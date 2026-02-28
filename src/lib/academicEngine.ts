import type { StudyRecommendation, AcademicPerformanceIndex, RiskAssessment, WeeklyPlan, ProductivityMetrics } from '@/types/academic';
import type { Subject, StudyTask, DailyAttendance } from '@/types';

export class SmartAcademicEngine {
  static generateDailyRecommendations(
    attendanceData: DailyAttendance[], 
    subjects: Subject[], 
    tasks: StudyTask[]
  ): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    subjects.forEach(subject => {
      const attendance = calculateSubjectAttendance(subject.id);
      const subjectTasks = tasks.filter(t => t.subjectId === subject.id && t.status === 'pending');
      const upcomingTasks = subjectTasks.filter(t => t.targetDate <= today);
      
      if (attendance.percentage < 65) {
        recommendations.push({
          subject: subject.name,
          priority: 'high',
          estimatedTime: '1h 30m',
          reason: 'Low attendance',
          tasks: upcomingTasks.map(t => t.description)
        });
      } else if (attendance.percentage < 75) {
        recommendations.push({
          subject: subject.name,
          priority: 'medium',
          estimatedTime: '1h',
          reason: 'Moderate attendance',
          tasks: upcomingTasks.map(t => t.description)
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static calculatePerformanceIndex(): AcademicPerformanceIndex {
    const { calculateSubjectAttendance } = useAttendance();
    const { subjects } = useSubjects();
    const { tasks } = useStudyTasks();
    
    // Calculate attendance score
    const attendanceScores = subjects.map(s => calculateSubjectAttendance(s.id).percentage);
    const avgAttendance = attendanceScores.reduce((a, b) => a + b, 0) / attendanceScores.length || 0;
    
    // Calculate task completion
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate progress (simplified)
    const progress = Math.min(avgAttendance + taskCompletion / 2, 100);
    
    // Calculate study consistency
    const studyConsistency = Math.min(tasks.length / 30 * 100, 100);
    
    const overall = (avgAttendance * 0.35) + (taskCompletion * 0.25) + (progress * 0.30) + (studyConsistency * 0.10);
    
    let level: AcademicPerformanceIndex['level'];
    if (overall >= 85) level = 'excellent';
    else if (overall >= 70) level = 'good';
    else if (overall >= 55) level = 'average';
    else if (overall >= 40) level = 'poor';
    else level = 'critical';
    
    const suggestions = [];
    if (avgAttendance < 75) suggestions.push('Improve class attendance');
    if (taskCompletion < 70) suggestions.push('Complete pending tasks');
    if (studyConsistency < 60) suggestions.push('Maintain consistent study schedule');
    
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

  static assessRisk(): RiskAssessment {
    const { calculateSubjectAttendance } = useAttendance();
    const { subjects } = useSubjects();
    const { tasks } = useStudyTasks();
    
    const attendanceScores = subjects.map(s => calculateSubjectAttendance(s.id).percentage);
    const avgAttendance = attendanceScores.reduce((a, b) => a + b, 0) / attendanceScores.length || 0;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    let level: RiskAssessment['level'];
    const factors = [];
    const warnings = [];
    const recommendations = [];
    
    if (avgAttendance < 65 || pendingTasks > 5) {
      level = 'high';
      factors.push('Low attendance', 'High task backlog');
      warnings.push('Academic performance at risk');
      recommendations.push('Immediate action required');
    } else if (avgAttendance < 75) {
      level = 'moderate';
      factors.push('Moderate attendance');
      warnings.push('Monitor progress closely');
      recommendations.push('Focus on attendance');
    } else {
      level = 'low';
      recommendations.push('Maintain current performance');
    }
    
    return { level, factors, warnings, recommendations };
  }

  static generateWeeklyPlan(): WeeklyPlan {
    const { subjects } = useSubjects();
    const { tasks } = useStudyTasks();
    
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    
    const dailyPlan: WeeklyPlan['dailyPlan'] = {};
    const weeklyGoals: string[] = [];
    let totalHours = 0;
    
    // Generate plan for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.targetDate === dateStr && t.status === 'pending');
      const studyTime = Math.max(2, dayTasks.length * 1.5); // 2h base + 1.5h per task
      
      dailyPlan[dateStr] = {
        subjects: subjects.slice(0, 3).map(s => s.name), // Top 3 subjects
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

  static calculateProductivityMetrics(): ProductivityMetrics {
    const { calculateSubjectAttendance } = useAttendance();
    const { subjects } = useSubjects();
    const { tasks } = useStudyTasks();
    
    // Calculate attendance rate
    const attendanceScores = subjects.map(s => calculateSubjectAttendance(s.id).percentage);
    const attendanceRate = attendanceScores.reduce((a, b) => a + b, 0) / attendanceScores.length || 0;
    
    // Calculate task completion rate
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate consistency (based on task dates)
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= lastMonth);
    const consistency = Math.min((recentTasks.length / 30) * 100, 100);
    
    // Calculate study streak
    const studyStreak = Math.min(tasks.filter(t => t.status === 'completed').length, 30);
    
    // Calculate EduScore
    const eduScore = (attendanceRate * 0.4) + (taskCompletionRate * 0.4) + (consistency * 0.2);
    
    // Determine weekly trend
    const weeklyTrend: ProductivityMetrics['weeklyTrend'] = 
      taskCompletionRate > 70 ? 'improving' : 
      taskCompletionRate > 50 ? 'stable' : 'declining';
    
    const subjectPerformance: ProductivityMetrics['subjectPerformance'] = {};
    subjects.forEach(subject => {
      const attendance = calculateSubjectAttendance(subject.id).percentage;
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

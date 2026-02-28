import { useMemo } from 'react';
import { useAttendance, useSubjects } from './useData';

export interface AnalyticsData {
  attendanceTrends: {
    subjectId: string;
    subjectName: string;
    data: { date: string; percentage: number }[];
  }[];
  subjectComparison: {
    subjectId: string;
    subjectName: string;
    percentage: number;
    present: number;
    total: number;
  }[];
  studyHeatmap: {
    date: string;
    count: number;
    intensity: number;
  }[];
}

export function useAnalyticsData(): AnalyticsData {
  const { attendanceData, calculateSubjectAttendance } = useAttendance();
  const { subjects } = useSubjects();

  return useMemo(() => {
    // 1. Attendance Trends per subject
    const attendanceTrends = subjects.map(subject => {
      const trendData = attendanceData
        .filter(day => day.subjects && day.subjects[subject.id] !== undefined)
        .map(day => {
          const subjectStatus = day.subjects[subject.id];
          const totalSubjects = Object.keys(day.subjects).filter(id => subjects.find(s => s.id === id)).length;
          // Calculate daily attendance percentage for this subject
          const percentage = subjectStatus === 'present' ? (100 / totalSubjects) : 
                           subjectStatus === 'absent' ? 0 : 
                           subjectStatus === 'cancelled' ? 0 : null;
          return {
            date: day.date,
            percentage: percentage || 0
          };
        })
        .filter(day => day.percentage !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        data: trendData
      };
    });

    // 2. Subject Performance Comparison
    const subjectComparison = subjects.map(subject => {
      const stats = calculateSubjectAttendance(subject.id);
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        percentage: stats.percentage,
        present: stats.present,
        total: stats.total
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // 3. Study Activity Heatmap (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const heatmapData: { [key: string]: number } = {};
    
    attendanceData.forEach(day => {
      const dayDate = new Date(day.date);
      if (dayDate >= ninetyDaysAgo) {
        const activityCount = Object.keys(day.subjects).length;
        heatmapData[day.date] = activityCount;
      }
    });

    const studyHeatmap = Object.entries(heatmapData).map(([date, count]) => {
      // Calculate intensity based on number of subjects (0-5 scale)
      const intensity = Math.min(Math.ceil(count / 2), 5);
      return { date, count, intensity };
    });

    return {
      attendanceTrends,
      subjectComparison,
      studyHeatmap
    };
  }, [attendanceData, subjects, calculateSubjectAttendance]);
}

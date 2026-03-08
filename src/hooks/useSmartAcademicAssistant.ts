import { useState, useEffect, useCallback, useRef } from 'react';
import { SmartAcademicEngine } from '@/lib/academicEngine';
import type { StudyRecommendation, AcademicPerformanceIndex, RiskAssessment, WeeklyPlan, ProductivityMetrics } from '@/types/academic';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSubjects, useStudyTasks, useAttendance } from '@/hooks/useData';

export function useSmartAcademicAssistant() {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [performanceIndex, setPerformanceIndex] = useState<AcademicPerformanceIndex | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null);

  const [savedPlans, setSavedPlans] = useLocalStorage<WeeklyPlan[]>('edu-tracker-study-plans', []);

  // Pull data from existing hooks
  const { subjects } = useSubjects();
  const { tasks } = useStudyTasks();
  const { attendanceData } = useAttendance();

  // Use refs to avoid stale closures and infinite loops
  const subjectsRef = useRef(subjects);
  const tasksRef = useRef(tasks);
  const attendanceRef = useRef(attendanceData);

  subjectsRef.current = subjects;
  tasksRef.current = tasks;
  attendanceRef.current = attendanceData;

  // Compute all analytics when data changes (single effect, no circular deps)
  useEffect(() => {
    try {
      setRecommendations(SmartAcademicEngine.generateDailyRecommendations(subjects, tasks, attendanceData));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
    try {
      setPerformanceIndex(SmartAcademicEngine.calculatePerformanceIndex(subjects, tasks, attendanceData));
    } catch (error) {
      console.error('Error calculating performance:', error);
    }
    try {
      setRiskAssessment(SmartAcademicEngine.assessRisk(subjects, tasks, attendanceData));
    } catch (error) {
      console.error('Error assessing risk:', error);
    }
    try {
      setProductivityMetrics(SmartAcademicEngine.calculateProductivityMetrics(subjects, tasks, attendanceData));
    } catch (error) {
      console.error('Error calculating productivity:', error);
    }
  }, [subjects, tasks, attendanceData]);

  // Manual refresh actions (use refs to avoid dep chains)
  const generateRecommendations = useCallback(() => {
    try {
      setRecommendations(SmartAcademicEngine.generateDailyRecommendations(subjectsRef.current, tasksRef.current, attendanceRef.current));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }, []);

  const calculatePerformance = useCallback(() => {
    try {
      setPerformanceIndex(SmartAcademicEngine.calculatePerformanceIndex(subjectsRef.current, tasksRef.current, attendanceRef.current));
    } catch (error) {
      console.error('Error calculating performance:', error);
    }
  }, []);

  const assessRisk = useCallback(() => {
    try {
      setRiskAssessment(SmartAcademicEngine.assessRisk(subjectsRef.current, tasksRef.current, attendanceRef.current));
    } catch (error) {
      console.error('Error assessing risk:', error);
    }
  }, []);

  const generateWeeklyPlan = useCallback(() => {
    try {
      const plan = SmartAcademicEngine.generateWeeklyPlan(subjectsRef.current, tasksRef.current);
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('Error generating weekly plan:', error);
    }
  }, []);

  const calculateProductivity = useCallback(() => {
    try {
      setProductivityMetrics(SmartAcademicEngine.calculateProductivityMetrics(subjectsRef.current, tasksRef.current, attendanceRef.current));
    } catch (error) {
      console.error('Error calculating productivity:', error);
    }
  }, []);

  // Save weekly plan
  const saveWeeklyPlan = useCallback((plan: WeeklyPlan) => {
    setSavedPlans(prev => [...prev, plan]);
    setWeeklyPlan(plan);
  }, [setSavedPlans]);

  // Load saved plan
  const loadSavedPlan = useCallback((weekOf: string) => {
    const saved = savedPlans.find(p => p.weekOf === weekOf);
    if (saved) {
      setWeeklyPlan(saved);
    }
  }, [savedPlans]);

  // Generate smart notifications
  const generateSmartNotifications = useCallback(() => {
    const notifications = [];

    if (riskAssessment?.level === 'high') {
      notifications.push({
        title: 'High Risk Alert',
        message: 'Your academic performance requires immediate attention',
        type: 'risk',
        priority: 'high'
      });
    }

    if (performanceIndex?.level === 'poor' || performanceIndex?.level === 'critical') {
      notifications.push({
        title: 'Performance Warning',
        message: `Current performance level: ${performanceIndex?.level}`,
        type: 'performance',
        priority: 'medium'
      });
    }

    if (recommendations.length > 0) {
      notifications.push({
        title: 'Study Recommendations',
        message: `${recommendations.length} subjects need your attention today`,
        type: 'recommendation',
        priority: 'medium'
      });
    }

    return notifications;
  }, [riskAssessment, performanceIndex, recommendations]);

  return {
    // Data
    recommendations,
    performanceIndex,
    riskAssessment,
    weeklyPlan,
    productivityMetrics,
    savedPlans,

    // Actions
    generateRecommendations,
    calculatePerformance,
    assessRisk,
    generateWeeklyPlan,
    calculateProductivity,
    saveWeeklyPlan,
    loadSavedPlan,
    generateSmartNotifications
  };
}


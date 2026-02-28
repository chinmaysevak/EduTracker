import { useState, useEffect, useCallback } from 'react';
import { SmartAcademicEngine } from '@/lib/academicEngine';
import type { StudyRecommendation, AcademicPerformanceIndex, RiskAssessment, WeeklyPlan, ProductivityMetrics } from '@/types/academic';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useSmartAcademicAssistant() {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [performanceIndex, setPerformanceIndex] = useState<AcademicPerformanceIndex | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics | null>(null);
  
  const [savedPlans, setSavedPlans] = useLocalStorage<WeeklyPlan[]>('edu-tracker-study-plans', []);

  // Generate daily recommendations
  const generateRecommendations = useCallback(() => {
    try {
      const newRecommendations = SmartAcademicEngine.generateDailyRecommendations();
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }, []);

  // Calculate performance index
  const calculatePerformance = useCallback(() => {
    try {
      const performance = SmartAcademicEngine.calculatePerformanceIndex();
      setPerformanceIndex(performance);
    } catch (error) {
      console.error('Error calculating performance:', error);
    }
  }, []);

  // Assess risk
  const assessRisk = useCallback(() => {
    try {
      const risk = SmartAcademicEngine.assessRisk();
      setRiskAssessment(risk);
    } catch (error) {
      console.error('Error assessing risk:', error);
    }
  }, []);

  // Generate weekly plan
  const generateWeeklyPlan = useCallback(() => {
    try {
      const plan = SmartAcademicEngine.generateWeeklyPlan();
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('Error generating weekly plan:', error);
    }
  }, []);

  // Calculate productivity metrics
  const calculateProductivity = useCallback(() => {
    try {
      const metrics = SmartAcademicEngine.calculateProductivityMetrics();
      setProductivityMetrics(metrics);
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

  // Initialize all calculations
  useEffect(() => {
    generateRecommendations();
    calculatePerformance();
    assessRisk();
    calculateProductivity();
  }, [generateRecommendations, calculatePerformance, assessRisk, calculateProductivity]);

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

// ============================================
// Tutorial Context — State Management Engine
// ============================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TUTORIAL_STEPS, TOTAL_STEPS } from './tutorialSteps';

interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  hasCompleted: boolean;
  showChapterTransition: boolean;
  chapterTransitionData: { chapter: number; title: string; icon: string } | null;
  isTransitioning: boolean;
}

interface TutorialContextType extends TutorialState {
  currentStep: typeof TUTORIAL_STEPS[number] | null;
  progress: number;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  totalSteps: number;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
}

// Check if tutorial has been completed for this user
function getStoredCompletion(userId?: string): boolean {
  if (!userId) return false;
  return localStorage.getItem(`edutracker_tutorial_completed_${userId}`) === 'true';
}

function getStoredProgress(userId?: string): number {
  if (!userId) return 0;
  const stored = localStorage.getItem(`edutracker_tutorial_progress_${userId}`);
  if (stored) {
    try {
      return parseInt(stored, 10) || 0;
    } catch { return 0; }
  }
  return 0;
}

function saveProgress(userId: string | undefined, stepIndex: number) {
  if (!userId) return;
  localStorage.setItem(`edutracker_tutorial_progress_${userId}`, String(stepIndex));
}

function saveCompletion(userId: string | undefined) {
  if (!userId) return;
  localStorage.setItem(`edutracker_tutorial_completed_${userId}`, 'true');
  localStorage.removeItem(`edutracker_tutorial_progress_${userId}`);
}

function clearCompletion(userId: string | undefined) {
  if (!userId) return;
  localStorage.removeItem(`edutracker_tutorial_completed_${userId}`);
  localStorage.removeItem(`edutracker_tutorial_progress_${userId}`);
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<TutorialState>({
    isActive: false,
    currentStepIndex: 0,
    hasCompleted: false,
    showChapterTransition: false,
    chapterTransitionData: null,
    isTransitioning: false,
  });

  // Load completion status on mount
  useEffect(() => {
    if (user?.id) {
      const completed = getStoredCompletion(user.id);
      setState(prev => ({ ...prev, hasCompleted: completed }));
    }
  }, [user?.id]);

  const currentStep = state.isActive ? TUTORIAL_STEPS[state.currentStepIndex] || null : null;
  const progress = state.isActive ? ((state.currentStepIndex + 1) / TOTAL_STEPS) * 100 : 0;

  const navigateToStep = useCallback((step: typeof TUTORIAL_STEPS[number]) => {
    if (step.navigateTo && location.pathname !== step.navigateTo) {
      navigate(step.navigateTo);
    }
  }, [navigate, location.pathname]);

  const showChapterTransitionIfNeeded = useCallback((fromIndex: number, toIndex: number): boolean => {
    const fromStep = TUTORIAL_STEPS[fromIndex];
    const toStep = TUTORIAL_STEPS[toIndex];
    if (!fromStep || !toStep) return false;

    if (fromStep.chapter !== toStep.chapter) {
      setState(prev => ({
        ...prev,
        isTransitioning: true,
        showChapterTransition: true,
        chapterTransitionData: {
          chapter: toStep.chapter,
          title: toStep.chapterTitle,
          icon: toStep.chapterIcon,
        },
      }));

      // Auto-dismiss chapter transition after 1.8s
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showChapterTransition: false,
          chapterTransitionData: null,
        }));

        // Navigate and show the step after a small delay
        navigateToStep(toStep);
        
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentStepIndex: toIndex,
            isTransitioning: false,
          }));
          saveProgress(user?.id, toIndex);
        }, toStep.delay || 300);
      }, 1800);

      return true;
    }
    return false;
  }, [navigateToStep, user?.id]);

  const startTutorial = useCallback(() => {
    const savedProgress = getStoredProgress(user?.id);
    const startIndex = savedProgress > 0 && savedProgress < TOTAL_STEPS ? savedProgress : 0;
    const step = TUTORIAL_STEPS[startIndex];

    setState(prev => ({
      ...prev,
      isActive: true,
      currentStepIndex: startIndex,
      hasCompleted: false,
      isTransitioning: false,
      showChapterTransition: false,
      chapterTransitionData: null,
    }));

    if (startIndex === 0) {
      // Show first chapter transition
      setState(prev => ({
        ...prev,
        isActive: true,
        isTransitioning: true,
        showChapterTransition: true,
        chapterTransitionData: {
          chapter: step.chapter,
          title: step.chapterTitle,
          icon: step.chapterIcon,
        },
      }));

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showChapterTransition: false,
          chapterTransitionData: null,
        }));
        if (step.navigateTo) navigate(step.navigateTo);
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isTransitioning: false,
            currentStepIndex: 0,
          }));
        }, step.delay || 300);
      }, 1800);
    } else {
      if (step.navigateTo) navigate(step.navigateTo);
    }

    clearCompletion(user?.id);
  }, [user?.id, navigate]);

  const nextStep = useCallback(() => {
    if (state.isTransitioning) return;

    const nextIndex = state.currentStepIndex + 1;
    if (nextIndex >= TOTAL_STEPS) {
      // Tutorial complete!
      setState(prev => ({
        ...prev,
        isActive: false,
        hasCompleted: true,
        currentStepIndex: 0,
      }));
      saveCompletion(user?.id);
      navigate('/dashboard');
      return;
    }

    // Check if we need a chapter transition
    const needsTransition = showChapterTransitionIfNeeded(state.currentStepIndex, nextIndex);
    if (!needsTransition) {
      const nextStepData = TUTORIAL_STEPS[nextIndex];
      navigateToStep(nextStepData);
      
      if (nextStepData.navigateTo && location.pathname !== nextStepData.navigateTo) {
        setState(prev => ({ ...prev, isTransitioning: true }));
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            currentStepIndex: nextIndex,
            isTransitioning: false,
          }));
          saveProgress(user?.id, nextIndex);
        }, nextStepData.delay || 300);
      } else {
        setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
        saveProgress(user?.id, nextIndex);
      }
    }
  }, [state.currentStepIndex, state.isTransitioning, showChapterTransitionIfNeeded, navigateToStep, user?.id, navigate, location.pathname]);

  const prevStep = useCallback(() => {
    if (state.isTransitioning) return;
    if (state.currentStepIndex <= 0) return;

    const prevIndex = state.currentStepIndex - 1;
    const prevStepData = TUTORIAL_STEPS[prevIndex];
    
    if (prevStepData.navigateTo && location.pathname !== prevStepData.navigateTo) {
      navigate(prevStepData.navigateTo);
      setState(prev => ({ ...prev, isTransitioning: true }));
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentStepIndex: prevIndex,
          isTransitioning: false,
        }));
        saveProgress(user?.id, prevIndex);
      }, prevStepData.delay || 300);
    } else {
      setState(prev => ({ ...prev, currentStepIndex: prevIndex }));
      saveProgress(user?.id, prevIndex);
    }
  }, [state.currentStepIndex, state.isTransitioning, navigate, location.pathname, user?.id]);

  const skipTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      showChapterTransition: false,
      chapterTransitionData: null,
      isTransitioning: false,
    }));
    saveCompletion(user?.id);
    navigate('/dashboard');
  }, [user?.id, navigate]);

  const resetTutorial = useCallback(() => {
    clearCompletion(user?.id);
    setState(prev => ({
      ...prev,
      hasCompleted: false,
      currentStepIndex: 0,
    }));
  }, [user?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skipTutorial();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isActive, nextStep, prevStep, skipTutorial]);

  return (
    <TutorialContext.Provider
      value={{
        ...state,
        currentStep,
        progress,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        resetTutorial,
        totalSteps: TOTAL_STEPS,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

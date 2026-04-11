// ============================================
// Tutorial Overlay — FC Mobile-Style Spotlight
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTutorial } from './TutorialContext';
import { TutorialMascot } from './TutorialMascot';
import { TOTAL_STEPS } from './tutorialSteps';
import './tutorial.css';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function TutorialConfetti() {
  const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#06B6D4'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="tutorial-confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="tutorial-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentStepIndex,
    progress,
    nextStep,
    prevStep,
    skipTutorial,
    showChapterTransition,
    chapterTransitionData,
    isTransitioning,
    totalSteps,
  } = useTutorial();

  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mascotPos, setMascotPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chapterExiting, setChapterExiting] = useState(false);
  
  const bubbleRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  // Keep track of previous positions to avoid unnecessary state updates
  const lastMetrics = useRef({
    spotlightStr: '',
    bubbleStr: '',
    mascotStr: ''
  });

  const getPositionMetrics = useCallback((step: typeof currentStep) => {
    if (!step) return null;

    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    // Full-screen steps (welcome/finale)
    if (step.targetSelector === 'body') {
      return {
        isFullscreen: true,
        spotlight: null,
        bubblePos: {
          top: viewH * 0.35,
          left: Math.max(16, (viewW - 380) / 2),
        },
        mascotPos: {
          top: viewH * 0.35 - 90,
          left: (viewW / 2) - 36,
        }
      };
    }

    const els = document.querySelectorAll(step.targetSelector);
    const el = Array.from(els).find(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    });
    
    if (!el) {
      // Element not found — show centered fallback
      return {
        isFullscreen: false,
        spotlight: null,
        bubblePos: {
          top: viewH * 0.4,
          left: Math.max(16, (viewW - 380) / 2),
        },
        mascotPos: {
          top: viewH * 0.4 - 90,
          left: (viewW / 2) - 36,
        }
      };
    }

    const rect = el.getBoundingClientRect();
    const pad = step.spotlightPadding || 8;

    const spotRect: SpotlightRect = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    };

    // Determine bubble position avoiding edges and mascot collision
    const bubbleW = Math.min(380, viewW - 32);
    // Estimate bubble height or use fixed
    const bubbleH = bubbleRef.current ? bubbleRef.current.offsetHeight : 220; 
    let bTop = 0;
    let bLeft = 0;

    const position = step.position || 'auto';

    const spaceBelow = viewH - spotRect.top - spotRect.height;
    const spaceAbove = spotRect.top;
    const spaceRight = viewW - spotRect.left - spotRect.width;
    const spaceLeft = spotRect.left;

    const mascotHeight = 90;
    const mascotWidth = 72;
    const bottomSafeZone = 80;

    if (position === 'auto') {
      if (spaceBelow >= bubbleH + bottomSafeZone + mascotHeight) {
        bTop = spotRect.top + spotRect.height + 24;
        bLeft = Math.max(16, Math.min(spotRect.left, viewW - bubbleW - 16));
      } else if (spaceAbove >= bubbleH + mascotHeight + 20) {
        bTop = spotRect.top - bubbleH - 24;
        bLeft = Math.max(16, Math.min(spotRect.left, viewW - bubbleW - 16));
      } else if (spaceRight >= bubbleW + 80) {
        bTop = Math.max(mascotHeight, spotRect.top);
        bLeft = spotRect.left + spotRect.width + 24;
      } else if (spaceLeft >= bubbleW + 80) {
        bTop = Math.max(mascotHeight, spotRect.top);
        bLeft = spotRect.left - bubbleW - 24;
      } else {
        // Fallback: If it's a huge target, overlay it safely at the bottom or middle.
        bTop = Math.max(mascotHeight + 16, spotRect.top + spotRect.height / 2 - bubbleH / 2);
        bLeft = Math.max(16, (viewW - bubbleW) / 2);
      }
    } else if (position === 'bottom') {
      bTop = spotRect.top + spotRect.height + 24;
      bLeft = Math.max(16, Math.min(spotRect.left, viewW - bubbleW - 16));
    } else if (position === 'top') {
      bTop = spotRect.top - bubbleH - 24;
      bLeft = Math.max(16, Math.min(spotRect.left, viewW - bubbleW - 16));
    } else if (position === 'right') {
      bTop = Math.max(mascotHeight, spotRect.top);
      bLeft = spotRect.left + spotRect.width + 24;
    } else if (position === 'left') {
      bTop = Math.max(mascotHeight, spotRect.top);
      bLeft = spotRect.left - bubbleW - 24;
    }

    // Clamp Bubble to viewport safely
    bTop = Math.max(mascotHeight + 16, Math.min(bTop, viewH - bubbleH - bottomSafeZone));
    bLeft = Math.max(16, Math.min(bLeft, viewW - bubbleW - 16));

    // Mascot position logic: Attach neatly to top-left of bubble
    let mTop = bTop - 70;
    let mLeft = bLeft - 20;

    // Smart mascot shifting if hitting left boundary
    if (mLeft < 16) {
      mLeft = bLeft + bubbleW - 60; // Move to top-right of bubble instead
    }
    
    // Smart mascot shifting if hitting top boundary
    // Just in case it's still negative after the clamping above
    if (mTop < 16) {
      mTop = bTop + 20; // Move it to the side of the bubble instead of above
      mLeft = bLeft - 80;
      if (mLeft < 16) mLeft = bLeft + bubbleW; // Try right side if left is blocked
    }

    // Final safety clamp for Mascot
    mLeft = Math.max(16, Math.min(mLeft, viewW - mascotWidth - 16));
    mTop = Math.max(16, Math.min(mTop, viewH - mascotHeight - 16));

    return {
      isFullscreen: false,
      spotlight: spotRect,
      bubblePos: { top: bTop, left: bLeft },
      mascotPos: { top: mTop, left: mLeft }
    };
  }, []);

  const updatePositions = useCallback(() => {
    if (!currentStep || isTransitioning) return;

    const metrics = getPositionMetrics(currentStep);
    if (!metrics) return;

    // Use stringification for rapid comparisons and less stale closures
    const spotlightStr = JSON.stringify({
      t: Math.round(metrics.spotlight?.top || 0),
      l: Math.round(metrics.spotlight?.left || 0),
      w: Math.round(metrics.spotlight?.width || 0),
      h: Math.round(metrics.spotlight?.height || 0)
    });
    
    const bubbleStr = JSON.stringify({
      t: Math.round(metrics.bubblePos.top),
      l: Math.round(metrics.bubblePos.left)
    });

    const mascotStr = JSON.stringify({
      t: Math.round(metrics.mascotPos.top),
      l: Math.round(metrics.mascotPos.left)
    });

    if (
      lastMetrics.current.spotlightStr !== spotlightStr ||
      lastMetrics.current.bubbleStr !== bubbleStr ||
      lastMetrics.current.mascotStr !== mascotStr ||
      isFullscreen !== metrics.isFullscreen
    ) {
      lastMetrics.current = { spotlightStr, bubbleStr, mascotStr };
      setIsFullscreen(metrics.isFullscreen);
      setSpotlight(metrics.spotlight);
      setBubblePos(metrics.bubblePos);
      setMascotPos(metrics.mascotPos);
    }
    
    rafId.current = requestAnimationFrame(updatePositions);
  }, [currentStep, isTransitioning, isFullscreen, getPositionMetrics]);

  // Initial setup and scrolling for new step
  useEffect(() => {
    if (!isActive || !currentStep || isTransitioning) return;
    
    // Confetti logic
    if (currentStep.id === 'tutorial-complete') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }

    // Scroll into view logic on FIRST mount of this step
    if (currentStep.targetSelector !== 'body') {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        // If element is out of bounds or cut off significantly
        if (rect.top < 100 || rect.bottom > viewH - 100) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    // Start 60fps tracking loop
    rafId.current = requestAnimationFrame(updatePositions);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isActive, currentStep, isTransitioning, updatePositions]);

  // Handle chapter transition exit animation
  useEffect(() => {
    if (!showChapterTransition) {
      setChapterExiting(false);
    }
  }, [showChapterTransition]);

  if (!isActive) return null;

  // Chapter transition screen
  if (showChapterTransition && chapterTransitionData) {
    return (
      <div className={`tutorial-chapter-transition ${chapterExiting ? 'exiting' : ''}`}>
        <div className="tutorial-chapter-icon">
          {chapterTransitionData.icon}
        </div>
        <div className="tutorial-chapter-label">
          Chapter {chapterTransitionData.chapter}
        </div>
        <div className="tutorial-chapter-title">
          {chapterTransitionData.title}
        </div>
      </div>
    );
  }

  // Don't show overlay during transition
  if (isTransitioning) {
    return (
      <div className="tutorial-overlay active">
        <div className="tutorial-progress-bar">
          <div className="tutorial-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  const isLastStep = currentStepIndex >= TOTAL_STEPS - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <>
      {showConfetti && <TutorialConfetti />}
      
      <div className="tutorial-overlay active" style={{ zIndex: 100000 }}>
        {/* Progress Bar */}
        <div className="tutorial-progress-bar">
          <div className="tutorial-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Skip Button */}
        <button className="tutorial-btn-skip" onClick={skipTutorial}>
          Skip Tutorial ✕
        </button>

        {/* SVG Overlay with cutout */}
        <svg
          className="tutorial-overlay-bg"
          width="100%"
          height="100%"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            // Clicking overlay blocks underlying clicks
            e.stopPropagation();
          }}
        >
          <defs>
            <mask id="tutorial-mask">
              {/* White = visible (dark overlay) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black = transparent (spotlight hole) */}
              {spotlight && !isFullscreen && (
                currentStep.spotlightShape === 'circle' ? (
                  <circle
                    cx={spotlight.left + spotlight.width / 2}
                    cy={spotlight.top + spotlight.height / 2}
                    r={Math.max(spotlight.width, spotlight.height) / 2}
                    fill="black"
                  />
                ) : (
                  <rect
                    x={spotlight.left}
                    y={spotlight.top}
                    width={spotlight.width}
                    height={spotlight.height}
                    rx="16"
                    fill="black"
                  />
                )
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* Spotlight glow ring */}
        {spotlight && !isFullscreen && (
          <div
            className={`tutorial-spotlight-ring ${currentStep.spotlightShape === 'circle' ? 'circle' : ''}`}
            style={
              currentStep.spotlightShape === 'circle'
                ? {
                    top: spotlight.top + spotlight.height / 2 - Math.max(spotlight.width, spotlight.height) / 2,
                    left: spotlight.left + spotlight.width / 2 - Math.max(spotlight.width, spotlight.height) / 2,
                    width: Math.max(spotlight.width, spotlight.height),
                    height: Math.max(spotlight.width, spotlight.height),
                  }
                : {
                    top: spotlight.top,
                    left: spotlight.left,
                    width: spotlight.width,
                    height: spotlight.height,
                  }
            }
          />
        )}

        {/* Mascot */}
        <TutorialMascot
          pose={currentStep.mascotPose}
          style={{
            top: mascotPos.top,
            left: mascotPos.left,
          }}
        />

        {/* Speech Bubble */}
        <div
          ref={bubbleRef}
          className="tutorial-speech-bubble"
          key={currentStep.id}
          style={{
            top: bubblePos.top,
            left: bubblePos.left,
          }}
        >
          <div className="tutorial-bubble-title">{currentStep.title}</div>
          <div className="tutorial-bubble-description">{currentStep.description}</div>
          <div className="tutorial-bubble-footer">
            <span className="tutorial-bubble-step-counter">
              {currentStep.chapterIcon} Ch.{currentStep.chapter} · Step {currentStepIndex + 1}/{totalSteps}
            </span>
            <div className="tutorial-bubble-actions">
              {!isFirstStep && (
                <button className="tutorial-btn-back" onClick={prevStep}>
                  ← Back
                </button>
              )}
              <button className="tutorial-btn-next" onClick={nextStep}>
                {isLastStep ? '🎉 Finish!' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


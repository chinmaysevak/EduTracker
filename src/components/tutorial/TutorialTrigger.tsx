// ============================================
// Tutorial Trigger — Floating Start Button
// ============================================

import { useState, useEffect } from 'react';
import { useTutorial } from './TutorialContext';
import { GraduationCap, RotateCcw } from 'lucide-react';

/** Floating button on Dashboard to start the tutorial */
export function TutorialTrigger() {
  const { hasCompleted, isActive, startTutorial } = useTutorial();
  const [visible, setVisible] = useState(false);
  const [dismissed] = useState(false);

  useEffect(() => {
    // Show the button after a short delay for a nice entrance
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Don't show if tutorial is currently active or the button was dismissed
  if (isActive || dismissed) return null;

  // If the user has completed the tutorial, show a subtle replay option
  if (hasCompleted) {
    return (
      <button
        className="tutorial-trigger-btn"
        onClick={startTutorial}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border) / 0.5)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          animation: 'none',
          fontSize: '12px',
          padding: '8px 14px',
        }}
      >
        <RotateCcw style={{ width: 14, height: 14 }} />
        Replay Tour
      </button>
    );
  }

  return (
    <button
      className="tutorial-trigger-btn"
      onClick={startTutorial}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <GraduationCap style={{ width: 18, height: 18 }} />
      Take a Tour
    </button>
  );
}

/** Button for Settings page to replay the tutorial */
export function TutorialReplayButton() {
  const { startTutorial, resetTutorial } = useTutorial();

  return (
    <button
      onClick={() => {
        resetTutorial();
        setTimeout(() => startTutorial(), 100);
      }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 hover:from-violet-500/20 hover:to-purple-500/20 hover:shadow-lg hover:shadow-violet-500/10 transition-all"
    >
      <GraduationCap className="w-4 h-4" />
      Replay Interactive Tutorial
    </button>
  );
}

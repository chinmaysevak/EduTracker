// ============================================
// Tutorial Steps — All chapters & steps data
// ============================================

export type MascotPose = 'idle' | 'waving' | 'pointing-right' | 'pointing-down' | 'celebrating';

export interface TutorialStep {
  id: string;
  chapter: number;
  chapterTitle: string;
  chapterIcon: string;
  targetSelector: string;
  title: string;
  description: string;
  mascotPose: MascotPose;
  spotlightPadding?: number;
  navigateTo?: string;
  interactive?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  spotlightShape?: 'rect' | 'circle';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ═══════════════════════════════
  // CHAPTER 1 — Welcome & Dashboard
  // ═══════════════════════════════
  {
    id: 'welcome-intro',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: 'body',
    title: "Hey! Let's get you started 👋",
    description: "Welcome to EduTrack — everything you need to stay on top of college, all in one place. I'm EduBot, and I'll walk you through the important stuff. Takes about 2 minutes!",
    mascotPose: 'waving',
    spotlightPadding: 0,
    navigateTo: '/dashboard',
    delay: 300,
  },
  {
    id: 'dashboard-greeting',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: '[data-tutorial="welcome-section"]',
    title: 'Your Dashboard',
    description: "This is home base. You'll see a greeting, today's date, and helpful tips that change based on what you've been up to. Think of it as your daily briefing.",
    mascotPose: 'pointing-down',
    spotlightPadding: 12,
    navigateTo: '/dashboard',
  },
  {
    id: 'dashboard-stats',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: '[data-tutorial="stat-pending"]',
    title: 'At a Glance',
    description: "Your stat cards (like Pending Tasks, Exams, Progress) give you an immediate overview of where things stand. Keep an eye on these!",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'dashboard-timetable',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: '[data-tutorial="timetable-widget"]',
    title: "Weekly Timetable",
    description: "Your classes for the week, laid out clearly with times and subjects. No more checking WhatsApp groups for the timetable.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'dashboard-attendance-widget',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: '[data-tutorial="attendance-widget"]',
    title: 'Attendance Snapshot',
    description: "A quick view of how your attendance looks across subjects. The color bars make it easy to spot which ones need more attention. 📊",
    mascotPose: 'pointing-right',
    spotlightPadding: 8,
  },
  {
    id: 'dashboard-quick-actions',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: '[data-tutorial="quick-actions"]',
    title: 'Quick Actions',
    description: "Shortcuts to the things you do most — mark attendance, add a task, check progress, or jump into a focus session. All one tap away.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'dashboard-customize',
    chapter: 1,
    chapterTitle: 'Welcome to EduTrack',
    chapterIcon: '🎓',
    targetSelector: '[data-tutorial="customize-layout"]',
    title: 'Make It Yours',
    description: "You can rearrange all these widgets. Hit this button to enter edit mode, then drag things around until it feels right. Your layout, your way.",
    mascotPose: 'celebrating',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 2 — Attendance Tracker
  // ═══════════════════════════════
  {
    id: 'attendance-intro',
    chapter: 2,
    chapterTitle: 'Attendance Tracker',
    chapterIcon: '📅',
    targetSelector: '[data-tutorial="attendance-hero"]',
    title: 'Attendance Tracker',
    description: "This is where you track every class. Mark attendance, see your stats, forecast whether you can afford to skip — it's all here. Let me show you around.",
    mascotPose: 'waving',
    spotlightPadding: 12,
    navigateTo: '/attendance',
    delay: 400,
  },
  {
    id: 'attendance-calendar',
    chapter: 2,
    chapterTitle: 'Attendance Tracker',
    chapterIcon: '📅',
    targetSelector: '[data-tutorial="attendance-calendar"]',
    title: 'The Calendar',
    description: "Tap any date to select it. Green dots mean you were present, red means absent, gray means cancelled. Use the arrows to switch months, and the Today button brings you right back.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'attendance-daily-panel',
    chapter: 2,
    chapterTitle: 'Attendance Tracker',
    chapterIcon: '📅',
    targetSelector: '[data-tutorial="attendance-daily-panel"]',
    title: 'Daily Classes',
    description: "Pick a date and this panel shows your classes for that day. Tap ✅ for present, ❌ for absent, or ➖ for cancelled. You can also add extra classes if your schedule changed.",
    mascotPose: 'pointing-right',
    spotlightPadding: 8,
  },
  {
    id: 'attendance-stats',
    chapter: 2,
    chapterTitle: 'Attendance Tracker',
    chapterIcon: '📅',
    targetSelector: '[data-tutorial="attendance-stats"]',
    title: 'Your Numbers',
    description: "Overall percentage, classes attended, classes missed, and how you're tracking against your goal. The colors shift (🟢🟡🔴) so you always know where you stand.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'attendance-table',
    chapter: 2,
    chapterTitle: 'Attendance Tracker',
    chapterIcon: '📅',
    targetSelector: '[data-tutorial="attendance-table"]',
    title: 'Subject Breakdown',
    description: "Every subject with its own attendance percentage, progress bar, and status badge. You can search, filter by status, and sort by any column to find what matters.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'attendance-forecast',
    chapter: 2,
    chapterTitle: 'Attendance Tracker',
    chapterIcon: '📅',
    targetSelector: '[data-tutorial="attendance-forecast"]',
    title: 'Forecast',
    description: "The question everyone asks — \"how many classes can I skip?\" This tells you exactly that, plus how many you need to attend to hit your target. Really handy before a long weekend.",
    mascotPose: 'celebrating',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 3 — Study Planner
  // ═══════════════════════════════
  {
    id: 'planner-intro',
    chapter: 3,
    chapterTitle: 'Study Planner',
    chapterIcon: '📋',
    targetSelector: '[data-tutorial="planner-header"]',
    title: 'Study Planner',
    description: "Tasks, exams, study sessions, and a calendar view — everything you need to plan your academics lives here. Let me walk you through each part.",
    mascotPose: 'waving',
    spotlightPadding: 12,
    navigateTo: '/planner',
    delay: 400,
  },
  {
    id: 'planner-tabs',
    chapter: 3,
    chapterTitle: 'Study Planner',
    chapterIcon: '📋',
    targetSelector: '[data-tutorial="planner-tabs"]',
    title: 'Four Tabs, One Planner',
    description: "Tasks — your to-dos with priorities and deadlines. Calendar — see everything on a timeline. Exams — upcoming tests with prep tracking. Sessions — scheduled study blocks for focused work.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'planner-add-buttons',
    chapter: 3,
    chapterTitle: 'Study Planner',
    chapterIcon: '📋',
    targetSelector: '[data-tutorial="planner-actions"]',
    title: 'Add New Items',
    description: "Create tasks, exams, or study sessions from here. The forms are smart — they'll suggest subjects, let you set priorities, and pick dates easily.",
    mascotPose: 'pointing-right',
    spotlightPadding: 8,
  },
  {
    id: 'planner-stats',
    chapter: 3,
    chapterTitle: 'Study Planner',
    chapterIcon: '📋',
    targetSelector: '[data-tutorial="planner-stats"]',
    title: 'Planner Overview',
    description: "A quick count of your total tasks, what's pending, what's done, anything overdue, plus upcoming exams and study sessions. Updates as you go. 📊",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 4 — Resources Library
  // ═══════════════════════════════
  {
    id: 'resources-intro',
    chapter: 4,
    chapterTitle: 'Resources Library',
    chapterIcon: '📚',
    targetSelector: '[data-tutorial="resources-header"]',
    title: 'Your Study Materials',
    description: "Keep all your study materials organized in one spot. PDFs, YouTube videos, useful links, and your own notes — sorted by subject so you find things fast.",
    mascotPose: 'waving',
    spotlightPadding: 12,
    navigateTo: '/resources',
    delay: 400,
  },
  {
    id: 'resources-search',
    chapter: 4,
    chapterTitle: 'Resources Library',
    chapterIcon: '📚',
    targetSelector: '[data-tutorial="resources-search"]',
    title: 'Search & Add',
    description: "Search by title or tag to find what you need. Hit 'Add Resource' to upload PDFs, paste a YouTube link, save a website URL, or write your own notes.",
    mascotPose: 'pointing-right',
    spotlightPadding: 8,
  },
  {
    id: 'resources-filter',
    chapter: 4,
    chapterTitle: 'Resources Library',
    chapterIcon: '📚',
    targetSelector: '[data-tutorial="resources-filter"]',
    title: 'Filter by Subject',
    description: "Use this sidebar to narrow things down. Click a subject to see only its materials, or click 'All Subjects' to see everything.",
    mascotPose: 'pointing-right',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 5 — Smart Advisor
  // ═══════════════════════════════
  {
    id: 'advisor-intro',
    chapter: 5,
    chapterTitle: 'Smart Advisor',
    chapterIcon: '🧠',
    targetSelector: '[data-tutorial="advisor-hero"]',
    title: 'Smart Advisor',
    description: "This is the clever part. The advisor looks at your attendance, task completion, and study habits, then gives you personalized suggestions to help you improve. The more you use EduTrack, the better it gets.",
    mascotPose: 'celebrating',
    spotlightPadding: 12,
    navigateTo: '/advisor',
    delay: 400,
  },
  {
    id: 'advisor-analytics',
    chapter: 5,
    chapterTitle: 'Smart Advisor',
    chapterIcon: '🧠',
    targetSelector: '[data-tutorial="advisor-analytics"]',
    title: 'Your Study Patterns',
    description: "See how your habits are shaping up — focus session trends, attendance patterns, task completion rates. It's like a fitness tracker, but for studying.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 6 — Progress Tracker
  // ═══════════════════════════════
  {
    id: 'progress-intro',
    chapter: 6,
    chapterTitle: 'Progress Tracker',
    chapterIcon: '🎯',
    targetSelector: '[data-tutorial="progress-hero"]',
    title: 'Syllabus Progress',
    description: "Break your syllabus into subjects, units, and topics. Check off what you've covered, and watch your completion grow. Great for exam prep when you need to know what's left. 🗺️",
    mascotPose: 'waving',
    spotlightPadding: 12,
    navigateTo: '/progress',
    delay: 400,
  },
  {
    id: 'progress-summary',
    chapter: 6,
    chapterTitle: 'Progress Tracker',
    chapterIcon: '🎯',
    targetSelector: '[data-tutorial="progress-summary"]',
    title: 'Overall Progress',
    description: "Your completion percentage across all subjects shown in a visual ring. It fills up as you tick off topics. Aim for 100% before exams! 💪",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'progress-subjects',
    chapter: 6,
    chapterTitle: 'Progress Tracker',
    chapterIcon: '🎯',
    targetSelector: '[data-tutorial="progress-subjects"]',
    title: 'Subject Cards',
    description: "Each card is a subject. Click to expand and see units and topics inside. Check the boxes as you finish them. You can also import your syllabus if you don't want to type it all out.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 7 — Focus Mode
  // ═══════════════════════════════
  {
    id: 'focus-intro',
    chapter: 7,
    chapterTitle: 'Focus Mode',
    chapterIcon: '⚡',
    targetSelector: '[data-tutorial="focus-dashboard-btn"]',
    title: 'Focus Mode',
    description: "When it's time to actually sit down and study, tap this. It opens a clean, full-screen Pomodoro timer that helps you stay locked in without distractions.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
    navigateTo: '/dashboard',
    delay: 400,
  },
  {
    id: 'focus-features',
    chapter: 7,
    chapterTitle: 'Focus Mode',
    chapterIcon: '⚡',
    targetSelector: '[data-tutorial="focus-dashboard-btn"]',
    title: 'What You Can Do Here',
    description: "🎵 Pick ambient sounds like rain, café noise, or a fireplace. Set your subject and session length (15–60 min). Built-in breaks keep you fresh, and your study time gets logged automatically.",
    mascotPose: 'celebrating',
    spotlightPadding: 8,
  },

  // ═══════════════════════════════
  // CHAPTER 8 — Settings & Finale
  // ═══════════════════════════════
  {
    id: 'settings-intro',
    chapter: 8,
    chapterTitle: 'Settings',
    chapterIcon: '⚙️',
    targetSelector: '[data-tutorial="settings-profile"]',
    title: 'Settings',
    description: "This is where you personalize everything — your profile, how the app looks, and important academic rules. Let me point out the highlights.",
    mascotPose: 'waving',
    spotlightPadding: 12,
    navigateTo: '/settings',
    delay: 400,
  },
  {
    id: 'settings-appearance',
    chapter: 8,
    chapterTitle: 'Settings',
    chapterIcon: '⚙️',
    targetSelector: '[data-tutorial="settings-appearance"]',
    title: 'Look & Feel',
    description: "🎨 Switch between light and dark mode, pick an accent color, or try one of the built-in themes like 'Midnight Aurora' or 'Cyber Neon'. You can even create custom color combos.",
    mascotPose: 'celebrating',
    spotlightPadding: 12,
  },
  {
    id: 'settings-academic',
    chapter: 8,
    chapterTitle: 'Settings',
    chapterIcon: '⚙️',
    targetSelector: '[data-tutorial="settings-academic"]',
    title: 'Academic Settings',
    description: "Set your attendance target here (like 75%). This one number drives all the \"classes needed\" and \"classes you can skip\" calculations across the app. Worth setting up carefully. 🎯",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'settings-data',
    chapter: 8,
    chapterTitle: 'Settings',
    chapterIcon: '⚙️',
    targetSelector: '[data-tutorial="settings-data"]',
    title: 'Your Data',
    description: "Export everything as a backup file, or import one you saved earlier. Pro tip: press Ctrl+K (or ⌘K on Mac) anywhere in the app to quickly jump to any section.",
    mascotPose: 'pointing-down',
    spotlightPadding: 8,
  },
  {
    id: 'tutorial-complete',
    chapter: 8,
    chapterTitle: 'Settings',
    chapterIcon: '⚙️',
    targetSelector: 'body',
    title: "You're all set! 🎉",
    description: "That's the full tour! You now know your way around EduTrack. A good first step is adding your subjects in the Attendance section, then explore from there. Good luck with your studies! 🚀",
    mascotPose: 'celebrating',
    spotlightPadding: 0,
    navigateTo: '/dashboard',
    delay: 300,
  },
];

export const TOTAL_CHAPTERS = 8;
export const TOTAL_STEPS = TUTORIAL_STEPS.length;

export function getChapterSteps(chapter: number): TutorialStep[] {
  return TUTORIAL_STEPS.filter(s => s.chapter === chapter);
}

export function getChapterProgress(chapter: number): { current: number; total: number } {
  const chapterSteps = getChapterSteps(chapter);
  return { current: 0, total: chapterSteps.length };
}

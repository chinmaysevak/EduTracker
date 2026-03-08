// ============================================
// Interactive User Tutorial Provider (driver.js)
// ============================================

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const startTutorial = (isManual = false) => {
    // Prevent auto-starting if already seen
    if (!isManual && localStorage.getItem('edu-tracker-tutorial-seen') === 'true') {
        return;
    }

    const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(0,0,0,0.7)',
        allowClose: true,
        doneBtnText: 'Start Exploring',
        nextBtnText: 'Next ➔',
        prevBtnText: '⬅ Prev',
        steps: [
            {
                element: '#app-sidebar',
                popover: {
                    title: 'Welcome to EduTracker! 🚀',
                    description: 'This is your navigation hub. From here you can access your Dashboard, AI Advisor, Progress Tracker, and more.',
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '#attendance-health-widget',
                popover: {
                    title: 'Attendance Health ❤️',
                    description: 'Keep your attendance above 75%. We\'ll automatically warn you if any subject drops into the danger zone.',
                    side: 'bottom',
                    align: 'center'
                }
            },
            {
                element: '#smart-advisor-tab',
                popover: {
                    title: 'Gemini AI Advisor 🧠',
                    description: 'This is your "God Level" study coach. It knows your attendance, overdue tasks, and upcoming exams. Ask it anything!',
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '#progress-tracker-tab',
                popover: {
                    title: 'AI Syllabus Scanner 📄',
                    description: 'Paste your syllabus text or upload an image. Our AI will instantly extract your subjects and chapters.',
                    side: 'right',
                    align: 'start'
                }
            },
            {
                element: '#gamification-profile',
                popover: {
                    title: 'Level Up! 🎮',
                    description: 'Complete study tasks and maintain focus streaks to earn XP, unlock levels, and collect badges. Check your profile in Settings!',
                    side: 'bottom',
                    align: 'start'
                }
            }
        ],
        onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || confirm('Are you sure you want to exit the tour?')) {
                localStorage.setItem('edu-tracker-tutorial-seen', 'true');
                driverObj.destroy();
            }
        },
    });

    driverObj.drive();
};

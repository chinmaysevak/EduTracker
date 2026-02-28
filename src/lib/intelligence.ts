import {
    differenceInDays,
    parseISO,
    startOfDay
} from 'date-fns';
import type {
    Subject,
    StudyTask,
    Topic,
    DailyAttendance
} from '@/types';

// Recommendation Interface
export interface Recommendation {
    id: string;
    type: 'urgent' | 'exam' | 'attendance' | 'backlog' | 'habit';
    title: string;
    description: string;
    priority: number; // 0-100, higher is more important
    actionLabel?: string;
    actionLink?: string;
    color?: string;
}

/**
 * Generates a prioritized list of actions for the student for "Today"
 */
export const generateDailyActionPlan = (
    subjects: Subject[],
    tasks: StudyTask[],
    attendanceStats: Record<string, { percentage: number; present: number; total: number }>,
    topics: Topic[]
): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const today = startOfDay(new Date());

    // 1. Critical Attendance Alerts (Highest Priority)
    subjects.forEach(subject => {
        const stats = attendanceStats[subject.id];
        if (!stats) return;

        if (stats.percentage < 75) {
            const isCritical = stats.percentage < 60;
            recommendations.push({
                id: `att-${subject.id}`,
                type: 'attendance',
                title: `Attendance Alert: ${subject.name}`,
                description: `Your attendance is ${stats.percentage}%. You need to attend upcoming classes to reach safe zone.`,
                priority: isCritical ? 95 : 85,
                actionLabel: 'Check Attendance',
                actionLink: 'attendance',
                color: isCritical ? 'bg-red-500' : 'bg-amber-500'
            });
        }
    });

    // 2. Urgent Assignments (Due Today or Tomorrow)
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    pendingTasks.forEach(task => {
        const dueDate = parseISO(task.targetDate);
        const daysLeft = differenceInDays(dueDate, today);

        if (daysLeft < 0) {
            // Overdue
            recommendations.push({
                id: `task-overdue-${task.id}`,
                type: 'urgent',
                title: `Overdue: ${task.description}`,
                description: `This task was due on ${task.targetDate}. Complete it ASAP.`,
                priority: 90,
                actionLabel: 'View Planner',
                actionLink: 'planner',
                color: 'bg-red-500'
            });
        } else if (daysLeft <= 1) {
            // Due Soon
            recommendations.push({
                id: `task-soon-${task.id}`,
                type: 'urgent',
                title: `Due ${daysLeft === 0 ? 'Today' : 'Tomorrow'}: ${task.description}`,
                description: `Don't miss the deadline for this task.`,
                priority: 80,
                actionLabel: 'Complete Now',
                actionLink: 'planner',
                color: 'bg-orange-500'
            });
        }
    });

    // 3. Exam Preparation
    subjects.forEach(subject => {
        if (subject.examDate) {
            const examDate = parseISO(subject.examDate);
            const daysToExam = differenceInDays(examDate, today);

            if (daysToExam > 0 && daysToExam <= 14) {
                // Exam approaching
                const priority = daysToExam <= 3 ? 92 : daysToExam <= 7 ? 82 : 70;

                // Check for backlog topics
                const subjectTopics = topics.filter(t => t.subjectId === subject.id && t.status !== 'mastered');
                const hardTopics = subjectTopics.filter(t => t.difficulty === 'hard').length;

                recommendations.push({
                    id: `exam-${subject.id}`,
                    type: 'exam',
                    title: `Exam in ${daysToExam} days: ${subject.name}`,
                    description: subjectTopics.length > 0
                        ? `You have ${subjectTopics.length} topics left to master, including ${hardTopics} hard ones.`
                        : `Time to start revising.`,
                    priority: priority,
                    actionLabel: 'Start Revision',
                    actionLink: 'materials',
                    color: 'bg-indigo-500'
                });
            }
        }
    });

    // 4. Backlog Recovery (If no urgent tasks)
    if (recommendations.length < 3) {
        // Find hardest pending topic
        const pendingTopics = topics.filter(t => t.status === 'pending');

        // Sort by difficulty (hard=3, medium=2, easy=1)
        const getDifficultyWeight = (d: string) => d === 'hard' ? 3 : d === 'medium' ? 2 : 1;

        pendingTopics.sort((a, b) => getDifficultyWeight(b.difficulty) - getDifficultyWeight(a.difficulty));

        if (pendingTopics.length > 0) {
            const topic = pendingTopics[0];
            const subject = subjects.find(s => s.id === topic.subjectId);
            if (subject) {
                recommendations.push({
                    id: `backlog-${topic.id}`,
                    type: 'backlog',
                    title: `Master Hard Topic: ${topic.name}`,
                    description: `This is a challenging topic in ${subject.name}. Tackle it while you have time.`,
                    priority: 60,
                    actionLabel: 'Study Now',
                    actionLink: 'materials',
                    color: 'bg-blue-500'
                });
            }
        }
    }

    // 5. Study Habit (Fallback)
    if (recommendations.length === 0) {
        recommendations.push({
            id: 'habit-daily',
            type: 'habit',
            title: 'Keep the streak alive!',
            description: 'Review your notes for 15 minutes today to maintain your learning momentum.',
            priority: 50,
            actionLabel: 'Start Session',
            actionLink: 'focus',
            color: 'bg-emerald-500'
        });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
};

export const predictAttendance = (
    currentPresent: number,
    currentTotal: number,
    classesToMiss: number
) => {
    const newTotal = currentTotal + classesToMiss;
    const newPercentage = newTotal > 0 ? Math.round((currentPresent / newTotal) * 100) : 0;

    let status: 'safe' | 'risk' | 'critical' = 'safe';
    if (newPercentage < 60) status = 'critical';
    else if (newPercentage < 75) status = 'risk';

    return {
        percentage: newPercentage,
        status
    };
};

import type { Subject, StudyTask } from '@/types';

// ============================================
// Attendance Predictive Math
// ============================================
export const calculateAttendanceSafeZone = (
    present: number,
    total: number,
    targetPercentage: number = 75
): { status: 'safe' | 'risk' | 'critical'; message: string; classesToAttend?: number; classesToMiss?: number } => {
    if (total === 0) return { status: 'safe', message: 'No classes yet' };

    const currentPercentage = (present / total) * 100;

    if (currentPercentage >= targetPercentage) {
        // How many can I miss?
        // (present) / (total + x) >= 0.75
        // present >= 0.75 * (total + x)
        // present / 0.75 >= total + x
        // (present / 0.75) - total >= x
        const safeToMiss = Math.floor((present / (targetPercentage / 100)) - total);

        return {
            status: 'safe',
            message: safeToMiss > 0
                ? `You can miss ${safeToMiss} classes safely`
                : 'You are safe, but keep attending',
            classesToMiss: safeToMiss
        };
    } else {
        // How many must I attend?
        // (present + x) / (total + x) >= 0.75
        // present + x >= 0.75 * total + 0.75 * x
        // x - 0.75 * x >= 0.75 * total - present
        // 0.25 * x >= 0.75 * total - present
        // x >= (0.75 * total - present) / 0.25
        const needed = Math.ceil(((targetPercentage / 100) * total - present) / (1 - (targetPercentage / 100)));

        return {
            status: currentPercentage < 60 ? 'critical' : 'risk',
            message: `You must attend ${needed} more classes to reach ${targetPercentage}%`,
            classesToAttend: needed
        };
    }
};

// ============================================
// Attendance Calculator Hook/Function (75% Req)
// ============================================

export interface AttendanceResult {
    percentage: number;
    status: 'Safe' | 'At Risk';
    classesNeeded?: number;
}

/**
 * Calculates attendance status based on a 75% requirement.
 * 
 * @param attendedClasses Number of classes attended
 * @param totalClasses Total number of classes held
 * @returns Object containing percentage, status, and classes needed to reach 75%
 */
export const calculateAttendanceStatus = (
    attendedClasses: number,
    totalClasses: number
): AttendanceResult => {
    if (totalClasses === 0) {
        return { percentage: 0, status: 'Safe' };
    }

    const percentageVal = (attendedClasses / totalClasses) * 100;
    const percentage = Number(percentageVal.toFixed(2));

    if (percentage >= 75) {
        return { percentage, status: 'Safe' };
    } else {
        // Calculate needed consecutive classes:
        // (attended + needed) / (total + needed) = 0.75
        // attended + needed = 0.75 * total + 0.75 * needed
        // 0.25 * needed = 0.75 * total - attended
        // needed = (0.75 * total - attended) / 0.25
        const needed = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);

        return {
            percentage,
            status: 'At Risk',
            classesNeeded: needed
        };
    }
};

// ============================================
// Subject Priority Engine
// ============================================
export const calculateSubjectPriority = (
    subject: Subject,
    tasks: StudyTask[]
): number => {
    let score = 50; // Base score

    // 1. Difficulty Weight (20%)
    const difficulty = subject.difficulty || 3;
    score += (difficulty - 3) * 10;

    // 2. Exam Urgency (40%)
    if (subject.examDate) {
        const daysUntilExam = Math.ceil((new Date(subject.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExam <= 1) score += 40;
        else if (daysUntilExam <= 3) score += 30;
        else if (daysUntilExam <= 7) score += 20;
        else if (daysUntilExam <= 14) score += 10;
    }

    // 3. Task Load (20%)
    const pendingTasks = tasks.filter(t => t.subjectId === subject.id && t.status === 'pending');
    score += Math.min(pendingTasks.length * 5, 20);

    // 4. Topics Remaining (conceptual - using total topics if available)
    // Ideally we need 'completed topics' data, but we'll use a placeholder logic if we track syllabus later

    return Math.min(100, Math.max(0, score));
};

// ============================================
// Exam Readiness Score
// ============================================
export const calculateExamReadiness = (
    subject: Subject,
    attendancePercentage: number,
    completedTasks: number,
    totalTasks: number
): { score: number; label: string; color: string } => {
    let score = 0;

    // Attendance weight (40%)
    if (attendancePercentage >= 75) score += 40;
    else if (attendancePercentage >= 60) score += 20;

    // Task completion weight (40%)
    if (totalTasks > 0) {
        const taskRate = completedTasks / totalTasks;
        score += taskRate * 40;
    } else {
        score += 40; // No tasks = assumed caught up? Or neutral.
    }

    // Difficulty adjustment (20%)
    // Harder subjects need more prep, so "readiness" is lower by default?
    // Or: High difficulty means we need MORE work to be ready.
    // Let's keep it simple: 
    const difficultyMod = (5 - (subject.difficulty || 3)) * 5; // Easier subjects give +points
    score += difficultyMod;

    const finalScore = Math.min(100, Math.round(score));

    if (finalScore >= 90) return { score: finalScore, label: 'Exam Ready', color: 'text-emerald-500' };
    if (finalScore >= 70) return { score: finalScore, label: 'Good', color: 'text-blue-500' };
    if (finalScore >= 40) return { score: finalScore, label: 'Moderate', color: 'text-amber-500' };
    return { score: finalScore, label: 'Not Ready', color: 'text-red-500' };
};

export const calculateDetentionRisk = (
    present: number,
    total: number,
    minPercentage: number = 75
): { status: 'safe' | 'warning' | 'detention'; classesToAttend: number; classesCanMiss: number } => {
    if (total === 0) return { status: 'safe', classesToAttend: 0, classesCanMiss: 0 };

    const currentPercentage = (present / total) * 100;

    if (currentPercentage >= minPercentage) {
        // Safe. How many can we miss?
        // (present) / (total + x) >= 0.75
        // present = 0.75 * (total + x)
        // present / 0.75 = total + x
        // x = (present / 0.75) - total
        const canMiss = Math.floor((present / (minPercentage / 100)) - total);
        return { status: 'safe', classesToAttend: 0, classesCanMiss: Math.max(0, canMiss) };
    } else {
        // Detention Risk. How many must we attend?
        // (present + x) / (total + x) >= 0.75
        // present + x = 0.75 * total + 0.75 * x
        // 0.25 * x = 0.75 * total - present
        // x = (0.75 * total - present) / (1 - 0.75)

        // General formula: x = (target% * total - present) / (1 - target%)
        const target = minPercentage / 100;
        const needed = Math.ceil((target * total - present) / (1 - target));

        return {
            status: currentPercentage < (minPercentage - 15) ? 'detention' : 'warning',
            classesToAttend: Math.max(0, needed),
            classesCanMiss: 0
        };
    }
};

// ============================================
// Focus XP Calculator
// ============================================
export const calculateFocusXP = (minutes: number): number => {
    // Base: 10 XP per minute
    // Bonus: +50 XP for completing > 25 mins
    // Bonus: +100 XP for completing > 50 mins

    let xp = minutes * 10;
    if (minutes >= 25) xp += 50;
    if (minutes >= 50) xp += 100;

    return xp;
};

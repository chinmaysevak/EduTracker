import { StudyTask, TimetableSlot } from '@/types';

// Helper to find free slots in a day
export const findFreeSlots = (
    _daySchedule: TimetableSlot[],
    _startHour: number = 8, // 8 AM
    _endHour: number = 22 // 10 PM
): { start: string; end: string; duration: number }[] => {
    // Simplistic implementation: 
    // 1. Convert everything to minutes from midnight
    // 2. Sort busy slots
    // 3. Find gaps >= 30 mins

    // For now, we'll just check specific blocks?
    // Or just return a "generic" suggestion since we don't have full calendar events yet.

    return []; // TBD: Full implementation needs a robust time library
};

export const autoScheduleTasks = (
    tasks: StudyTask[],
    _timetable: Record<string, string[]>
): StudyTask[] => {
    // Sort tasks by priority + deadline
    const sorted = [...tasks].sort((a, b) => {
        // Deadline urgency
        const dateA = new Date(a.targetDate).getTime();
        const dateB = new Date(b.targetDate).getTime();
        if (dateA !== dateB) return dateA - dateB;

        // Priority Score
        return (b.autoPriorityScore || 0) - (a.autoPriorityScore || 0);
    });

    // Assign "suggested" time slots?
    // Since our Task model doesn't have "scheduledTime" field yet, 
    // we primarily just return the sorted list for the "Daily Plan".

    return sorted;
};

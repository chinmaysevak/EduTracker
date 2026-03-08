import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSubjects } from '@/hooks/useData';
import { useAttendance } from '@/hooks/useData';
import { useTimetable } from '@/hooks/useData';
import { useResources } from '@/hooks/useData';
import { useStudyTasks } from '@/hooks/useData';
import { useSyllabus } from '@/hooks/useData';
import { useNotifications } from '@/hooks/useData';
import { useUserProfile } from '@/hooks/useData';

// Define the shape of our global store
interface StudentContextType {
    subjects: ReturnType<typeof useSubjects>;
    attendance: ReturnType<typeof useAttendance>;
    timetable: ReturnType<typeof useTimetable>;
    resources: ReturnType<typeof useResources>;
    tasks: ReturnType<typeof useStudyTasks>;
    syllabus: ReturnType<typeof useSyllabus>;
    notifications: ReturnType<typeof useNotifications>;
    profile: ReturnType<typeof useUserProfile>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const userId = user?.id;

    // Initialize all hooks with the current userId
    // If no userId (not logged in), hooks will fallback to global/default or empty
    // We explicitly pass userId to hooks that need scoping

    const subjects = useSubjects(undefined, userId);
    const attendance = useAttendance(userId);
    const timetable = useTimetable(userId);
    const resources = useResources(userId);
    const tasks = useStudyTasks(userId);
    const syllabus = useSyllabus(userId);
    const notifications = useNotifications(userId);
    const profile = useUserProfile(userId);

    // Guard to prevent infinite loops: generate smart notifications only once per session
    const hasGeneratedNotifs = useRef(false);

    // Reset the flag when user changes (login/logout)
    useEffect(() => {
        hasGeneratedNotifs.current = false;
    }, [userId]);

    // Cross-module synchronization effects
    // Automatically generate smart notifications for overdue tasks & attendance (once per session)
    useEffect(() => {
        if (!userId || hasGeneratedNotifs.current) return;
        if (tasks.isLoading || subjects.isLoading || attendance.isLoading) return;

        hasGeneratedNotifs.current = true;

        // Generate smart notifications based on current data
        const newNotifs = notifications.generateSmartNotifications(
            tasks.tasks,
            attendance.attendanceData,
            subjects.subjects
        );

        // Add them if they don't already exist today to prevent spam
        newNotifs.forEach(notif => {
            const alreadyExists = notifications.notifications.some(
                n => n.title === notif.title && n.createdAt.startsWith(new Date().toISOString().split('T')[0])
            );
            if (!alreadyExists) {
                notifications.addNotification(notif);
            }
        });
    }, [userId, tasks.isLoading, subjects.isLoading, attendance.isLoading]);

    const value = {
        subjects,
        attendance,
        timetable,
        resources,
        tasks,
        syllabus,
        notifications,
        profile
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
}

export function useStudentStore() {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudentStore must be used within a StudentProvider');
    }
    return context;
}

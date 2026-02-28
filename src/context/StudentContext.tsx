import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSubjects } from '@/hooks/useData';
import { useAttendance } from '@/hooks/useData';
import { useTimetable } from '@/hooks/useData';
import { useStudyMaterials } from '@/hooks/useData';
import { usePlaylists } from '@/hooks/useData';
import { useStudyTasks } from '@/hooks/useData';
import { useCourseProgress } from '@/hooks/useData';
import { useNotifications } from '@/hooks/useData';
import { useUserProfile } from '@/hooks/useData';

// Define the shape of our global store
interface StudentContextType {
    subjects: ReturnType<typeof useSubjects>;
    attendance: ReturnType<typeof useAttendance>;
    timetable: ReturnType<typeof useTimetable>;
    materials: ReturnType<typeof useStudyMaterials>;
    playlists: ReturnType<typeof usePlaylists>;
    tasks: ReturnType<typeof useStudyTasks>;
    progress: ReturnType<typeof useCourseProgress>;
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
    const materials = useStudyMaterials(userId);
    const playlists = usePlaylists(userId);
    const tasks = useStudyTasks(userId);
    const progress = useCourseProgress(userId);
    const notifications = useNotifications(userId);
    const profile = useUserProfile(userId);

    // Cross-module synchronization effects
    // e.g. When a task is completed, update XP
    useEffect(() => {
        // This could be where centralized logic lives
        // For now, we just expose the hooks
    }, [userId]);

    const value = {
        subjects,
        attendance,
        timetable,
        materials,
        playlists,
        tasks,
        progress,
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

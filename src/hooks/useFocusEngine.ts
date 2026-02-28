import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useUserProfile, useFocusHistory } from './useData';
import { calculateFocusXP } from '@/lib/academicMath';
import { toast } from 'sonner';

interface FocusSessionState {
    isActive: boolean;
    isPaused: boolean;
    mode: 'study' | 'break';
    startTime: number | null; // Timestamp
    pauseTime: number | null; // Timestamp
    duration: number; // Current phase duration in seconds
    elapsed: number; // Seconds
    subjectId: string;
    studyDuration: number;
    breakDuration: number;
    completedPomodoros: number;
}

const defaultFocusState: FocusSessionState = {
    isActive: false,
    isPaused: false,
    mode: 'study',
    startTime: null,
    pauseTime: null,
    duration: 25 * 60,
    elapsed: 0,
    subjectId: '',
    studyDuration: 25 * 60,
    breakDuration: 5 * 60,
    completedPomodoros: 0
};

export function useFocusEngine(userId?: string) {
    const [session, setSession] = useLocalStorage<FocusSessionState>('edu-tracker-focus-session', defaultFocusState, userId);
    const { addXP, updateStreak } = useUserProfile(userId);
    const { logSession } = useFocusHistory();

    // We use a ref for the interval to clear it easily
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Computed properties for UI
    const timeLeft = Math.max(0, session.duration - session.elapsed);
    const progress = Math.min(100, (session.elapsed / session.duration) * 100);

    // Timer Tick Logic
    useEffect(() => {
        if (session.isActive && !session.isPaused) {
            timerRef.current = setInterval(() => {
                setSession(prev => {
                    const newElapsed = prev.elapsed + 1;

                    // Check for completion
                    if (newElapsed >= prev.duration) {
                        return { ...prev, elapsed: newElapsed, isActive: false, isPaused: false };
                    }

                    return { ...prev, elapsed: newElapsed };
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [session.isActive, session.isPaused, setSession]);

    // Handle Completion Side Effects
    useEffect(() => {
        if (session.elapsed >= session.duration && session.duration > 0 && session.startTime) {
            // Session finished naturally (not cancelled)
            // Only trigger if we haven't reset it yet (startTime check is a proxy)
            finishSession();
        }
    }, [session.elapsed, session.duration]);


    const startSession = (subjectId: string, studyMins: number, breakMins: number) => {
        if (!subjectId) {
            toast.error("Please select a subject!");
            return;
        }

        setSession({
            isActive: true,
            isPaused: false,
            mode: 'study',
            startTime: Date.now(),
            pauseTime: null,
            duration: studyMins * 60,
            elapsed: 0,
            subjectId,
            studyDuration: studyMins * 60,
            breakDuration: breakMins * 60,
            completedPomodoros: session.completedPomodoros || 0
        });
    };

    const startBreak = () => {
        setSession(prev => ({
            ...prev,
            isActive: true,
            isPaused: false,
            mode: 'break',
            startTime: Date.now(),
            pauseTime: null,
            duration: prev.breakDuration,
            elapsed: 0
        }));
    };

    const pauseSession = () => {
        setSession(prev => ({
            ...prev,
            isPaused: true,
            pauseTime: Date.now()
        }));
    };

    const resumeSession = () => {
        setSession(prev => {
            // Calculate offline time? 
            // For simple pause, we just resume. 
            // Real "offline" catchup is complex, we'll stick to simple pause for now.
            return {
                ...prev,
                isPaused: false,
                pauseTime: null
            };
        });
    };

    const stopSession = () => {
        setSession(defaultFocusState);
    };

    const finishSession = () => {
        if (session.mode === 'study') {
            const mins = Math.floor(session.duration / 60);
            const xp = calculateFocusXP(mins);
            addXP(xp);
            updateStreak();

            if (session.subjectId) {
                const now = new Date();
                const startTimeDate = session.startTime ? new Date(session.startTime) : new Date(now.getTime() - mins * 60000);

                logSession({
                    subjectId: session.subjectId,
                    durationMinutes: mins,
                    date: now.toISOString(),
                    startTime: startTimeDate.toISOString(),
                    endTime: now.toISOString()
                });
            }

            toast.success(`Study Session Complete! +${xp} XP. Time for a break.`);

            // Auto start a break or just switch mode to break
            // We'll increment completedPomodoros and then switch to break
            setSession(prev => ({
                ...prev,
                completedPomodoros: prev.completedPomodoros + 1,
                isActive: false, // require manual start of break or auto-start? Let's auto-start
            }));
            startBreak();
            return { xp, minutes: mins };
        } else {
            // Finished a break
            toast.success(`Break over! Ready to focus again?`);
            // Switch back to study mode but not active
            setSession(prev => ({
                ...prev,
                mode: 'study',
                isActive: false,
                isPaused: false,
                elapsed: 0,
                duration: prev.studyDuration
            }));
            return { xp: 0, minutes: 0 };
        }
    };

    return {
        session,
        timeLeft,
        progress,
        startSession,
        startBreak,
        pauseSession,
        resumeSession,
        stopSession,
        skipBreak: () => finishSession()
    };
}

// ============================================
// Browser Push Notifications Utility
// ============================================

export class EduNotifications {
    private static timers: ReturnType<typeof setTimeout>[] = [];

    /** Request browser notification permission */
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return false;
        }
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;

        const result = await Notification.requestPermission();
        return result === 'granted';
    }

    /** Check if notifications are enabled */
    static isEnabled(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /** Send an immediate notification */
    static send(title: string, options?: NotificationOptions): void {
        if (!this.isEnabled()) return;
        try {
            const n = new Notification(title, {
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                ...options,
            });
            // Auto-close after 8 seconds
            setTimeout(() => n.close(), 8000);
        } catch (err) {
            console.error('Notification error:', err);
        }
    }

    /** Schedule a notification for a future time */
    static scheduleAt(time: Date, title: string, body: string): void {
        const delay = time.getTime() - Date.now();
        if (delay <= 0) return; // Already passed
        const timer = setTimeout(() => {
            this.send(title, { body });
        }, delay);
        this.timers.push(timer);
    }

    /** Schedule session reminders from timetable */
    static scheduleSessionReminders(
        sessions: { subject: string; startTime: string; day: string }[],
        reminderMinutes: number = 15
    ): void {
        // Clear any existing timers
        this.clearScheduled();

        const today = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = dayNames[today.getDay()];

        sessions
            .filter(s => s.day === todayName)
            .forEach(session => {
                const [hours, minutes] = session.startTime.split(':').map(Number);
                const sessionTime = new Date(today);
                sessionTime.setHours(hours, minutes, 0, 0);

                // Schedule reminder X minutes before
                const reminderTime = new Date(sessionTime.getTime() - reminderMinutes * 60 * 1000);

                if (reminderTime.getTime() > Date.now()) {
                    this.scheduleAt(
                        reminderTime,
                        `📚 ${session.subject} starts in ${reminderMinutes} min`,
                        `Get ready for your ${session.subject} class!`
                    );
                }
            });
    }

    /** Send attendance alert */
    static sendAttendanceAlert(subject: string, percentage: number): void {
        if (percentage < 65) {
            this.send(`⚠️ Low Attendance Alert`, {
                body: `${subject} attendance is at ${percentage}%. Attend the next class to improve!`,
                tag: `attendance-${subject}`,
            });
        }
    }

    /** Send morning briefing */
    static sendMorningBriefing(taskCount: number, topSubject: string): void {
        this.send(`☀️ Good Morning!`, {
            body: `You have ${taskCount} task${taskCount !== 1 ? 's' : ''} today. Focus on ${topSubject}.`,
            tag: 'morning-briefing',
        });
    }

    /** Clear all scheduled notifications */
    static clearScheduled(): void {
        this.timers.forEach(t => clearTimeout(t));
        this.timers = [];
    }
}

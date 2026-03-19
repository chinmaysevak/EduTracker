
import { useEffect, useState, useCallback } from 'react';
import { useUserProfile, useTimetable, useStudyTasks } from '@/hooks/useData';
import type { TimetableSlot } from '@/types';
import { Flame, Clock, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { ModuleType } from '@/types';

const MOTIVATIONAL_QUOTES = [
    { text: "Small steps every day lead to big results.", emoji: "🚀" },
    { text: "Your future self will thank you for studying today.", emoji: "💪" },
    { text: "Discipline is choosing between what you want now and what you want most.", emoji: "🎯" },
    { text: "The expert in anything was once a beginner.", emoji: "🌟" },
    { text: "Don't watch the clock; do what it does. Keep going.", emoji: "⏰" },
    { text: "Success is the sum of small efforts repeated day in and day out.", emoji: "📚" },
    { text: "Every accomplishment starts with the decision to try.", emoji: "✨" },
    { text: "Study hard, dream big, never give up.", emoji: "🔥" },
];

export function WelcomeSection({ onNavigate }: { onNavigate: (module: ModuleType) => void }) {
    const { profile } = useUserProfile();
    const { getWeekSchedule } = useTimetable();
    const { getPendingTasks } = useStudyTasks();

    const [greeting, setGreeting] = useState('');
    const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
    const [quoteKey, setQuoteKey] = useState(0);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Good Morning");
        else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
        else if (hour >= 17 && hour < 22) setGreeting("Good Evening");
        else setGreeting("Good Night");
    }, []);

    // Rotate quotes
    useEffect(() => {
        const randomStart = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        setQuote(MOTIVATIONAL_QUOTES[randomStart]);
        const interval = setInterval(() => {
            setQuote(prev => {
                const idx = MOTIVATIONAL_QUOTES.indexOf(prev);
                const next = (idx + 1) % MOTIVATIONAL_QUOTES.length;
                return MOTIVATIONAL_QUOTES[next];
            });
            setQuoteKey(k => k + 1);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const now = new Date();
    const todayIndex = now.getDay();

    const findNextClass = useCallback(() => {
        const week = getWeekSchedule();
        let best: { subject: string; start: Date; end: Date } | null = null;
        week.forEach(({ dayIndex, classes }: { dayIndex: number; classes: TimetableSlot[] }) => {
            classes.forEach((slot: TimetableSlot) => {
                const dayOffset = (dayIndex - todayIndex + 7) % 7;
                const candidateDate = new Date(now);
                candidateDate.setDate(now.getDate() + dayOffset);
                const [sh, sm] = slot.startTime.split(':').map(Number);
                const [eh, em] = slot.endTime.split(':').map(Number);
                const start = new Date(candidateDate.getFullYear(), candidateDate.getMonth(), candidateDate.getDate(), sh || 0, sm || 0);
                const end = new Date(candidateDate.getFullYear(), candidateDate.getMonth(), candidateDate.getDate(), eh || 0, em || 0);
                if (start <= now) return;
                if (!best || start < best.start) best = { subject: slot.subject, start, end };
            });
        });
        return best;
    }, [getWeekSchedule, todayIndex]);

    const nextClass = findNextClass();
    const pendingTasksCount = getPendingTasks().length;

    return (
        <div className="mb-6">
            {/* ── Premium Animated Hero ── */}
            <div className="section-hero mesh-gradient mb-5">
                {/* Floating decorative orbs */}
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-primary" />
                            {format(new Date(), 'EEEE, MMMM do')}
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display gradient-text-vibrant">
                            {greeting}, {profile.name.split(' ')[0]}! 👋
                        </h1>

                        {/* Rotating motivational quote */}
                        <p key={quoteKey} className="text-sm text-muted-foreground mt-2 quote-fade-in flex items-center gap-1.5">
                            <span>{quote.emoji}</span>
                            <span className="italic">{quote.text}</span>
                        </p>
                    </div>

                    {profile.currentStreak > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold w-fit streak-pulse shadow-lg shadow-amber-500/10">
                            <Flame className="w-4 h-4" />
                            <span className="mono-data">{profile.currentStreak} day streak</span>
                            <span className="text-amber-400">🔥</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Status Chips Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Next Class Chip */}
                <button
                    onClick={() => onNavigate('attendance')}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group cursor-pointer text-left card-shine gradient-border-animated hover:shadow-lg hover:shadow-blue-500/5"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Next Class</p>
                        <p className="font-semibold text-sm truncate">{nextClass ? nextClass.subject : 'None scheduled'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>

                {/* Pending Tasks Chip */}
                <button
                    onClick={() => onNavigate('planner')}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group cursor-pointer text-left card-shine gradient-border-animated hover:shadow-lg hover:shadow-amber-500/5"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-base font-bold mono-data">{pendingTasksCount}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Pending Tasks</p>
                        <p className="font-semibold text-sm">{pendingTasksCount > 0 ? 'Keep pushing!' : 'All done! 🎉'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>

                {/* Focus Mode CTA */}
                <button
                    onClick={() => onNavigate('focus')}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:from-emerald-500/15 hover:via-teal-500/15 hover:to-cyan-500/15 transition-all group cursor-pointer text-left hover:shadow-lg hover:shadow-emerald-500/10"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Zap className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 font-medium uppercase tracking-wide">Ready?</p>
                        <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300">Start Focus</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
            </div>
        </div>
    );
}

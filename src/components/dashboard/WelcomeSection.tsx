
import { useEffect, useState } from 'react';
import { useUserProfile, useTimetable, useStudyTasks } from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { ModuleType } from '@/types';

export function WelcomeSection({ onNavigate }: { onNavigate: (module: ModuleType) => void }) {
    const { profile } = useUserProfile();
    const { getTodayClasses } = useTimetable();
    const { getPendingTasks } = useStudyTasks();

    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Next Class Logic
    const todayClasses = getTodayClasses();
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const nextClass = todayClasses
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .find(c => c.startTime > currentTimeStr);

    // Stats
    const pendingTasksCount = getPendingTasks().length;



    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting}, {profile.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        You're on a <span className="font-semibold text-primary">{profile.currentStreak} day streak</span>. Keep it up!
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Next Class Card */}
                <Card className="card-professional bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Next Class</p>
                            <p className="font-bold truncate">
                                {nextClass ? nextClass.subject : 'No more classes'}
                            </p>
                            {nextClass && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    {nextClass.startTime} - {nextClass.endTime}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>



                {/* Pending Tasks Card */}
                <Card className="card-professional bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">One Task at a Time</p>
                            <p className="font-bold">{pendingTasksCount} Pending</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                {pendingTasksCount > 0 ? 'Keep pushing!' : 'All caught up!'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Focus Mode Card (Action) */}
                <Card
                    className="card-professional bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-md hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => onNavigate('focus')}
                >
                    <CardContent className="p-4 flex items-center justify-between h-full">
                        <div>
                            <p className="text-xs text-emerald-100 font-medium uppercase tracking-wide">Ready?</p>
                            <p className="font-bold text-lg">Start Focus</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

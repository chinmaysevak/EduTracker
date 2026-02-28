import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFocusHistory, useStudyTasks } from '@/hooks/useData';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, subWeeks } from 'date-fns';
import { BarChart3, CheckCircle2, Clock } from 'lucide-react';

export function WeeklyPerformanceWidget() {
    const { history } = useFocusHistory();
    const { tasks } = useStudyTasks();

    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start, end });

    const weeklyStats = useMemo(() => {
        return daysOfWeek.map(day => {
            const dayLogs = history.filter(log => isSameDay(new Date(log.date), day));
            const totalMinutes = dayLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
            return {
                day: format(day, 'EEE'),
                fullDate: day,
                minutes: totalMinutes,
                hours: Math.round((totalMinutes / 60) * 10) / 10
            };
        });
    }, [history, daysOfWeek]);

    const maxMinutes = Math.max(...weeklyStats.map(d => d.minutes), 60); // Min 1 hour scale

    const totalWeeklyMinutes = weeklyStats.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalWeeklyHours = Math.round((totalWeeklyMinutes / 60) * 10) / 10;

    // Calculate Tasks Completed this week
    const tasksCompletedThisWeek = tasks.filter(task =>
        task.status === 'completed' &&
        task.completedAt &&
        new Date(task.completedAt) >= start &&
        new Date(task.completedAt) <= end
    ).length;

    return (
        <Card className="card-modern border-0">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold">Weekly Performance</CardTitle>
                            <p className="text-xs text-muted-foreground">Study hours & tasks</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold">{totalWeeklyHours}h</span>
                        <p className="text-xs text-muted-foreground">Total Study</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Chart */}
                <div className="h-32 flex items-end justify-between gap-2 mt-4">
                    {weeklyStats.map(stat => (
                        <div key={stat.day} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="relative w-full flex justify-center">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                                    {stat.hours} hrs
                                </div>
                                {/* Bar */}
                                <div
                                    className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${isSameDay(stat.fullDate, today)
                                        ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                        : 'bg-muted hover:bg-blue-400/50'
                                        }`}
                                    style={{ height: `${(stat.minutes / maxMinutes) * 100}%`, minHeight: '4px' }}
                                />
                            </div>
                            <span className={`text-[10px] font-medium ${isSameDay(stat.fullDate, today) ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                {stat.day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{tasksCompletedThisWeek}</p>
                            <p className="text-xs text-muted-foreground">Tasks Done</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">{Math.round(totalWeeklyHours / 7 * 10) / 10}h</p>
                            <p className="text-xs text-muted-foreground">Daily Avg</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

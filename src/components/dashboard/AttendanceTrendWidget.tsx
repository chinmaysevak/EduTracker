import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendance } from '@/hooks/useData';
import { subWeeks, format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function AttendanceTrendWidget() {
    const { attendanceData } = useAttendance();
    const today = new Date();

    const weeklyTrends = useMemo(() => {
        return [3, 2, 1, 0].map(weeksAgo => {
            const date = subWeeks(today, weeksAgo);
            const start = startOfWeek(date, { weekStartsOn: 1 });
            const end = endOfWeek(date, { weekStartsOn: 1 });

            const weekData = attendanceData.filter(d => {
                const dDate = new Date(d.date);
                return isWithinInterval(dDate, { start, end });
            });

            let present = 0;
            let total = 0;

            weekData.forEach(day => {
                Object.values(day.subjects).forEach(status => {
                    if (status !== 'cancelled') {
                        total++;
                        if (status === 'present') present++;
                    }
                });
            });

            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            return {
                label: weeksAgo === 0 ? 'This Week' : format(start, 'MMM d'),
                percentage,
                present,
                total
            };
        });
    }, [attendanceData, today]);

    const currentWeek = weeklyTrends[3];
    const previousWeek = weeklyTrends[2];
    const trendDiff = currentWeek.percentage - previousWeek.percentage;
    const maxPct = Math.max(...weeklyTrends.map(w => w.percentage), 1);

    return (
        <Card className="card-modern border-0">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Attendance Trend</CardTitle>
                            <p className="text-xs text-muted-foreground">Last 4 weeks</p>
                        </div>
                    </div>
                    {/* Trend Indicator */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${trendDiff > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            trendDiff < 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                'bg-muted text-muted-foreground'
                        }`}>
                        {trendDiff > 0 ? <ArrowUp className="w-3 h-3" /> : trendDiff < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {Math.abs(trendDiff)}%
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 mt-1">
                    {weeklyTrends.map((week, i) => (
                        <div key={i} className="group">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${i === 3 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                    {week.label}
                                </span>
                                <span className="text-xs font-bold tabular-nums">
                                    {week.percentage}%
                                    <span className="text-muted-foreground font-normal ml-1">
                                        ({week.present}/{week.total})
                                    </span>
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${week.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                            week.percentage >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                                'bg-gradient-to-r from-rose-500 to-rose-400'
                                        }`}
                                    style={{ width: `${Math.max(week.percentage, 2)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFocusHistory } from '@/hooks/useData';
import { subDays, isSameDay, format } from 'date-fns';
import { Activity } from 'lucide-react';

export function StudyHeatmapWidget() {
    const { history } = useFocusHistory();
    const today = new Date();

    // Generate last 84 days (12 weeks x 7 days)
    const days = useMemo(() => {
        return Array.from({ length: 84 }).map((_, i) => {
            const date = subDays(today, 83 - i);
            const dayLogs = history.filter(log => isSameDay(new Date(log.date), date));
            const totalMinutes = dayLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
            return {
                date,
                minutes: totalMinutes,
                level: totalMinutes === 0 ? 0 : totalMinutes < 30 ? 1 : totalMinutes < 60 ? 2 : totalMinutes < 120 ? 3 : 4
            };
        });
    }, [history, today]);

    const totalMinutes = days.reduce((acc, d) => acc + d.minutes, 0);
    const activeDays = days.filter(d => d.minutes > 0).length;

    const getLevelStyle = (level: number): React.CSSProperties => {
        switch (level) {
            case 0: return { backgroundColor: 'var(--heatmap-empty)' };
            case 1: return { backgroundColor: 'var(--heatmap-1)' };
            case 2: return { backgroundColor: 'var(--heatmap-2)' };
            case 3: return { backgroundColor: 'var(--heatmap-3)' };
            case 4: return { backgroundColor: 'var(--heatmap-4)' };
            default: return { backgroundColor: 'var(--heatmap-empty)' };
        }
    };

    const getLevelClass = (level: number): string => {
        if (level >= 3) return 'shadow-sm shadow-violet-500/30';
        return '';
    };

    return (
        <Card className="card-modern border-0">
            <style>{`
                :root {
                    --heatmap-empty: rgba(0,0,0,0.06);
                    --heatmap-1: #c4b5fd;
                    --heatmap-2: #a78bfa;
                    --heatmap-3: #8b5cf6;
                    --heatmap-4: #7c3aed;
                }
                .dark {
                    --heatmap-empty: rgba(255,255,255,0.08);
                    --heatmap-1: rgba(139,92,246,0.3);
                    --heatmap-2: rgba(139,92,246,0.5);
                    --heatmap-3: rgba(139,92,246,0.75);
                    --heatmap-4: rgba(139,92,246,1);
                }
            `}</style>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold">Study Heatmap</CardTitle>
                            <p className="text-xs text-muted-foreground">Last 12 weeks</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black tabular-nums">{Math.round(totalMinutes / 60)}h</p>
                        <p className="text-[10px] text-muted-foreground">{activeDays} active days</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                {/* Compact grid: 12 cols × 7 rows, fixed small cell size */}
                <div
                    className="mt-3 mx-auto overflow-hidden"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 14px)',
                        gridTemplateRows: 'repeat(7, 14px)',
                        gap: '3px',
                        justifyContent: 'center',
                    }}
                >
                    {days.map((day, i) => (
                        <div
                            key={i}
                            className={`rounded-[3px] cursor-default transition-transform hover:scale-[1.3] hover:z-10 ${getLevelClass(day.level)}`}
                            style={{
                                width: 14,
                                height: 14,
                                ...getLevelStyle(day.level),
                            }}
                            title={`${format(day.date, 'EEE, MMM d')}: ${day.minutes > 0 ? `${day.minutes} min` : 'No activity'}`}
                        />
                    ))}
                </div>
                {/* Legend */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <span>{format(days[0].date, 'MMM d')}</span>
                        <span>→</span>
                        <span>{format(days[days.length - 1].date, 'MMM d')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <span>Less</span>
                        <div className="flex gap-[2px]">
                            {[0, 1, 2, 3, 4].map(l => (
                                <div
                                    key={l}
                                    className={`rounded-[2px] ${getLevelClass(l)}`}
                                    style={{ width: 10, height: 10, ...getLevelStyle(l) }}
                                />
                            ))}
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Zap, Target } from 'lucide-react';
import api from '@/lib/api';

interface FocusStats {
    totalFocusTime: number; // seconds
    completedCycles: number;
    lastSession: any;
}

export function FocusLauncherWidget({ onNavigate }: { onNavigate: () => void }) {
    const [stats, setStats] = useState<FocusStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response: any = await api.get('/focus-sessions/stats/today');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch focus stats:', err);
            }
        };
        fetchStats();
    }, []);

    const formatMins = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${m}m`;
        }
        return `${mins}m`;
    };

    return (
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 overflow-hidden relative shadow-lg group hover:shadow-xl transition-all duration-300">
            {/* Decorative background sparks */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 blur-xl" />
            
            <CardContent className="p-6 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Ready to Focus?</p>
                            <h3 className="text-2xl font-black">Deep Work Session</h3>
                        </div>
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className="w-12 h-12 rounded-full shadow-lg group-hover:scale-110 transition-transform"
                            onClick={onNavigate}
                        >
                            <Play className="w-5 h-5 fill-current" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-primary-foreground/60" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">Today</span>
                            </div>
                            <p className="text-xl font-black tabular-nums">{stats ? formatMins(stats.totalFocusTime) : '0m'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-3.5 h-3.5 text-primary-foreground/60" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">Cycles</span>
                            </div>
                            <p className="text-xl font-black tabular-nums">{stats?.completedCycles || 0}</p>
                        </div>
                    </div>

                    {stats?.lastSession && (
                        <div className="flex items-center gap-2 pt-1">
                            <Zap className="w-3 h-3 text-secondary" />
                            <p className="text-[10px] font-bold text-primary-foreground/80 lowercase">
                                last session: {formatMins(stats.lastSession.totalFocusTime)}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

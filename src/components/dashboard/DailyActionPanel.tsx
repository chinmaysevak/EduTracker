import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Clock, BookOpen } from 'lucide-react';
import { useSubjects, useStudyTasks, useAttendance, useTopics } from '@/hooks/useData';
import { generateDailyActionPlan, type Recommendation } from '@/lib/intelligence';
import type { ModuleType } from '@/types';

interface DailyActionPanelProps {
    onNavigate: (module: ModuleType) => void;
}

export function DailyActionPanel({ onNavigate }: DailyActionPanelProps) {
    const { subjects } = useSubjects();
    const { tasks } = useStudyTasks();
    const { attendanceData, calculateSubjectAttendance } = useAttendance();
    const { topics } = useTopics();

    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

    useEffect(() => {
        // Process attendance stats for the engine
        const attendanceStats = subjects.reduce((acc, subject) => {
            acc[subject.id] = calculateSubjectAttendance(subject.id);
            return acc;
        }, {} as Record<string, { percentage: number; present: number; total: number }>);

        const plan = generateDailyActionPlan(subjects, tasks, attendanceStats, topics);
        setRecommendations(plan);
    }, [subjects, tasks, attendanceData, topics]);

    if (recommendations.length === 0) return null;

    const topRec = recommendations[0];
    const otherRecs = recommendations.slice(1, 3);

    const getIcon = (type: Recommendation['type']) => {
        switch (type) {
            case 'urgent': return AlertCircle;
            case 'exam': return Clock;
            case 'attendance': return AlertCircle;
            case 'backlog': return BookOpen;
            default: return Sparkles;
        }
    };

    const TopIcon = getIcon(topRec.type);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                    Recommended for You
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hero Recommendation */}
                <Card className={`border-0 shadow-lg relative overflow-hidden text-white ${topRec.color || 'bg-primary'}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-20 blur-3xl opacity-50" />
                    <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm mb-3">
                                <TopIcon className="w-3 h-3" />
                                {topRec.type.toUpperCase()}
                            </div>
                            <h3 className="text-xl font-bold mb-2 leading-tight">{topRec.title}</h3>
                            <p className="text-white/90 text-sm mb-6 leading-relaxed">
                                {topRec.description}
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto self-start gap-2 shadow-sm font-semibold"
                            onClick={() => topRec.actionLink && onNavigate(topRec.actionLink as ModuleType)}
                        >
                            {topRec.actionLabel || 'Take Action'}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Secondary Recommendations */}
                <div className="space-y-4">
                    {otherRecs.map((rec) => {
                        const Icon = getIcon(rec.type);
                        return (
                            <Card key={rec.id} className="hover-lift card-modern border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className={`mt-1 p-2 rounded-lg ${rec.color?.replace('bg-', 'text-') || 'text-primary'} bg-muted`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm mb-1 truncate">{rec.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{rec.description}</p>
                                        <button
                                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                            onClick={() => rec.actionLink && onNavigate(rec.actionLink as ModuleType)}
                                        >
                                            {rec.actionLabel || 'View Details'} <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {otherRecs.length === 0 && (
                        <Card className="h-full flex items-center justify-center p-6 text-center text-muted-foreground border-dashed">
                            <div>
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

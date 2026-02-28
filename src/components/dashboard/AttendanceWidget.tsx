import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import { useAttendance, useSubjects } from "@/hooks/useData";

import type { ModuleType } from "@/types";

export function AttendanceWidget({ onNavigate }: { onNavigate: (module: ModuleType) => void }) {
    const { calculateSubjectAttendance, getOverallAttendance } = useAttendance();
    const { subjects } = useSubjects();
    const overall = getOverallAttendance();

    // predictive logic is embedded in the widget for the "Overall" view or we could use the hook
    // Let's implement a simple "Overall Status" here

    const getStatusColor = (percentage: number) => {
        if (percentage >= 75) return "text-emerald-500";
        if (percentage >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 75) return "bg-emerald-500";
        if (percentage >= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    // Find the subject most at risk (lowest attendance > 0)
    const riskSubject = subjects
        .map(s => {
            const stats = calculateSubjectAttendance(s.id);
            return { ...s, stats };
        })
        .filter(s => s.stats.total > 0 && s.stats.percentage < 75)
        .sort((a, b) => a.stats.percentage - b.stats.percentage)[0];

    return (
        <Card className="card-professional hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Health</CardTitle>
                <div className={`text-2xl font-bold ${getStatusColor(overall.percentage)}`}>
                    {overall.percentage}%
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-2 space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Overall Progress</span>
                            <span>{overall.present}/{overall.total} Classes</span>
                        </div>
                        <Progress
                            value={overall.percentage}
                            className="h-2"
                            indicatorClassName={getProgressColor(overall.percentage)}
                        />
                    </div>

                    {riskSubject ? (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-3 border border-red-100 dark:border-red-900/20">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                        Risk Alert: {riskSubject.name}
                                    </p>
                                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                                        Attendance is at {riskSubject.stats.percentage}%. You need to attend more classes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : overall.total > 0 ? (
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 p-3 border border-emerald-100 dark:border-emerald-900/20">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                        Safe Zone
                                    </p>
                                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                                        You are maintaining good attendance across all subjects.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">No attendance data yet.</p>
                    )}

                    <Button
                        variant="ghost"
                        className="w-full h-8 text-xs justify-between group p-0 hover:bg-transparent hover:text-primary"
                        onClick={() => onNavigate('attendance')}
                    >
                        View Full Report <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

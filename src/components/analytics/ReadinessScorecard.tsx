import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAcademicInsights, useSubjects } from "@/hooks/useData";
import { Brain, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export function ReadinessScorecard() {
    const { subjects } = useSubjects();
    const { getSubjectInsights } = useAcademicInsights();

    const subjectsWithScores = subjects.map(subject => {
        const insights = getSubjectInsights(subject.id);
        return {
            ...subject,
            readinessScore: insights?.readiness?.score || 0,
            readinessLabel: insights?.readiness?.label || 'Unknown',
            readinessColor: insights?.readiness?.color || 'text-muted-foreground',
            priority: insights?.priorityScore || 0
        };
    }).sort((a, b) => a.readinessScore - b.readinessScore); // Sort by lowest readiness first

    return (
        <Card className="card-modern border-0 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-500" />
                    Exam Readiness & Priority
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Calculated based on attendance, topics covered, and assignments.
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {subjectsWithScores.map(subject => (
                    <div key={subject.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{subject.name}</span>
                                {subject.priority > 70 && (
                                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">High Priority</Badge>
                                )}
                            </div>
                            <span className={`text-sm font-bold ${subject.readinessScore >= 80 ? 'text-emerald-600' :
                                    subject.readinessScore >= 50 ? 'text-amber-500' :
                                        'text-rose-500'
                                }`}>
                                {subject.readinessScore}% ({subject.readinessLabel})
                            </span>
                        </div>

                        <Progress
                            value={subject.readinessScore}
                            className="h-2"
                            indicatorClassName={
                                subject.readinessScore >= 80 ? 'bg-emerald-500' :
                                    subject.readinessScore >= 50 ? 'bg-amber-500' :
                                        'bg-rose-500'
                            }
                        />

                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Priority Score: {Math.round(subject.priority)}</span>
                            <span>{subject.examDate ? `Exam: ${new Date(subject.examDate).toLocaleDateString()}` : 'No Exam Date'}</span>
                        </div>
                    </div>
                ))}

                {subjectsWithScores.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No subjects found.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

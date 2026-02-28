import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Brain,
    Flame,
    Clock,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { useAcademicInsights, useUserProfile, useSubjects } from "@/hooks/useData";

import type { ModuleType } from '@/types';

interface WidgetProps {
    onNavigate: (module: ModuleType) => void;
}

export function SmartRecommendationWidget({ onNavigate }: WidgetProps) {
    const { getTopPrioritySubjects } = useAcademicInsights();
    const topSubjects = getTopPrioritySubjects();
    const topSubject = topSubjects.length > 0 ? topSubjects[0] : null;

    if (!topSubject) return null;

    return (
        <Card className="card-professional border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-900/10">
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                            Smart Recommendation
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">Study {topSubject.subject.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        High priority due to {topSubject.subject.examDate ? 'upcoming exam' : 'low attendance/progress'}.
                    </p>
                    <Button
                        size="sm"
                        className="btn-gradient rounded-lg text-xs h-8"
                        onClick={() => onNavigate('materials')}
                    >
                        Start Session <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                </div>
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
            </CardContent>
        </Card>
    );
}

export function StreakWidget() {
    const { profile } = useUserProfile();

    // Calculate Progress to next level
    const xpForNextLevel = profile.level * 1000;
    const progress = (profile.xp / xpForNextLevel) * 100;

    return (
        <Card className="card-professional bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                                <Flame className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                                    {profile.level}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{profile.currentStreak} Day Streak</p>
                            <p className="text-xs text-muted-foreground">Keep it up, {profile.name}!</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Level {profile.level}</span>
                        <span>{profile.xp} / {xpForNextLevel} XP</span>
                    </div>
                    <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-orange-400 to-amber-500" />
                </div>
            </CardContent>
        </Card>
    );
}

export function ExamCountdownWidget({ onNavigate }: WidgetProps) {
    const { subjects } = useSubjects();

    // Find nearest exam
    const upcomingExams = subjects
        .filter(s => s.examDate)
        .map(s => {
            const examDate = new Date(s.examDate!);
            const today = new Date();
            const diffTime = examDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...s, daysLeft: diffDays };
        })
        .filter(s => s.daysLeft >= 0)
        .sort((a, b) => a.daysLeft - b.daysLeft);

    const nearestExam = upcomingExams[0];

    if (!nearestExam) return (
        <Card className="card-professional flex flex-col justify-center items-center text-center p-5 text-muted-foreground">
            <Clock className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No upcoming exams set.</p>
            <Button variant="link" className="text-xs h-auto p-0 mt-1" onClick={() => onNavigate('settings')}>
                Add Exam Dates
            </Button>
        </Card>
    );

    return (
        <Card className="card-professional">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Exam Countdown
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-2">
                    <div className="text-3xl font-bold text-foreground">
                        {nearestExam.daysLeft} <span className="text-base font-normal text-muted-foreground">days</span>
                    </div>
                    <p className="text-sm font-medium mt-1 text-blue-600 dark:text-blue-400">
                        {nearestExam.name}
                    </p>
                    <div className="mt-3 flex justify-center">
                        <Badge variant="secondary" className="text-xs font-normal">
                            {new Date(nearestExam.examDate!).toLocaleDateString()}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

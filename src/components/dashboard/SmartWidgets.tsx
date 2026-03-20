import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Button } from "@/components/ui/button";
import {
    Brain,
    Flame,
    Clock,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { useAcademicInsights, useUserProfile, useExams } from "@/hooks/useData";


interface WidgetProps {
    onNavigate: (path: string) => void;
}

export function SmartRecommendationWidget({ onNavigate }: WidgetProps) {
    const { getTopPrioritySubjects } = useAcademicInsights();
    const topSubjects = getTopPrioritySubjects();
    const topSubject = topSubjects.length > 0 ? topSubjects[0] : null;

    if (!topSubject) return null;

    return (
        <Card className="card-professional dark:status-glow-violet">
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                            Smart Recommendation
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 font-display">Study {topSubject.subject.name}</h3>
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
                <div className="w-12 h-12 rounded-full bg-violet-500/10 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
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
        <Card className="card-professional dark:status-glow-amber">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                                <Flame className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white mono-data">
                                    {profile.level}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-lg font-display"><span className="mono-data">{profile.currentStreak}</span> Day Streak</p>
                            <p className="text-xs text-muted-foreground">Keep it up, {profile.name}!</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Level <span className="mono-data">{profile.level}</span></span>
                        <span className="mono-data">{profile.xp} / {xpForNextLevel} XP</span>
                    </div>
                    <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-to-r from-orange-400 to-amber-500" />
                </div>
            </CardContent>
        </Card>
    );
}

export function ExamCountdownWidget({ onNavigate }: WidgetProps) {
    const { getUpcomingExams } = useExams();
    const upcomingExams = getUpcomingExams();
    
    let nearestExamWithDays = null;
    
    if (upcomingExams.length > 0) {
        const exam = upcomingExams[0];
        const examDate = new Date(exam.examDate);
        const today = new Date();
        // Reset time part for accurate day calculation
        today.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        nearestExamWithDays = {
            ...exam,
            daysLeft: diffDays >= 0 ? diffDays : 0,
            name: exam.title
        };
    }

    if (!nearestExamWithDays) return (
        <Card className="card-professional h-full flex flex-col justify-center items-center text-center p-4 text-muted-foreground">
            <Clock className="w-5 h-5 mb-1 opacity-20" />
            <p className="text-xs">No upcoming exams</p>
            <Button variant="link" className="text-xs h-auto p-0 mt-0.5" onClick={() => onNavigate('planner?tab=exams')}>
                Add Dates
            </Button>
        </Card>
    );

    return (
        <Card className="card-professional h-full dark:status-glow-blue cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('planner?tab=exams')}>
            <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Exam Countdown</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="text-2xl font-bold text-foreground mono-data">
                        {nearestExamWithDays.daysLeft} <span className="text-sm font-normal text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{nearestExamWithDays.name}</p>
                </div>
            </CardContent>
        </Card>
    );
}

import { BookOpen, Target, CheckCircle, GraduationCap } from 'lucide-react';
import { useStudentStore } from '@/context/StudentContext';
import SmallProgressChart from './SmallProgressChart';

export default function ProgressSummary() {
    const { subjects, syllabus } = useStudentStore();

    const subjectIds = subjects.subjects.map(s => s.id);
    const overall = syllabus.getOverallProgress(subjectIds);

    const totalTopics = syllabus.topics.length;
    const completedTopics = syllabus.topics.filter(t => t.studentCompleted).length;
    const remainingTopics = totalTopics - completedTopics;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Teacher Progress */}
            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                        Teacher Progress
                    </h3>
                    <span className="text-2xl font-bold">{overall.teacher}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${overall.teacher}%` }}
                    />
                </div>
            </div>

            {/* Student Progress */}
            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        Your Completion
                    </h3>
                    <span className="text-2xl font-bold">{overall.student}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${overall.student}%` }}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total Subjects</p>
                        <p className="text-2xl font-bold">{subjects.subjects.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Remaining Topics</p>
                        <p className="text-2xl font-bold">{remainingTopics}</p>
                    </div>
                </div>
            </div>

            {/* Compact Chart Widget */}
            <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm lg:col-span-1 md:col-span-2">
                <h3 className="text-xs font-medium text-muted-foreground mb-1 text-center">Teacher vs You</h3>
                <SmallProgressChart />
            </div>
        </div>
    );
}

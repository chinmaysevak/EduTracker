import { BookOpen, CheckCircle, TrendingUp, Target } from 'lucide-react';
import { useStudentStore } from '@/context/StudentContext';

/** SVG Ring chart with glow halo */
function RingChart({ value, color, size = 80, label }: { value: number; color: string; size?: number; label: string }) {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative ring-glow" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-muted/20" />
                    <circle
                        cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke={color} strokeWidth={6}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold mono-data">{value}%</span>
                </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
    );
}

export default function ProgressSummary() {
    const { subjects, syllabus } = useStudentStore();

    const subjectIds = subjects.subjects.map(s => s.id);
    const overall = syllabus.getOverallProgress(subjectIds);

    const totalTopics = syllabus.topics.length;
    const completedTopics = syllabus.topics.filter(t => t.studentCompleted).length;
    const remainingTopics = totalTopics - completedTopics;
    const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <div className="mb-6">
            <div className="section-hero mesh-gradient">
                <div className="orb orb-2" />
                <div className="orb orb-3" />

                <div className="relative z-10">
                    {/* Ring Charts Row */}
                    <div className="flex items-center justify-center gap-8 sm:gap-14 mb-6">
                        <RingChart value={overall.teacher} color="#667eea" size={95} label="Teacher Progress" />
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">VS</span>
                        </div>
                        <RingChart value={overall.student} color="#10b981" size={95} label="Your Completion" />
                    </div>

                    {/* Compact Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 dark:bg-white/[0.04] border border-border/30 card-shine">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-indigo-500/15 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium">Subjects</p>
                                <p className="text-lg font-bold mono-data leading-tight">{subjects.subjects.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 dark:bg-white/[0.04] border border-border/30 card-shine">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium">Completed</p>
                                <p className="text-lg font-bold mono-data leading-tight text-emerald-600 dark:text-emerald-400">{completedTopics}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 dark:bg-white/[0.04] border border-border/30 card-shine">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center flex-shrink-0">
                                <Target className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground font-medium">Remaining</p>
                                <p className="text-lg font-bold mono-data leading-tight">{remainingTopics}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

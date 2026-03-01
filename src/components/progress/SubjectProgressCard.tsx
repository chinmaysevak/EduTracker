import { useState } from 'react';
import { ChevronDown, ChevronRight, GraduationCap, Target, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import type { Subject } from '@/types';
import SubjectDetails from './SubjectDetails';

interface SubjectProgressCardProps {
    subject: Subject;
}

export default function SubjectProgressCard({ subject }: SubjectProgressCardProps) {
    const { subjects, syllabus } = useStudentStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const progress = syllabus.getSubjectProgress(subject.id);
    const isWeak = progress.student < 30 && progress.totalTopics > 0;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${subject.name}? This will remove all associated units and topics.`)) {
            subjects.removeSubject(subject.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newName = prompt('Enter new subject name:', subject.name);
        if (newName && newName.trim()) {
            subjects.updateSubject(subject.id, { name: newName.trim() });
        }
    };

    return (
        <div className={`bg-card border ${isWeak ? 'border-red-500/30' : 'border-border/50'} rounded-xl shadow-sm overflow-hidden transition-all duration-200`}>
            {/* Header / Summary */}
            <div
                className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subject.color || '#cbd5e1' }}
                        />
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                {subject.name}
                                {isWeak && <span className="text-[10px] uppercase font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">Needs Attention</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {progress.completedTopics} / {progress.totalTopics} topics completed
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500" onClick={handleEdit}>
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground ml-2">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="w-24 flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Teacher
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress.teacher}%` }} />
                        </div>
                        <div className="w-10 text-right text-xs font-bold">{progress.teacher}%</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-24 flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
                            <Target className="w-3.5 h-3.5 text-emerald-500" /> You
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress.student}%` }} />
                        </div>
                        <div className="w-10 text-right text-xs font-bold">{progress.student}%</div>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-border/50 bg-background/50 p-5 animate-in slide-in-from-top-2 duration-200">
                    <SubjectDetails subjectId={subject.id} />
                </div>
            )}
        </div>
    );
}

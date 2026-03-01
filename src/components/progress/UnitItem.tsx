import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, GraduationCap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import type { SyllabusUnit } from '@/types';
import TopicItem from './TopicItem';

interface UnitItemProps {
    unit: SyllabusUnit;
    onAddTopic: () => void;
}

export default function UnitItem({ unit, onAddTopic }: UnitItemProps) {
    const { syllabus } = useStudentStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const topics = syllabus.topics.filter(t => t.unitId === unit.id).sort((a, b) => a.order - b.order);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete unit "${unit.name}" and all its topics?`)) {
            syllabus.deleteUnit(unit.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newName = prompt('Enter new unit name:', unit.name);
        if (newName && newName.trim()) {
            syllabus.updateUnit(unit.id, { name: newName.trim() });
        }
    };

    return (
        <div className="border border-border/40 rounded-lg bg-card/50 overflow-hidden">
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-semibold text-sm">{unit.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({topics.length} topics)</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Completion Toggles */}
                    <div className="flex items-center gap-3 mr-2" onClick={e => e.stopPropagation()}>
                        <label className="flex items-center gap-1.5 cursor-pointer group/toggle" title="Mark unit complete for Teacher">
                            <input
                                type="checkbox"
                                checked={unit.teacherCompleted}
                                onChange={() => syllabus.toggleUnitTeacherCompletion(unit.id)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                            />
                            <GraduationCap className={`w-3.5 h-3.5 ${unit.teacherCompleted ? 'text-blue-500' : 'text-muted-foreground group-hover/toggle:text-blue-400'}`} />
                        </label>
                        <div className="w-px h-4 bg-border/50"></div>
                        <label className="flex items-center gap-1.5 cursor-pointer group/toggle" title="Mark unit complete for Student">
                            <input
                                type="checkbox"
                                checked={unit.studentCompleted}
                                onChange={() => syllabus.toggleUnitStudentCompletion(unit.id)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            />
                            <Target className={`w-3.5 h-3.5 ${unit.studentCompleted ? 'text-emerald-500' : 'text-muted-foreground group-hover/toggle:text-emerald-400'}`} />
                        </label>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-blue-500" onClick={handleEdit}>
                            <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={handleDelete}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="bg-muted/10 p-3 pt-0 border-t border-border/30">
                    <div className="pl-6 space-y-2 mt-3 mb-2">
                        {topics.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic mb-2">No topics in this unit.</p>
                        ) : (
                            topics.map(topic => (
                                <TopicItem key={topic.id} topic={topic} />
                            ))
                        )}
                        <Button variant="link" size="sm" onClick={onAddTopic} className="h-6 px-0 text-xs text-muted-foreground hover:text-primary">
                            + Add Topic here
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

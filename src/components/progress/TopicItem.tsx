import { Edit2, Trash2, GraduationCap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import type { SyllabusTopic } from '@/types';

interface TopicItemProps {
    topic: SyllabusTopic;
}

export default function TopicItem({ topic }: TopicItemProps) {
    const { syllabus } = useStudentStore();

    const handleDelete = () => {
        if (confirm(`Delete topic "${topic.name}"?`)) {
            syllabus.deleteTopic(topic.id);
        }
    };

    const handleEdit = () => {
        const newName = prompt('Enter new topic name:', topic.name);
        if (newName && newName.trim()) {
            syllabus.updateTopic(topic.id, { name: newName.trim() });
        }
    };

    return (
        <div className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="text-sm font-medium">{topic.name}</span>
            </div>

            <div className="flex items-center gap-4">
                {/* Completion Toggles */}
                <div className="flex items-center gap-3 mr-2">
                    <label className="flex items-center gap-1.5 cursor-pointer group/toggle" title="Mark topic complete for Teacher">
                        <input
                            type="checkbox"
                            checked={topic.teacherCompleted}
                            onChange={() => syllabus.toggleTopicTeacherCompletion(topic.id)}
                            className="w-3 h-3 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <GraduationCap className={`w-3 h-3 ${topic.teacherCompleted ? 'text-blue-500' : 'text-muted-foreground group-hover/toggle:text-blue-400'}`} />
                    </label>
                    <div className="w-px h-3 bg-border/50"></div>
                    <label className="flex items-center gap-1.5 cursor-pointer group/toggle" title="Mark topic complete for Student">
                        <input
                            type="checkbox"
                            checked={topic.studentCompleted}
                            onChange={() => syllabus.toggleTopicStudentCompletion(topic.id)}
                            className="w-3 h-3 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <Target className={`w-3 h-3 ${topic.studentCompleted ? 'text-emerald-500' : 'text-muted-foreground group-hover/toggle:text-emerald-400'}`} />
                    </label>
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-blue-500" onClick={handleEdit}>
                        <Edit2 className="w-2.5 h-2.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-500" onClick={handleDelete}>
                        <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import UnitItem from './UnitItem';
import { useState } from 'react';
import AddUnitModal from './AddUnitModal';
import AddTopicModal from './AddTopicModal';

interface SubjectDetailsProps {
    subjectId: string;
}

export default function SubjectDetails({ subjectId }: SubjectDetailsProps) {
    const { syllabus } = useStudentStore();
    const units = syllabus.units.filter(u => u.subjectId === subjectId).sort((a, b) => a.order - b.order);

    const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
    const [addTopicUnitId, setAddTopicUnitId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Syllabus Structure</h4>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddUnitOpen(true)} className="h-8 text-xs gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add Unit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAddTopicUnitId('')} className="h-8 text-xs gap-1.5" disabled={units.length === 0}>
                        <Plus className="w-3.5 h-3.5" /> Add Topic
                    </Button>
                </div>
            </div>

            {units.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border/60">
                    <p className="text-sm text-muted-foreground mb-3">No units added to this subject yet.</p>
                    <Button variant="secondary" size="sm" onClick={() => setIsAddUnitOpen(true)}>
                        Create First Unit
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {units.map(unit => (
                        <UnitItem
                            key={unit.id}
                            unit={unit}
                            onAddTopic={() => setAddTopicUnitId(unit.id)}
                        />
                    ))}
                </div>
            )}

            {isAddUnitOpen && (
                <AddUnitModal
                    initialSubjectId={subjectId}
                    onClose={() => setIsAddUnitOpen(false)}
                />
            )}

            {addTopicUnitId !== null && (
                <AddTopicModal
                    initialSubjectId={subjectId}
                    initialUnitId={addTopicUnitId}
                    onClose={() => setAddTopicUnitId(null)}
                />
            )}
        </div>
    );
}

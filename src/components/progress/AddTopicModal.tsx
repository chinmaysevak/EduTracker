import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentStore } from '@/context/StudentContext';
import { toast } from 'sonner';

interface AddTopicModalProps {
    onClose: () => void;
    initialUnitId?: string;
    initialSubjectId?: string;
}

export default function AddTopicModal({ onClose, initialUnitId = '', initialSubjectId = '' }: AddTopicModalProps) {
    const { subjects, syllabus } = useStudentStore();
    const [subjectId, setSubjectId] = useState(initialSubjectId);
    const [unitId, setUnitId] = useState(initialUnitId);
    const [name, setName] = useState('');

    // Filter units based on selected subject
    const availableUnits = syllabus.units.filter(u => u.subjectId === subjectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitId || !name.trim()) {
            toast.error('Unit and Topic Name are required');
            return;
        }

        syllabus.addTopic(unitId, name.trim());
        toast.success('Topic added successfully');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border/50 rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Add New Topic</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Subject</label>
                        <select
                            value={subjectId}
                            onChange={(e) => {
                                setSubjectId(e.target.value);
                                setUnitId(''); // Reset unit when subject changes
                            }}
                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        >
                            <option value="" disabled>Select a subject...</option>
                            {subjects.subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Unit</label>
                        <select
                            value={unitId}
                            onChange={(e) => setUnitId(e.target.value)}
                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                            disabled={!subjectId || availableUnits.length === 0}
                        >
                            <option value="" disabled>
                                {!subjectId ? 'Select subject first...' : availableUnits.length === 0 ? 'No units found in this subject' : 'Select a unit...'}
                            </option>
                            {availableUnits.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Topic Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Newton's First Law"
                            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={!unitId}>Save Topic</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

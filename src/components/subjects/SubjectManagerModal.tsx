import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
    CalendarIcon, Plus, Trash2, BookOpen, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { useSubjects, useTopics } from '@/hooks/useData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Subject, Topic } from '@/types';

interface SubjectManagerModalProps {
    subjectId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SubjectManagerModal({ subjectId, isOpen, onClose }: SubjectManagerModalProps) {
    const { subjects, updateSubject } = useSubjects();
    const { topics, addTopic, updateTopic, deleteTopic, getTopicsForSubject } = useTopics();

    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicDifficulty, setNewTopicDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const subject = subjects.find(s => s.id === subjectId);
    const subjectTopics = subjectId ? getTopicsForSubject(subjectId) : [];

    if (!subject) return null;

    const handleUpdateExamDate = (date: Date | undefined) => {
        if (date) {
            updateSubject(subject.id, { examDate: date.toISOString() });
            toast.success('Exam date updated');
        }
    };

    const handleAddTopic = () => {
        if (!newTopicName.trim()) return;

        addTopic({
            subjectId: subject.id,
            name: newTopicName.trim(),
            difficulty: newTopicDifficulty
        });

        setNewTopicName('');
        toast.success('Topic added');
    };

    const difficultyColor = {
        easy: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        medium: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        hard: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl card-modern border-0 max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: subject.color || '#666' }}
                        >
                            {subject.name.charAt(0)}
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">{subject.name}</DialogTitle>
                            <DialogDescription>Manage exam schedule and curriculum topics</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="topics" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-4">
                        <TabsTrigger value="topics" className="rounded-lg">Topics & Backlog</TabsTrigger>
                        <TabsTrigger value="exam" className="rounded-lg">Exam Schedule</TabsTrigger>
                    </TabsList>

                    <TabsContent value="topics" className="flex-1 flex flex-col min-h-0 space-y-4">
                        {/* Add Topic Form */}
                        <div className="flex gap-2 items-end p-4 bg-muted/30 rounded-xl border border-border/50">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs font-medium">New Topic Name</Label>
                                <Input
                                    value={newTopicName}
                                    onChange={(e) => setNewTopicName(e.target.value)}
                                    placeholder="e.g., Thermodynamics"
                                    className="h-9 rounded-lg"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label className="text-xs font-medium">Difficulty</Label>
                                <Select
                                    value={newTopicDifficulty}
                                    onValueChange={(v: 'easy' | 'medium' | 'hard') => setNewTopicDifficulty(v)}
                                >
                                    <SelectTrigger className="h-9 rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAddTopic} size="sm" className="h-9 w-9 p-0 rounded-lg btn-gradient shrink-0 mb-[1px]">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Topics List */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                            {subjectTopics.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>No topics added yet.</p>
                                    <p className="text-xs">Add topics to track your mastery progress.</p>
                                </div>
                            ) : (
                                subjectTopics.map(topic => (
                                    <div key={topic.id} className="flex items-center justify-between p-3 bg-card border rounded-xl hover:shadow-sm transition-all group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium truncate">{topic.name}</span>
                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border-0 ${difficultyColor[topic.difficulty]}`}>
                                                    {topic.difficulty}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {topic.status === 'mastered' ? (
                                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Mastered
                                                    </span>
                                                ) : topic.status === 'revision' ? (
                                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Revision Needed
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Select
                                                value={topic.status}
                                                onValueChange={(v: any) => updateTopic(topic.id, { status: v })}
                                            >
                                                <SelectTrigger className="h-8 w-24 text-xs rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="revision">Revision</SelectItem>
                                                    <SelectItem value="mastered">Mastered</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => deleteTopic(topic.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="exam" className="space-y-6 pt-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Exam Date</Label>
                                <div className="flex items-center gap-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal rounded-xl h-12",
                                                    !subject.examDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {subject.examDate ? format(new Date(subject.examDate), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={subject.examDate ? new Date(subject.examDate) : undefined}
                                                onSelect={handleUpdateExamDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {subject.examDate && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => updateSubject(subject.id, { examDate: undefined })}
                                            className="text-muted-foreground hover:text-rose-500"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    EduTrack will use this date to calculate your exam readiness and create countdowns.
                                </p>
                            </div>

                            {subject.examDate && (
                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Countdown
                                    </h4>
                                    <p className="text-2xl font-bold mt-1 text-indigo-900 dark:text-indigo-100">
                                        {Math.ceil((new Date(subject.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                    <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-1">left to prepare</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

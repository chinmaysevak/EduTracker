import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronLeft, ChevronRight, Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import { useTimetable, useSubjects } from '@/hooks/useData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// dnd-kit imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item wrapper
interface SortableClassItemProps {
    id: string;
    index: number;
    cls: any;
    getSubjectName: (id: string) => string;
    removeClass: (day: string, index: number) => void;
    currentDayName: string;
}

function SortableClassItem({ id, index, cls, getSubjectName, removeClass, currentDayName }: SortableClassItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 rounded-xl border bg-card transition-colors hover:border-primary/30 gap-2">
            <div {...attributes} {...listeners} className="cursor-grab hover:text-primary active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
                <span className="font-medium text-sm">{getSubjectName(cls.subject)}</span>
                <span className="text-sm text-muted-foreground">{cls.startTime} - {cls.endTime}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0" onClick={() => removeClass(currentDayName, index)}>
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}

export function TimetableWidget() {
    const { getTimetableForDay, addClass, removeClass, reorderClass } = useTimetable();
    const { subjects } = useSubjects();

    const getSubjectName = (subjectOrId: string) => {
        return subjects.find(s => s.id === subjectOrId || s.name === subjectOrId)?.name || subjectOrId;
    };

    // 0 = Sunday, 1 = Monday, etc.
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
    const [isEditMode, setIsEditMode] = useState(false);

    const [editSubjectId, setEditSubjectId] = useState('');
    const [editStartTime, setEditStartTime] = useState('09:00');
    const [editEndTime, setEditEndTime] = useState('10:00');

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = daysOfWeek[selectedDayIndex];

    const todayClasses = getTimetableForDay(selectedDayIndex).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const now = new Date();
    const isToday = selectedDayIndex === now.getDay();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const handlePrevDay = () => setSelectedDayIndex(prev => (prev === 0 ? 6 : prev - 1));
    const handleNextDay = () => setSelectedDayIndex(prev => (prev === 6 ? 0 : prev + 1));
    const handleToday = () => setSelectedDayIndex(now.getDay());

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = todayClasses.findIndex((_, idx) => `class-${idx}` === active.id);
            const newIndex = todayClasses.findIndex((_, idx) => `class-${idx}` === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                reorderClass(currentDayName, oldIndex, newIndex);
            }
        }
    };

    const handleAddClass = () => {
        if (!editSubjectId) return;
        const subject = subjects.find(s => s.id === editSubjectId);
        if (subject) {
            addClass(currentDayName, subject.name, editStartTime, editEndTime);
            setEditSubjectId('');
            setEditStartTime('09:00');
            setEditEndTime('10:00');
        }
    };

    const EmptyState = () => (
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[120px]">
            <Clock className="w-8 h-8 opacity-20 mb-2" />
            <p>No classes scheduled for {isToday ? 'today' : currentDayName}. {isToday && 'Enjoy your time!'}</p>
        </CardContent>
    );

    return (
        <Card className="card-modern border-none shadow-md overflow-hidden bg-background">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Weekly Timetable</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background rounded-lg border shadow-sm mr-2 overflow-hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" onClick={handlePrevDay}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-8 px-3 rounded-none text-xs font-medium min-w-[100px]"
                                onClick={handleToday}
                            >
                                {isToday ? 'Today' : currentDayName}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-l" onClick={handleNextDay}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => setIsEditMode(true)}>
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit Schedule</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {todayClasses.length === 0 ? (
                <EmptyState />
            ) : (
                <CardContent className="p-0">
                    <div className="flex overflow-x-auto p-4 gap-4 pb-6 custom-scrollbar">
                        {todayClasses.map((cls, idx) => {
                            const isPast = isToday && cls.endTime < currentTimeStr;
                            const isCurrent = isToday && cls.startTime <= currentTimeStr && cls.endTime >= currentTimeStr;

                            return (
                                <div
                                    key={idx}
                                    className={`flex-shrink-0 w-64 p-4 rounded-xl border flex flex-col gap-3 transition-colors ${isCurrent
                                        ? 'bg-primary/10 border-primary shadow-sm'
                                        : isPast
                                            ? 'bg-muted/30 border-border/50 opacity-70'
                                            : 'bg-card border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-bold truncate max-w-[140px] text-base ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                            {getSubjectName(cls.subject)}
                                        </h4>
                                        {isCurrent && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground animate-pulse">
                                                Now
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                                        <Clock className="w-4 h-4" />
                                        <span>{cls.startTime} - {cls.endTime}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            )}

            <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
                <DialogContent className="w-[90vw] max-w-2xl min-h-[420px] max-h-[85vh] flex flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0 pb-2">
                        <DialogTitle>Edit Schedule for {currentDayName}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        {/* Current Classes List */}
                        <div className="flex flex-col min-h-0 flex-shrink-0">
                            <Label className="mb-2">Current Schedule (Drag to Reorder)</Label>
                            {todayClasses.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed flex-shrink-0">No classes scheduled yet. Add one below.</div>
                            ) : (
                                <div className="overflow-y-auto max-h-[220px] space-y-2 pr-1">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={todayClasses.map((_, idx) => `class-${idx}`)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {todayClasses.map((cls, idx) => (
                                                <SortableClassItem
                                                    key={`class-${idx}`}
                                                    id={`class-${idx}`}
                                                    index={idx}
                                                    cls={cls}
                                                    getSubjectName={getSubjectName}
                                                    removeClass={removeClass}
                                                    currentDayName={currentDayName}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            )}
                        </div>

                        {/* Add New Class Form */}
                        <div className="flex-shrink-0 space-y-3 pt-2 border-t">
                            <Label>Add New Class</Label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Subject</Label>
                                    <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" sideOffset={4} className="z-[105]">
                                            {subjects.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                                    <Input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">End Time</Label>
                                    <Input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                variant="secondary"
                                onClick={handleAddClass}
                                disabled={!editSubjectId || !editStartTime || !editEndTime}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add to {currentDayName}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="flex-shrink-0 pt-2">
                        <Button onClick={() => setIsEditMode(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}



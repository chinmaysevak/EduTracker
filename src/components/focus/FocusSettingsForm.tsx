import { useState } from 'react';
import { Plus, Trash2, Play, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubjects } from '@/hooks/useData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FocusBlock } from '@/hooks/useFocusEngine';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusSettingsFormProps {
    onStart: (subjectId: string, blocks: FocusBlock[]) => void;
}

export default function FocusSettingsForm({ onStart }: FocusSettingsFormProps) {
    const { subjects } = useSubjects();
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [blocks, setBlocks] = useState<FocusBlock[]>([
        { id: uuidv4(), type: 'study', duration: 25 * 60, label: 'Session 1' },
        { id: uuidv4(), type: 'break', duration: 5 * 60, label: 'Short Break' }
    ]);

    const addBlock = (type: 'study' | 'break') => {
        const newBlock: FocusBlock = {
            id: uuidv4(),
            type,
            duration: type === 'study' ? 25 * 60 : 5 * 60,
            label: type === 'study' ? `Session ${blocks.filter(b => b.type === 'study').length + 1}` : 'Break'
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlockDuration = (id: string, mins: number) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, duration: mins * 60 } : b));
    };

    const handleStart = () => {
        if (!selectedSubjectId) return;
        onStart(selectedSubjectId, blocks);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Configure Your Focus
                </h1>
                <p className="text-muted-foreground">Design your perfect study rhythm with custom blocks.</p>
            </div>

            <div className="space-y-6">
                {/* Subject Selector */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold ml-1 text-muted-foreground uppercase tracking-wider">Target Subject</label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm text-lg shadow-sm">
                            <SelectValue placeholder="What are we working on?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50">
                            {subjects.map(s => (
                                <SelectItem key={s.id} value={s.id} className="rounded-lg py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                        {s.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Blocks Timeline */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Session Schedule</label>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 rounded-full text-xs gap-1.5" onClick={() => addBlock('study')}>
                                <Plus className="w-3 h-3" /> Add Study
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-full text-xs gap-1.5" onClick={() => addBlock('break')}>
                                <Plus className="w-3 h-3" /> Add Break
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 relative">
                        {/* Vertical line indicator */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border/30 -z-10" />

                        <AnimatePresence mode="popLayout">
                            {blocks.map((block) => (
                                <motion.div
                                    key={block.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                                        block.type === 'study' 
                                        ? 'bg-primary/10 border-primary/20 text-primary' 
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                    }`}>
                                        {block.type === 'study' ? <Clock className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                                    </div>

                                    <Card className="flex-1 p-4 rounded-2xl border-border/50 bg-card/40 backdrop-blur-sm flex items-center justify-between group-hover:border-primary/30 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold uppercase tracking-tight opacity-70">{block.label}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input 
                                                    type="number" 
                                                    value={block.duration / 60}
                                                    onChange={(e) => updateBlockDuration(block.id, Number(e.target.value))}
                                                    className="w-12 bg-transparent font-semibold text-xl focus:outline-none focus:ring-0"
                                                />
                                                <span className="text-muted-foreground font-medium">minutes</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeBlock(block.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="pt-4">
                    <Button 
                        className="w-full h-16 rounded-2xl text-lg font-bold gap-3 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] btn-gradient"
                        disabled={!selectedSubjectId || blocks.length === 0}
                        onClick={handleStart}
                    >
                        <Play className="w-6 h-6 fill-current" />
                        Enter Deep Focus
                    </Button>
                </div>
            </div>
        </div>
    );
}

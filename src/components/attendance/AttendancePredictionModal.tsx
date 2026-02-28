import { useState } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useSubjects, useAttendance } from '@/hooks/useData';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AttendancePredictionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AttendancePredictionModal({ isOpen, onClose }: AttendancePredictionModalProps) {
    const { subjects } = useSubjects();
    const { calculateSubjectAttendance } = useAttendance();

    // State for simulated classes (negative = miss, positive = attend)
    const [simulation, setSimulation] = useState<Record<string, number>>({});

    const handleSimulationChange = (subjectId: string, value: number) => {
        setSimulation(prev => ({
            ...prev,
            [subjectId]: value
        }));
    };

    const getPrediction = (subjectId: string) => {
        const stats = calculateSubjectAttendance(subjectId);
        const simulatedChange = simulation[subjectId] || 0;

        // If simulatedChange is positive, we add to both present and total
        // If simulatedChange is negative, we add to total but not present (missing classes)
        const additionalPresent = simulatedChange > 0 ? simulatedChange : 0;
        const additionalTotal = Math.abs(simulatedChange);

        // We can't use the simple intelligence.ts function directly because it assumes missing classes
        // So we'll reimplement the logic here slightly to handle both attending and missing

        const newPresent = stats.present + additionalPresent;
        const newTotal = stats.total + additionalTotal;
        const newPercentage = newTotal > 0 ? Math.round((newPresent / newTotal) * 100) : 0;

        let status: 'safe' | 'risk' | 'critical' = 'safe';
        if (newPercentage < 60) status = 'critical';
        else if (newPercentage < 75) status = 'risk';

        return {
            current: stats.percentage,
            predicted: newPercentage,
            status,
            diff: newPercentage - stats.percentage
        };
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl card-modern border-0 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                        Attendance Forecaster
                    </DialogTitle>
                    <DialogDescription>
                        Simulate attending or missing future classes to see how it affects your percentage.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map(subject => {
                            const prediction = getPrediction(subject.id);
                            const simulatedVal = simulation[subject.id] || 0;

                            return (
                                <div key={subject.id} className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: subject.color || '#666' }}
                                            />
                                            <h3 className="font-semibold truncate max-w-[150px]">{subject.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-2xl font-bold">{prediction.predicted}%</span>
                                                {prediction.diff !== 0 && (
                                                    <Badge variant={prediction.diff > 0 ? 'default' : 'destructive'} className="text-[10px] px-1 h-5">
                                                        {prediction.diff > 0 ? '+' : ''}{prediction.diff}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">Currently: {prediction.current}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Miss next 5</span>
                                            <span className="font-medium text-foreground">
                                                {simulatedVal === 0 ? 'No Change' :
                                                    simulatedVal > 0 ? `Attend next ${simulatedVal}` : `Miss next ${Math.abs(simulatedVal)}`}
                                            </span>
                                            <span>Attend next 5</span>
                                        </div>
                                        <Slider
                                            min={-5}
                                            max={5}
                                            step={1}
                                            value={[simulatedVal]}
                                            onValueChange={(vals) => handleSimulationChange(subject.id, vals[0])}
                                            className="py-1"
                                        />

                                        {prediction.predicted < 75 && (
                                            <div className={`text-xs flex items-center gap-1.5 p-2 rounded-lg ${prediction.predicted < 60
                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                                                }`}>
                                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                                <span>
                                                    {prediction.predicted < 60 ? 'Critical Warning! Attendance is too low.' : 'Warning: Falling below 75% target.'}
                                                </span>
                                            </div>
                                        )}

                                        {prediction.predicted >= 75 && prediction.current < 75 && (
                                            <div className="text-xs flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                <span>Great! You're back on track.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => setSimulation({})} variant="outline" className="mr-2">Reset</Button>
                    <Button onClick={onClose}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

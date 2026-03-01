import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubjects } from '@/hooks/useData';
import { useFocusEngine } from '@/hooks/useFocusEngine';
import { useAmbientSounds } from '@/hooks/useAmbientSounds';
import { toast } from 'sonner';

interface FocusModeProps {
    onExit: () => void;
}

export default function FocusMode({ onExit }: FocusModeProps) {
    const { user } = useAuth();
    const userId = user?.id;

    // Use persistent engine
    const {
        session,
        timeLeft,
        progress,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        skipBreak
    } = useFocusEngine(userId);

    const { subjects } = useSubjects(undefined, userId);

    // Local state for UI selection only (not persistent session state)
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [selectedBreakDuration, setSelectedBreakDuration] = useState(5);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(session.subjectId || '');

    // Ambient sounds
    const { isPlaying: isSoundPlaying, currentSoundId, toggleSound, updateVolume, volume, stopSound: stopAmbientSound, sounds } = useAmbientSounds();

    // Sync local selection with active session if exists
    useEffect(() => {
        if (session.isActive && session.subjectId) {
            setSelectedSubjectId(session.subjectId);
        }
    }, [session.isActive, session.subjectId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!selectedSubjectId) {
            toast.error("Please select a subject first!");
            return;
        }
        startSession(selectedSubjectId, selectedDuration, selectedBreakDuration);
    };

    const handleStop = () => {
        if (window.confirm("Are you sure? You will lose progress for this session.")) {
            stopSession();
            stopAmbientSound();
        }
    };

    // Derived UI state
    const currentSubjectName = subjects.find(s => s.id === session.subjectId)?.name || 'Focus Session';

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${session.mode === 'break' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-medium">
                        {session.mode === 'break' ? 'Break Time' : 'Focus Mode Active'}
                    </span>
                </div>
                <Button variant="ghost" size="sm" onClick={onExit} className="gap-2 hover:bg-destructive/10 hover:text-destructive">
                    <Minimize2 className="w-4 h-4" />
                    Exit
                </Button>
            </div>

            {/* Main Timer Card */}
            <Card className="w-full max-w-sm border-2 shadow-2xl relative overflow-hidden">
                {session.isActive && (
                    <div
                        className={`absolute top-0 left-0 h-1 transition-all duration-1000 ease-linear ${session.mode === 'break' ? 'bg-blue-500' : 'bg-primary'}`}
                        style={{ width: `${progress}%` }}
                    />
                )}

                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {session.isActive
                            ? (session.mode === 'break' ? 'Take a Break' : 'Deep Focus')
                            : 'Ready to Focus?'}
                    </CardTitle>
                    <CardDescription>
                        {session.isActive
                            ? (session.mode === 'break' ? `Relax for a moment` : `Focusing on ${currentSubjectName}`)
                            : 'Set your study and break timers'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 pt-6">
                    {/* Timer Display */}
                    <div className="flex flex-col items-center justify-center">
                        <div className={`text-7xl font-mono font-bold tracking-tighter tabular-nums transition-colors ${session.isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {formatTime(timeLeft)}
                        </div>
                        {session.isActive && (
                            <p className="text-sm text-muted-foreground mt-2 animate-pulse">
                                {session.isPaused ? 'Session Paused' : 'Stay persistent...'}
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    {!session.isActive ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Subject</label>
                                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(subject => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Study</label>
                                    <Select
                                        value={selectedDuration.toString()}
                                        onValueChange={(v) => setSelectedDuration(Number(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 Min</SelectItem>
                                            <SelectItem value="25">25 Min</SelectItem>
                                            <SelectItem value="45">45 Min</SelectItem>
                                            <SelectItem value="60">60 Min</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Break</label>
                                    <Select
                                        value={selectedBreakDuration.toString()}
                                        onValueChange={(v) => setSelectedBreakDuration(Number(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 Min</SelectItem>
                                            <SelectItem value="10">10 Min</SelectItem>
                                            <SelectItem value="15">15 Min</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button className="w-full h-12 text-lg gap-2" onClick={handleStart}>
                                <Play className="w-5 h-5 fill-current" />
                                Start Blocking
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in duration-300">
                            {session.mode === 'study' ? (
                                <>
                                    {!session.isPaused ? (
                                        <Button variant="outline" size="lg" className="h-12 gap-2" onClick={pauseSession}>
                                            <Pause className="w-5 h-5 fill-current" />
                                            Pause
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="lg" className="h-12 gap-2 bg-primary/5 hover:bg-primary/10" onClick={resumeSession}>
                                            <Play className="w-5 h-5 fill-current" />
                                            Resume
                                        </Button>
                                    )}

                                    <Button variant="destructive" size="lg" className="h-12 gap-2" onClick={handleStop}>
                                        <Square className="w-5 h-5 fill-current" />
                                        Give Up
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" size="lg" className="h-12 gap-2 col-span-2" onClick={skipBreak}>
                                        <Play className="w-5 h-5 fill-current" />
                                        Skip Break
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ambient Sounds Control */}
            <div className="mt-6 w-full max-w-sm">
                <Card className="border shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ambient Sounds</span>
                            <div className="flex items-center gap-2">
                                {isSoundPlaying ? (
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={e => updateVolume(Number(e.target.value))}
                                    className="w-16 h-1 accent-primary cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {sounds.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => toggleSound(sound.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentSoundId === sound.id && isSoundPlaying
                                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                        }`}
                                >
                                    <span>{sound.icon}</span>
                                    <span>{sound.name}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Motivational Quote */}
            <div className="mt-4 text-center max-w-md text-muted-foreground text-sm animate-in fade-in delay-500 duration-700">
                <p>"The successful warrior is the average man, with laser-like focus." — Bruce Lee</p>
            </div>
        </div>
    );
}

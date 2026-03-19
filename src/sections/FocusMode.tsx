import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Volume2, VolumeX, X, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubjects } from '@/hooks/useData';
import { useFocusEngine } from '@/hooks/useFocusEngine';
import { useAmbientSounds } from '@/hooks/useAmbientSounds';
import { toast } from 'sonner';

interface FocusModeProps {
    onExit: () => void;
}

const DURATION_PRESETS = [
    { value: 15, label: '15', unit: 'min' },
    { value: 25, label: '25', unit: 'min' },
    { value: 45, label: '45', unit: 'min' },
    { value: 60, label: '60', unit: 'min' },
];

const BREAK_PRESETS = [
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
];

export default function FocusMode({ onExit }: FocusModeProps) {
    const { user } = useAuth();
    const userId = user?.id;

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

    const [selectedDuration, setSelectedDuration] = useState(25);
    const [selectedBreakDuration, setSelectedBreakDuration] = useState(5);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(session.subjectId || '');

    const { isPlaying: isSoundPlaying, currentSoundId, toggleSound, updateVolume, volume, stopSound: stopAmbientSound, sounds } = useAmbientSounds();

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

    const currentSubjectName = subjects.find(s => s.id === session.subjectId)?.name || 'Focus Session';

    // ═══════════════════════════════════════
    // Active Session UI — Immersive & Atmospheric
    // ═══════════════════════════════════════
    if (session.isActive) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 overflow-hidden">
                {/* Immersive animated background */}
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
                <div className="absolute inset-0 mesh-gradient opacity-50" />
                <div className="orb orb-1" style={{ width: '200px', height: '200px', filter: 'blur(80px)' }} />
                <div className="orb orb-2" style={{ width: '160px', height: '160px', filter: 'blur(60px)' }} />

                {/* Close Button */}
                <Button variant="ghost" size="icon" onClick={onExit} className="absolute top-4 right-4 rounded-full hover:bg-destructive/10 hover:text-destructive z-10">
                    <X className="w-5 h-5" />
                </Button>

                {/* Mode Label */}
                <p className={`relative z-10 text-xs font-bold uppercase tracking-[0.3em] mb-6 ${session.mode === 'break' ? 'text-emerald-500' : 'gradient-text-vibrant'}`}>
                    {session.mode === 'break' ? '☕ Break Time' : `Focusing on ${currentSubjectName}`}
                </p>

                {/* Large Timer with glow */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-8 z-10">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 ring-glow">
                        <circle cx="50%" cy="50%" r="47%" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                        <circle
                            cx="50%" cy="50%" r="47%" fill="none"
                            stroke={session.mode === 'break' ? '#10b981' : 'hsl(var(--primary))'}
                            strokeWidth="4"
                            strokeDasharray="100 100"
                            strokeDashoffset={100 - progress}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${session.mode === 'break' ? 'rgba(16, 185, 129, 0.4)' : 'hsl(var(--primary) / 0.4)'})` }}
                        />
                    </svg>
                    <div className="flex flex-col items-center">
                        <span className="text-6xl sm:text-7xl font-black mono-data tracking-tighter tabular-nums gradient-text-vibrant">
                            {formatTime(timeLeft)}
                        </span>
                        {session.isPaused && (
                            <span className="text-sm text-muted-foreground mt-2 animate-pulse">Paused</span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 z-10">
                    {session.mode === 'study' ? (
                        <>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-12 w-12 rounded-full hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                                onClick={handleStop}
                            >
                                <Square className="w-5 h-5 fill-current" />
                            </Button>

                            <Button
                                size="lg"
                                className="h-16 w-16 rounded-full shadow-2xl btn-gradient btn-glow hover:scale-110 active:scale-95 transition-transform"
                                onClick={session.isPaused ? resumeSession : pauseSession}
                            >
                                {session.isPaused ? <Play className="w-7 h-7 fill-current" /> : <Pause className="w-7 h-7 fill-current" />}
                            </Button>

                            <div className="w-12 h-12" /> {/* Spacer for symmetry */}
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-12 gap-2 rounded-full px-6 hover:shadow-lg transition-all"
                            onClick={skipBreak}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Skip Break
                        </Button>
                    )}
                </div>

                {/* Ambient sounds (compact) */}
                <div className="absolute bottom-8 flex items-center gap-3 z-10">
                    <button onClick={() => isSoundPlaying ? stopAmbientSound() : undefined} className="text-muted-foreground hover:text-foreground transition-colors">
                        {isSoundPlaying ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <div className="flex gap-1.5">
                        {sounds.map(sound => (
                            <button
                                key={sound.id}
                                onClick={() => toggleSound(sound.id)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${currentSoundId === sound.id && isSoundPlaying
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {sound.icon}
                            </button>
                        ))}
                    </div>
                    {isSoundPlaying && (
                        <input
                            type="range" min="0" max="1" step="0.05" value={volume}
                            onChange={e => updateVolume(Number(e.target.value))}
                            className="w-16 h-1 accent-primary cursor-pointer"
                        />
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // Setup Screen — Immersive Premium Design
    // ═══════════════════════════════════════
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
            {/* Immersive animated background */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
            <div className="absolute inset-0 mesh-gradient opacity-40" />
            <div className="orb orb-1" style={{ width: '200px', height: '200px', filter: 'blur(80px)' }} />
            <div className="orb orb-2" style={{ width: '150px', height: '150px', filter: 'blur(70px)' }} />
            <div className="orb orb-3" style={{ width: '120px', height: '120px', filter: 'blur(50px)' }} />

            {/* Close Button */}
            <Button variant="ghost" size="icon" onClick={onExit} className="absolute top-4 right-4 rounded-full hover:bg-destructive/10 hover:text-destructive z-10">
                <X className="w-5 h-5" />
            </Button>

            <div className="w-full max-w-md space-y-8 py-8 relative z-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4 card-glow-pulse">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight font-display gradient-text-vibrant">Ready to Focus?</h1>
                    <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Pick your subject and duration, then lock in.
                    </p>
                </div>

                {/* Subject Selection — Pill Buttons */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">Subject</label>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map(subject => (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedSubjectId(subject.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedSubjectId === subject.id
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'bg-card border-border/50 text-foreground hover:border-primary/30 hover:bg-primary/5 hover:shadow-md'
                                    }`}
                            >
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: subject.color || '#666' }}
                                />
                                <span className="truncate max-w-[120px]">{subject.name}</span>
                            </button>
                        ))}
                    </div>
                    {subjects.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-3">Add subjects in Attendance first.</p>
                    )}
                </div>

                {/* Duration — Large Tappable Chips with gradient selection */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">Study Duration</label>
                    <div className="grid grid-cols-4 gap-3">
                        {DURATION_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => setSelectedDuration(preset.value)}
                                className={`flex flex-col items-center justify-center py-4 rounded-2xl text-center transition-all border ${selectedDuration === preset.value
                                    ? 'bg-gradient-to-br from-primary/15 to-violet-500/15 border-primary/40 text-primary shadow-lg shadow-primary/10'
                                    : 'bg-card border-border/50 text-foreground hover:border-primary/20 hover:shadow-md'
                                    }`}
                            >
                                <span className="text-2xl font-bold mono-data">{preset.label}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{preset.unit}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Break Duration — Smaller Chips */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">Break Duration</label>
                    <div className="flex gap-3">
                        {BREAK_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => setSelectedBreakDuration(preset.value)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-center transition-all border ${selectedBreakDuration === preset.value
                                    ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
                                    : 'bg-card border-border/50 text-foreground hover:border-emerald-500/20 hover:shadow-md'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ambient Sounds (Integrated) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">Ambient Sounds</label>
                        {isSoundPlaying && (
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                                <input
                                    type="range" min="0" max="1" step="0.05" value={volume}
                                    onChange={e => updateVolume(Number(e.target.value))}
                                    className="w-16 h-1 accent-primary cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {sounds.map(sound => (
                            <button
                                key={sound.id}
                                onClick={() => toggleSound(sound.id)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${currentSoundId === sound.id && isSoundPlaying
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-card border-border/50 text-muted-foreground hover:border-primary/20 hover:shadow-md'
                                    }`}
                            >
                                <span>{sound.icon}</span>
                                <span>{sound.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button — Premium Pulsing Glow */}
                <Button
                    className="w-full h-14 rounded-2xl text-base font-bold gap-3 shadow-xl btn-gradient btn-glow hover:scale-[1.01] active:scale-[0.99] transition-all"
                    onClick={handleStart}
                    disabled={!selectedSubjectId}
                >
                    <Play className="w-6 h-6 fill-current" />
                    Start Focus Session
                </Button>
            </div>
        </div>
    );
}

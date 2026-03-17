import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Square, FastForward, Bell, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FocusSessionState, FocusBlock } from '@/hooks/useFocusEngine';
import { useSubjects } from '@/hooks/useData';

interface FocusOverlayProps {
    session: FocusSessionState;
    timeLeft: number;
    progress: number;
    currentBlock: FocusBlock | null;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onSkip: () => void;
}

export default function FocusOverlay({
    session,
    timeLeft,
    progress,
    currentBlock,
    onPause,
    onResume,
    onStop,
    onSkip
}: FocusOverlayProps) {
    const { getSubjectById } = useSubjects();
    const subject = getSubjectById(session.subjectId);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSoundMuted, setIsSoundMuted] = useState(false);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleEsc = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleEsc);
        return () => document.removeEventListener('fullscreenchange', handleEsc);
    }, []);

    if (!currentBlock) return null;

    const isStudy = currentBlock.type === 'study';
    const accentColor = isStudy ? 'text-primary' : 'text-emerald-500';
    const bgAccent = isStudy ? 'bg-primary' : 'bg-emerald-500';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden"
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <motion.div 
                    animate={{ 
                        scale: isStudy ? [1, 1.1, 1] : [1, 1.05, 1],
                        opacity: isStudy ? [0.3, 0.4, 0.3] : [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] ${bgAccent}`}
                />
            </div>

            {/* Top Bar */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-50">Deep Focus</span>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject?.color }} />
                             {subject?.name || 'Academic Session'}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsSoundMuted(!isSoundMuted)} className="rounded-full w-12 h-12">
                        {isSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="rounded-full w-12 h-12">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
                {/* Mode Label */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentBlock.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`text-sm font-black uppercase tracking-[0.4em] mb-6 ${accentColor}`}
                    >
                        {isStudy ? 'Focusing' : 'Resting'}
                    </motion.div>
                </AnimatePresence>

                {/* Large Timer */}
                <div className="relative flex items-center justify-center w-72 h-72 sm:w-96 sm:h-96">
                    {/* Progress Circle Base */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            className="stroke-muted/30"
                            strokeWidth="4"
                            fill="none"
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            className={`${isStudy ? 'stroke-primary' : 'stroke-emerald-500'}`}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="100 100"
                            animate={{ strokeDashoffset: 100 - progress }}
                            transition={{ duration: 1, ease: "linear" }}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="flex flex-col items-center">
                        <motion.span 
                            key={timeLeft}
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-7xl sm:text-9xl font-black mono-data tracking-tighter"
                        >
                            {formatTime(timeLeft)}
                        </motion.span>
                        <p className="text-muted-foreground font-medium mt-2">{currentBlock.label || (isStudy ? 'Focus Round' : 'Break Time')}</p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-12 w-full space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                        <span>Cycle {session.currentBlockIndex / 2 + 1} of {session.blocks.length / 2}</span>
                        <span>{Math.floor(session.totalFocusTime / 60)}m focused today</span>
                    </div>
                    <div className="flex gap-1 h-1.5 w-full">
                        {session.blocks.map((b, i) => (
                            <div 
                                key={b.id} 
                                className={`flex-1 rounded-full ${
                                    i < session.currentBlockIndex 
                                    ? (b.type === 'study' ? 'bg-primary' : 'bg-emerald-500') 
                                    : i === session.currentBlockIndex 
                                        ? 'bg-muted-foreground animate-pulse' 
                                        : 'bg-muted/30'
                                }`} 
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-12 flex items-center gap-6">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-14 h-14 rounded-full border-border/50 hover:bg-muted"
                    onClick={onStop}
                >
                    <Square className="w-5 h-5 fill-current" />
                </Button>

                <Button 
                    variant="default" 
                    size="icon" 
                    className="w-20 h-20 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 btn-gradient"
                    onClick={session.isPaused ? onResume : onPause}
                >
                    {session.isPaused ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8 fill-current" />}
                </Button>

                <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-14 h-14 rounded-full border-border/50 hover:bg-muted"
                    onClick={onSkip}
                >
                    <FastForward className="w-5 h-5" />
                </Button>
            </div>

            {/* Notification Indicator */}
            <div className="absolute bottom-8 left-8 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                 <Bell className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Notifications Active</span>
            </div>
        </motion.div>
    );
}

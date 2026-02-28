import { useState, useEffect } from 'react';
import { useStudyMaterials } from '@/hooks/useData';
import { getFile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { StudyMaterial } from '@/types';
import { ArrowLeft, Clock, Save, StickyNote, Maximize2, Minimize2, Play, Pause } from 'lucide-react';

interface StudyReaderProps {
    materialId: string;
    onClose: () => void;
}

export default function StudyReader({ materialId, onClose }: StudyReaderProps) {
    const { materials } = useStudyMaterials();
    const material: StudyMaterial | undefined = materials.find(m => m.id === materialId);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (material) {
            const savedNotes = localStorage.getItem(`notes-${materialId}`);
            if (savedNotes) setNotes(savedNotes);
        }
    }, [material, materialId]);

    useEffect(() => {
        async function loadPdf() {
            if (material?.type === 'pdf' && material.fileId) {
                setIsLoading(true);
                try {
                    const fileRecord = await getFile(material.fileId);
                    if (fileRecord) {
                        const url = URL.createObjectURL(fileRecord.data);
                        setPdfUrl(url);
                    }
                } catch (e) {
                    console.error("Failed to load PDF", e);
                } finally {
                    setIsLoading(false);
                }
            }
        }
        loadPdf();

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [material]);

    // Timer
    useEffect(() => {
        let interval: number;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveNotes = () => {
        localStorage.setItem(`notes-${materialId}`, notes);
    };

    // Autosave notes every 30 seconds
    useEffect(() => {
        const timer = setInterval(handleSaveNotes, 30000);
        return () => clearInterval(timer);
    }, [notes]);

    if (!material) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-lg text-muted-foreground">Material not found</p>
                    <Button onClick={onClose}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold max-w-[200px] md:max-w-md truncate">{material.title}</h1>
                        <span className="text-xs text-muted-foreground">{isTimerRunning ? 'Studying...' : 'Paused'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg font-mono text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        {formatTime(elapsedTime)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={toggleTimer} className={isTimerRunning ? 'text-amber-500' : 'text-emerald-500'}>
                        {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="hidden md:flex">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes} className="hidden md:flex gap-2">
                        <Save className="w-4 h-4" /> Save
                    </Button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* PDF/Content Area */}
                <div className={`flex-1 bg-muted/20 relative ${isFullscreen ? 'w-full' : 'md:w-2/3'}`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading PDF...</span>
                        </div>
                    ) : material.type === 'pdf' && pdfUrl ? (
                        <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Viewer" />
                    ) : (
                        <div className="p-8 max-w-2xl mx-auto overflow-y-auto h-full">
                            <h2 className="text-2xl font-bold mb-4">{material.title}</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">{material.content}</p>
                            {material.type === 'link' && (
                                <a href={material.content} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mt-4 block">
                                    Open Link
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Notes Side Panel */}
                <div className={`border-l bg-background flex flex-col transition-all duration-300 ${isFullscreen ? 'w-0 border-0 overflow-hidden' : 'w-full md:w-1/3'}`}>
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                            <StickyNote className="w-4 h-4" />
                            Study Notes
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs md:hidden" onClick={handleSaveNotes}>
                            Save
                        </Button>
                    </div>
                    <div className="flex-1 p-4">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Type your notes here..."
                            className="h-full resize-none border-0 focus-visible:ring-0 p-0 text-sm leading-relaxed"
                        />
                    </div>
                    <div className="p-2 border-t text-xs text-muted-foreground text-center">
                        Autosaves every 30s
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// AI Syllabus Scanner — Upload & Parse UI
// ============================================

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, FileText, Loader2, Check, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ParsedSubject {
    name: string;
    credits?: number;
    units: { name: string; topics: string[] }[];
}

interface ParsedResult {
    subjects: ParsedSubject[];
    exams?: { title: string; subject: string; date: string; weight?: string }[];
}

interface SyllabusScannerProps {
    onImport: (data: ParsedResult) => void;
}

export function SyllabusScanner({ onImport }: SyllabusScannerProps) {
    const [mode, setMode] = useState<'idle' | 'text' | 'image'>('idle');
    const [textInput, setTextInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ParsedResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTextParse = async () => {
        if (!textInput.trim() || textInput.trim().length < 20) {
            toast.error('Please paste more syllabus text (at least 20 characters)');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.post<{ data: ParsedResult }>('/syllabus-scanner/parse', { text: textInput });
            setResult(res.data);
            toast.success(`Found ${res.data.subjects.length} subject(s)!`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to parse syllabus');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setIsLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                try {
                    const res = await api.post<{ data: ParsedResult }>('/syllabus-scanner/parse-image', {
                        imageBase64: base64,
                        mimeType: file.type,
                    });
                    setResult(res.data);
                    toast.success(`Found ${res.data.subjects.length} subject(s)!`);
                } catch (err: any) {
                    toast.error(err.message || 'Failed to parse image');
                } finally {
                    setIsLoading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch {
            setIsLoading(false);
            toast.error('Failed to read file');
        }
    };

    const handleImport = () => {
        if (result) {
            onImport(result);
            toast.success('Syllabus imported successfully!');
            setResult(null);
            setMode('idle');
            setTextInput('');
        }
    };

    if (result) {
        return (
            <Card className="card-modern border-0">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Check className="w-5 h-5 text-green-600" />
                        Syllabus Parsed Successfully
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.subjects.map((subject, i) => (
                        <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-violet-600" />
                                <h4 className="font-semibold">{subject.name}</h4>
                                {subject.credits && (
                                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full">
                                        {subject.credits} credits
                                    </span>
                                )}
                            </div>
                            {subject.units.map((unit, j) => (
                                <div key={j} className="ml-6 mt-2">
                                    <p className="text-sm font-medium">{unit.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {unit.topics.map((topic, k) => (
                                            <span key={k} className="text-xs px-2 py-0.5 bg-card border border-border rounded-md">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {result.exams && result.exams.length > 0 && (
                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-200 dark:border-orange-900">
                            <h4 className="font-semibold text-sm mb-2">📅 Detected Exams</h4>
                            {result.exams.map((exam, i) => (
                                <div key={i} className="text-sm text-muted-foreground">
                                    {exam.title} — {exam.subject} ({exam.date}) {exam.weight && `· ${exam.weight}`}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleImport} className="btn-gradient rounded-xl flex-1">
                            <Check className="w-4 h-4 mr-2" />
                            Import to Syllabus Tracker
                        </Button>
                        <Button variant="ghost" onClick={() => { setResult(null); setMode('idle'); }} className="rounded-xl">
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-modern border-0">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    AI Syllabus Scanner
                </CardTitle>
            </CardHeader>
            <CardContent>
                {mode === 'idle' ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-20 rounded-xl border-dashed"
                            onClick={() => setMode('text')}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <FileText className="w-6 h-6 text-violet-600" />
                                <span className="text-xs">Paste Syllabus Text</span>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-20 rounded-xl border-dashed"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <Upload className="w-6 h-6 text-blue-600" />
                                <span className="text-xs">Upload Image / PDF</span>
                            </div>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setMode('image');
                                    handleImageUpload(file);
                                }
                            }}
                        />
                    </div>
                ) : mode === 'text' ? (
                    <div className="space-y-3">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste your syllabus content here... Include subject names, unit/chapter titles, and topic lists."
                            className="w-full h-40 p-3 rounded-xl border border-border bg-background text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleTextParse}
                                disabled={isLoading || !textInput.trim()}
                                className="btn-gradient rounded-xl"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 mr-2" /> Parse with AI</>
                                )}
                            </Button>
                            <Button variant="ghost" onClick={() => setMode('idle')} className="rounded-xl" disabled={isLoading}>
                                Back
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 py-6 justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                        <span className="text-sm text-muted-foreground">Analyzing your syllabus image...</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

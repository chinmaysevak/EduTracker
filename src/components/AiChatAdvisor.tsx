// ============================================
// AI Chat Advisor — Gemini-powered conversational UI
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useSubjects, useAttendance, useStudyTasks, useExams } from '@/hooks/useData';
import ReactMarkdown from 'react-markdown';
import { useSmartAcademicAssistant } from '@/hooks/useSmartAcademicAssistant';
import { useChatHistory } from '@/hooks/useChatHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
    "What should I focus on today?",
    "Which subjects need urgent attention?",
    "Help me plan my study session",
    "How can I improve my attendance?",
    "Am I on track for my exams?",
];

export function AiChatAdvisor() {
    const {
        sessions,
        activeSession,
        activeSessionId,
        setActiveSessionId,
        createNewSession,
        addMessage,
        deleteSession
    } = useChatHistory();

    const currentMessages = activeSession?.messages || [];
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { subjects } = useSubjects();
    const { calculateSubjectAttendance } = useAttendance();
    const { getPendingTasks, getOverdueTasks, getCompletedTasks } = useStudyTasks();
    const { getUpcomingExams } = useExams();
    const { performanceIndex } = useSmartAcademicAssistant();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, isLoading]);

    // Build academic context to send with each message
    const buildAcademicContext = () => {
        const attendanceStats = subjects.map(s => {
            const stats = calculateSubjectAttendance(s.id);
            return {
                subject: s.name,
                percentage: stats.percentage,
                present: stats.present,
                total: stats.total,
            };
        });

        const pending = getPendingTasks().map(t => ({
            description: t.description,
            subject: subjects.find(s => s.id === t.subjectId)?.name || 'Unknown',
            targetDate: t.targetDate,
            priority: t.priority,
        }));

        const overdue = getOverdueTasks().map(t => ({
            description: t.description,
            subject: subjects.find(s => s.id === t.subjectId)?.name || 'Unknown',
            targetDate: t.targetDate,
        }));

        const upcoming = getUpcomingExams().map(e => ({
            title: e.title,
            subject: subjects.find(s => s.id === e.subjectId)?.name || 'Unknown',
            date: e.examDate,
            status: e.preparationStatus,
        }));

        return {
            subjects: subjects.map(s => ({ name: s.name, color: s.color })),
            attendance: attendanceStats,
            tasks: {
                pending,
                overdue,
                completed: getCompletedTasks().length,
            },
            exams: upcoming,
            performanceIndex: performanceIndex ? {
                overall: performanceIndex.overall,
                level: performanceIndex.level,
            } : null,
        };
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        let targetSessionId = activeSessionId;
        if (!targetSessionId) {
            targetSessionId = await createNewSession();
        }
        if (!targetSessionId) return; // Safety: bail if session creation failed

        await addMessage(targetSessionId, userMessage);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post<{ reply: string }>('/ai/chat', {
                message: text.trim(),
                academicContext: buildAcademicContext(),
            });

            // Escape angle brackets so react-markdown doesn't strip them as invalid HTML (e.g. "< 75%")
            const safeContent = response.reply.replace(/</g, '&lt;');

            const aiMessage: ChatMessage = {
                role: 'ai',
                content: safeContent,
                timestamp: new Date(),
            };
            await addMessage(targetSessionId, aiMessage);
        } catch (error: any) {
            const errMessage: ChatMessage = {
                role: 'ai',
                content: `Sorry, I couldn't process that right now. ${error.message || 'Please try again.'}`,
                timestamp: new Date(),
            };
            await addMessage(targetSessionId, errMessage);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <Card className="card-modern border-0 overflow-hidden flex flex-col md:flex-row" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>

            {/* Sidebar for History */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/50 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-border">
                    <Button
                        onClick={() => createNewSession()}
                        className="w-full justify-start gap-2 rounded-xl btn-gradient"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                        {sessions.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No recent chats
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`relative group flex items-center p-3 rounded-xl cursor-pointer transition-all ${activeSessionId === session.id
                                        ? 'bg-accent border border-violet-500/20 shadow-sm'
                                        : 'hover:bg-accent/50 border border-transparent'
                                        }`}
                                    onClick={() => setActiveSessionId(session.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden pr-10">
                                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeSessionId === session.id ? 'text-violet-500' : 'text-muted-foreground'}`} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium truncate max-w-[140px]">{session.title}</span>
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                                                {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSession(session.id);
                                        }}
                                        className={`absolute right-2 p-1.5 rounded-md hover:bg-destructive hover:text-white bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${activeSessionId === session.id ? 'opacity-100' : ''}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <CardContent className="p-0 flex flex-col flex-1 relative bg-background/50 overflow-hidden">
                {/* Mobile History Toggle (Visible only on small screens) */}
                <div className="md:hidden p-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3" /> Chat History
                        </span>
                        <Button size="sm" onClick={() => createNewSession()} className="h-8 rounded-lg btn-gradient px-3 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> New Chat
                        </Button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {sessions.length === 0 ? (
                            <span className="text-[10px] text-muted-foreground italic">No recent chats</span>
                        ) : (
                            sessions.map(s => (
                                <Button
                                    key={s.id}
                                    size="sm"
                                    variant={activeSessionId === s.id ? 'default' : 'secondary'}
                                    onClick={() => setActiveSessionId(s.id)}
                                    className={`rounded-lg h-8 flex-shrink-0 max-w-[120px] transition-all text-xs ${activeSessionId === s.id ? 'shadow-sm ring-1 ring-primary/20' : ''
                                        }`}
                                >
                                    <span className="truncate">{s.title}</span>
                                </Button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-modern">
                    {currentMessages.length === 0 ? (
                        /* Empty state with suggested questions */
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">EduTracker AI</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                                I can see your subjects, attendance, tasks, and exams. Ask me anything about your academics!
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="px-3 py-2 text-xs rounded-xl border border-border bg-card hover:bg-accent hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {currentMessages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'ai' && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] md:max-w-[80%] min-w-0 rounded-2xl px-3 py-2 md:px-4 md:py-3 text-[13px] md:text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-md whitespace-pre-wrap'
                                            : 'bg-muted rounded-bl-md prose prose-sm dark:prose-invert max-w-none'
                                            }`}
                                    >
                                        {msg.role === 'ai' ? (
                                            <div className="break-words">
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2 md:gap-3 justify-start">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2 md:px-4 md:py-3 flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-violet-500" />
                                        <span className="text-xs md:text-sm text-muted-foreground font-medium">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-3 md:p-4 bg-card/80 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="flex gap-1.5 md:gap-2">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 h-10 md:h-11 rounded-xl bg-background/50 border-border/50 transition-all focus:ring-1 focus:ring-primary/20 min-w-0"
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 md:h-11 md:w-11 rounded-xl btn-gradient flex-shrink-0 shadow-lg shadow-violet-500/10"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                    </form>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground text-center mt-2 opacity-70">
                        Powered by Google Gemini · Responses based on your data
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

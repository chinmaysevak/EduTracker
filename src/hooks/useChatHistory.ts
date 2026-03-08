import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Shared type matching AiChatAdvisor
export interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export interface ChatSession {
    id: string; // Mapped from MongoDB _id
    title: string;
    updatedAt: string;
    messages: ChatMessage[];
}

export function useChatHistory() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

    // Initial load from MongoDB backend
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await api.get<any[]>('/chat-history');
                const formatted = data.map((s: any) => ({
                    id: s._id,
                    title: s.title,
                    updatedAt: s.updatedAt,
                    messages: [] // Don't load full messages on the sidebar list
                }));

                setSessions(formatted);

                // Auto-select most recently updated session 
                if (formatted.length > 0) {
                    setActiveSessionId(formatted[0].id);
                }
            } catch (err) {
                console.error("Failed to load chat sessions from cloud", err);
            }
        };
        fetchSessions();
    }, []);

    // Load full messages when the user switches to a different active session
    useEffect(() => {
        const fetchActiveSession = async () => {
            if (!activeSessionId) {
                setActiveSession(null);
                return;
            }
            try {
                const s = await api.get<any>(`/chat-history/${activeSessionId}`);

                const fullSession: ChatSession = {
                    id: s._id,
                    title: s.title,
                    updatedAt: s.updatedAt,
                    messages: s.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }))
                };

                setActiveSession(fullSession);

                // Sync the sidebar title just in case it changed
                setSessions(prev => prev.map(p => p.id === fullSession.id ? { ...p, title: fullSession.title, updatedAt: fullSession.updatedAt } : p));
            } catch (err) {
                console.error("Failed to load full chat session", err);
            }
        };
        fetchActiveSession();
    }, [activeSessionId]);

    const createNewSession = async (): Promise<string | null> => {
        try {
            const s = await api.post<any>('/chat-history');
            const newSession: ChatSession = {
                id: s._id,
                title: s.title,
                updatedAt: s.updatedAt,
                messages: []
            };

            // Optimistically update UI
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            setActiveSession(newSession);
            return newSession.id;
        } catch (err) {
            console.error("Failed to create new chat session", err);
            return null;
        }
    };

    const addMessage = async (sessionId: string, message: ChatMessage) => {
        // 1. Optimistic UI Update (instant feedback for the user)
        if (activeSession && activeSession.id === sessionId) {
            let newTitle = activeSession.title;
            if (activeSession.messages.length === 0 && message.role === 'user') {
                newTitle = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
            }

            setActiveSession({
                ...activeSession,
                title: newTitle,
                messages: [...activeSession.messages, message],
                updatedAt: new Date().toISOString()
            });

            // Sync sidebar
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s));
        }

        // 2. Commit to Cloud Database
        try {
            await api.put(`/chat-history/${sessionId}`, { message });
        } catch (err) {
            console.error("Failed to sync message to cloud", err);
        }
    };

    const deleteSession = async (sessionId: string) => {
        // Optimistic UI deletion
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
            setActiveSessionId(null);
            setActiveSession(null);
        }

        try {
            await api.delete(`/chat-history/${sessionId}`);
        } catch (err) {
            console.error("Failed to delete chat session", err);
        }
    };

    const clearAllHistory = async () => {
        console.warn("Bulk clear operations not supported via Cloud API yet.");
    };

    return {
        sessions,
        activeSession,
        activeSessionId,
        setActiveSessionId,
        createNewSession,
        addMessage,
        deleteSession,
        clearAllHistory
    };
}

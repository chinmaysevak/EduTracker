import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: check for stored token and validate it
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('edutracker-token');
            const storedUser = localStorage.getItem('edutracker-user');

            if (token && storedUser) {
                try {
                    // Validate token with the server
                    const data = await api.get<{ user: User }>('/auth/me');
                    setUser(data.user);
                    setIsAuthenticated(true);
                    localStorage.setItem('edutracker-user', JSON.stringify(data.user));
                } catch {
                    // Token invalid — clear everything
                    localStorage.removeItem('edutracker-token');
                    localStorage.removeItem('edutracker-user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const data = await api.post<{ token: string; user: User }>('/auth/register', {
            name, email, password
        });

        localStorage.setItem('edutracker-token', data.token);
        localStorage.setItem('edutracker-user', JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.post<{ token: string; user: User }>('/auth/login', {
            email, password
        });

        localStorage.setItem('edutracker-token', data.token);
        localStorage.setItem('edutracker-user', JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('edutracker-token');
        localStorage.removeItem('edutracker-user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const updateProfile = useCallback(async (name: string) => {
        const data = await api.put<{ user: User }>('/auth/profile', { name });
        setUser(data.user);
        localStorage.setItem('edutracker-user', JSON.stringify(data.user));
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

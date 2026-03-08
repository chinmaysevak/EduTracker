import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email?: string;
    theme?: string;
}

const applyTheme = (theme?: string) => {
    if (theme) {
        localStorage.setItem('edu-tracker-theme', theme);
        window.dispatchEvent(new CustomEvent('edutracker-theme-sync', { detail: theme }));
    }
};

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
    updateProfile: (name: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
    sendOtp: () => Promise<void>;
    changeEmail: (newEmail: string, otp: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string, otp: string) => Promise<void>;
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
                    applyTheme(data.user.theme);
                    localStorage.setItem('edutracker-user', JSON.stringify(data.user));
                } catch {
                    // Token invalid or server offline — use stored user as fallback
                    try {
                        const parsed = JSON.parse(storedUser);
                        if (parsed && parsed.id) {
                            setUser(parsed);
                            setIsAuthenticated(true);
                            applyTheme(parsed.theme);
                        } else {
                            localStorage.removeItem('edutracker-token');
                            localStorage.removeItem('edutracker-user');
                            setIsAuthenticated(false);
                            setUser(null);
                        }
                    } catch {
                        localStorage.removeItem('edutracker-token');
                        localStorage.removeItem('edutracker-user');
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                }
            } else {
                // Not authenticated
                setIsAuthenticated(false);
                setUser(null);
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
        applyTheme(data.user.theme);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.post<{ token: string; user: User }>('/auth/login', {
            email, password
        });

        localStorage.setItem('edutracker-token', data.token);
        localStorage.setItem('edutracker-user', JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);
        applyTheme(data.user.theme);
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

    const forgotPassword = useCallback(async (email: string) => {
        await api.post('/auth/forgot-password', { email });
    }, []);

    const resetPassword = useCallback(async (email: string, token: string, newPassword: string) => {
        await api.post('/auth/reset-password', { email, token, newPassword });
    }, []);

    const googleLogin = useCallback(async (credential: string) => {
        const data = await api.post<{ token: string; user: User }>('/auth/google', { credential });
        localStorage.setItem('edutracker-token', data.token);
        localStorage.setItem('edutracker-user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        applyTheme(data.user.theme);
    }, []);

    const sendOtp = useCallback(async () => {
        await api.post('/auth/send-otp', {});
    }, []);

    const changeEmail = useCallback(async (newEmail: string, otp: string) => {
        const data = await api.put<{ user: User }>('/auth/change-email', { newEmail, otp });
        setUser(data.user);
        localStorage.setItem('edutracker-user', JSON.stringify(data.user));
    }, []);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string, otp: string) => {
        await api.put('/auth/change-password', { currentPassword, newPassword, otp });
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, googleLogin, logout, updateProfile, forgotPassword, resetPassword, sendOtp, changeEmail, changePassword }}>
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

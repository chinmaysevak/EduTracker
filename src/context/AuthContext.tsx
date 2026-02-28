import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    name: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (name: string, email?: string) => void;
    logout: () => void;
    updateProfile: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for existing session
        const storedAuth = localStorage.getItem('edu-tracker-authenticated');
        const storedUser = localStorage.getItem('edu-tracker-user');

        if (storedAuth === 'true' && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Legacy check: If user has no ID, generate one and save it
                if (!parsedUser.id) {
                    parsedUser.id = uuidv4();
                    localStorage.setItem('edu-tracker-user', JSON.stringify(parsedUser));
                }
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse user data", e);
                logout();
            }
        } else {
            // Legacy fallback: Check for old simple name storage
            const legacyName = localStorage.getItem('edu-tracker-user-name');
            if (legacyName && storedAuth === 'true') {
                // Migrate legacy user to new structure
                const newUser = { id: uuidv4(), name: legacyName };
                setUser(newUser);
                setIsAuthenticated(true);
                localStorage.setItem('edu-tracker-user', JSON.stringify(newUser));
            }
        }
    }, []);

    const login = (name: string, email?: string) => {
        // Check if a user with this email/name already exists in some "users" list if we had one.
        // For now, we simulate "logging in" by creating a session or retrieving if we assume single-device.
        // Since we are doing local-first, "Login" is essentially "Create Profile" or "Unlock".

        // In a real app, we'd validate credentials. Here, we just create a session.
        // We try to keep the ID stable if it exists.

        let userId = uuidv4();

        // If we are re-logging in and have a stored ID, reuse it? 
        // Actually, distinct logins should probably just look at what's stored.
        // If the user effectively "Sign Up"s, we make a new ID.

        // For simplicity in this local-first model:
        // If logging in, we create a new user session.
        const newUser = { id: userId, name, email };

        setUser(newUser);
        setIsAuthenticated(true);

        localStorage.setItem('edu-tracker-authenticated', 'true');
        localStorage.setItem('edu-tracker-user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('edu-tracker-authenticated');
        // We KEEP the user data usually, but remove auth flag. 
        // For this app, "Logout" clears the session.
    };

    const updateProfile = (name: string) => {
        if (user) {
            const updatedUser = { ...user, name };
            setUser(updatedUser);
            localStorage.setItem('edu-tracker-user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
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

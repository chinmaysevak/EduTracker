// ============================================
// Authentication Context
// ============================================

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthSession } from '@/lib/authService';
import { generateSessionToken } from '@/lib/hash';
import { userStorage } from '@/lib/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const sessionData = localStorage.getItem('edutrack_session');
    if (sessionData) {
      try {
        const session: AuthSession = JSON.parse(sessionData);
        
        // Check if session is still valid (24 hours)
        if (session.expiresAt > Date.now()) {
          dispatch({ type: 'AUTH_SUCCESS', payload: session.user });
        } else {
          // Session expired, clean up
          localStorage.removeItem('edutrack_session');
        }
      } catch (error) {
        console.error('Invalid session data:', error);
        localStorage.removeItem('edutrack_session');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const { hashPassword, verifyPassword } = await import('@/lib/hash');
      const user = await userStorage.getUserByEmail(email);
      
      if (!user) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid email or password' });
        return;
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid email or password' });
        return;
      }

      // Update last login
      await userStorage.updateUserLastLogin(user.id);
      
      // Create session
      const session: AuthSession = {
        user,
        token: generateSessionToken(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem('edutrack_session', JSON.stringify(session));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Login failed. Please try again.' });
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const { hashPassword, validateEmail } = await import('@/lib/hash');
      
      // Validate email format
      if (!validateEmail(email)) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid email format' });
        return;
      }

      // Check password length
      if (password.length < 6) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Password must be at least 6 characters' });
        return;
      }

      // Check for existing user
      const existingUser = await userStorage.getUserByEmail(email);
      if (existingUser) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Email already registered' });
        return;
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await userStorage.createUser({
        fullName,
        email,
        passwordHash
      });

      // Auto-login after registration
      const session: AuthSession = {
        user,
        token: generateSessionToken(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem('edutrack_session', JSON.stringify(session));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Registration failed. Please try again.' });
    }
  };

  const logout = (): void => {
    localStorage.removeItem('edutrack_session');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

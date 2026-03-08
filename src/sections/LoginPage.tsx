// ============================================
// Login / Register Page with Google Sign-In
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  User,
  UserPlus
} from 'lucide-react';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '817526331759-2gafh4bmjft739d2qtpfvbjf6gpa56k7.apps.googleusercontent.com';

export default function LoginPage() {
  const { login, register, googleLogin, forgotPassword, resetPassword, isAuthenticated, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Sign-In button
  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleBtnRef.current.offsetWidth,
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'center'
        });
      }
    };

    // If Google script loaded
    if (window.google) {
      initGoogle();
    } else {
      // Wait for script to load
      const timer = setInterval(() => {
        if (window.google) {
          clearInterval(timer);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [mode]);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin(response.credential);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim() || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your email');
        return;
      }
    } else if (mode === 'reset') {
      if (!email || !resetToken || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
      } else if (mode === 'forgot') {
        await forgotPassword(email.trim());
        setMode('reset');
      } else if (mode === 'reset') {
        await resetPassword(email.trim(), resetToken.trim(), password);
        setMode('login');
      } else {
        await login(email.trim(), password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500" />
              <img
                src="/logo.png"
                alt="EduTrack Logo"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">EduTrack</h1>
              <p className="text-sm text-muted-foreground">Student Assistant</p>
            </div>
          </div>
        </div>

        <Card className="card-professional">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Enter New Password'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login' && 'Enter your credentials to access your account'}
              {mode === 'register' && 'Sign up to start tracking your academics'}
              {mode === 'forgot' && 'Enter your email to receive a reset pin'}
              {mode === 'reset' && 'Enter the pin from your console and your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign-In Button */}
            {(mode === 'login' || mode === 'register') && (
              <>
                <div
                  ref={googleBtnRef}
                  className="w-full flex justify-center [&>div]:!w-full"
                  style={{ minHeight: 44 }}
                />
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              {mode === 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="resetToken">Reset PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="resetToken"
                      type="text"
                      placeholder="123456"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">{mode === 'reset' ? 'New Password' : 'Password'}</Label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <SubmitButton
                type="submit"
                className="w-full btn-primary h-11"
                isLoading={isLoading}
                loadingText={
                  mode === 'login' ? 'Signing in...' :
                    mode === 'register' ? 'Creating account...' :
                      mode === 'forgot' ? 'Sending request...' : 'Resetting...'
                }
              >
                {mode === 'login' && <>Sign In <ArrowRight className="w-4 h-4" /></>}
                {mode === 'register' && <>Create Account <UserPlus className="w-4 h-4" /></>}
                {mode === 'forgot' && <>Request Reset PIN <ArrowRight className="w-4 h-4" /></>}
                {mode === 'reset' && <>Confirm New Password <Lock className="w-4 h-4" /></>}
              </SubmitButton>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button type="button" onClick={toggleMode} className="text-primary hover:underline font-medium">
                      Sign up
                    </button>
                  </>
                ) : mode === 'register' ? (
                  <>
                    Already have an account?{' '}
                    <button type="button" onClick={toggleMode} className="text-primary hover:underline font-medium">
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Remember your password?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                      Back to sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2024 EduTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}

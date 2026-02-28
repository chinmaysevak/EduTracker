import { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuth';

export default function LoginCheck() {
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    // If not authenticated and not on login/register pages, redirect to login
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated]);

  // If authenticated and on login/register pages, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/register') {
        window.location.href = '/dashboard';
      }
    }
  }, [isAuthenticated]);

  return null; // This component doesn't render anything, just handles redirects
}

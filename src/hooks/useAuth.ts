// ============================================
// Authentication Hook
// ============================================

import { useAuth } from '@/contexts/authContext';

export function useAuthState() {
  const { state } = useAuth();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error
  };
}

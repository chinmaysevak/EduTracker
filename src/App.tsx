import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import layout and pages
import DashboardLayout from '@/components/Layout/DashboardLayout';
import LoginPage from '@/sections/LoginPage';
import Dashboard from '@/sections/Dashboard';
import AttendanceTracker from '@/sections/AttendanceTracker';
import StudyPlanner from '@/sections/StudyPlanner';
import Resources from '@/pages/Resources';
import ProgressTracker from '@/sections/ProgressTracker';
import Settings from '@/sections/Settings';
import FocusMode from '@/sections/FocusMode';
import SmartAdvisor from '@/sections/SmartAdvisor';
import Report from '@/sections/Report';
import NotFound from '@/pages/NotFound';

// Auth Wrapper component to protect routes
function AuthWrapper() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes via Outlet (NOT another RouterProvider)
  return <Outlet />;
}

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthWrapper />,
    children: [
      {
        path: 'report',
        element: <Report />
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'attendance', element: <AttendanceTracker /> },
          { path: 'planner', element: <StudyPlanner /> },
          { path: 'resources', element: <Resources /> },
          { path: 'progress', element: <ProgressTracker /> },
          { path: 'advisor', element: <SmartAdvisor /> },
          { path: 'settings', element: <Settings /> },
          { path: 'focus', element: <FocusMode onExit={() => window.history.back()} /> },
          // Redirect root to dashboard
          { index: true, element: <Navigate to="/dashboard" replace /> }
        ]
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

// Main App component — single RouterProvider for the entire app
function App() {
  return <RouterProvider router={router} />;
}

export default App;


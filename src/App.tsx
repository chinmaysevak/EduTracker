import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { lazy, Suspense } from 'react';

// Import layout (keep eager for shell)
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Lazy load pages
const LoginPage = lazy(() => import('@/sections/LoginPage'));
const Dashboard = lazy(() => import('@/sections/Dashboard'));
const AttendanceTracker = lazy(() => import('@/sections/AttendanceTracker'));
const StudyPlanner = lazy(() => import('@/sections/StudyPlanner'));
const Resources = lazy(() => import('@/pages/Resources'));
const ProgressTracker = lazy(() => import('@/sections/ProgressTracker'));
const Settings = lazy(() => import('@/sections/Settings'));
const FocusMode = lazy(() => import('@/sections/FocusMode'));
const SmartAdvisor = lazy(() => import('@/sections/SmartAdvisor'));
const Report = lazy(() => import('@/sections/Report'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create a loading fallback for lazy routes
function RouteLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading module...</p>
      </div>
    </div>
  );
}

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
        element: <Suspense fallback={<RouteLoading />}><Report /></Suspense>
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <Suspense fallback={<RouteLoading />}><Dashboard /></Suspense> },
          { path: 'attendance', element: <Suspense fallback={<RouteLoading />}><AttendanceTracker /></Suspense> },
          { path: 'planner', element: <Suspense fallback={<RouteLoading />}><StudyPlanner /></Suspense> },
          { path: 'resources', element: <Suspense fallback={<RouteLoading />}><Resources /></Suspense> },
          { path: 'progress', element: <Suspense fallback={<RouteLoading />}><ProgressTracker /></Suspense> },
          { path: 'advisor', element: <Suspense fallback={<RouteLoading />}><SmartAdvisor /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<RouteLoading />}><Settings /></Suspense> },
          { path: 'focus', element: <Suspense fallback={<div className="min-h-screen bg-background" />}><FocusMode onExit={() => window.history.back()} /></Suspense> },
          // Redirect root to dashboard
          { index: true, element: <Navigate to="/dashboard" replace /> }
        ]
      }
    ]
  },
  {
    path: '/login',
    element: <Suspense fallback={<div className="min-h-screen bg-background" />}><LoginPage /></Suspense>
  },
  {
    path: '*',
    element: <Suspense fallback={<div className="min-h-screen bg-background" />}><NotFound /></Suspense>
  }
]);

// Main App component — single RouterProvider for the entire app
function App() {
  return <RouterProvider router={router} />;
}

export default App;


import { useEffect, useState, type ReactNode } from 'react';
import { Home, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HydrationGuard({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hydrated) setTimedOut(true);
    }, 10000); // 10s safety net
    return () => clearTimeout(timer);
  }, [hydrated]);

  if (timedOut && !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-lg space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto shadow-lg">
            <div className="text-4xl">⚠️</div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">App initialization timeout</h2>
            <p className="text-muted-foreground">
              The application is taking too long to load. This might be due to a poor network connection.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2 rounded-xl h-12"
            >
              <RotateCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="btn-gradient gap-2 rounded-xl h-12"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

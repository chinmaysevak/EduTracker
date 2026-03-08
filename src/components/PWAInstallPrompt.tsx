import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePwa } from '@/context/PwaContext';

export default function PWAInstallPrompt(): ReactElement | null {
  const { isInstallable, installApp, hidePrompt } = usePwa();

  // We only show the prompt if it's installable AND hasn't been hidden for this session
  // Or if it's being shown manually (but manual show is usually for buttons)
  if (!isInstallable) {
    return null;
  }

  return (
    <div
      className="fixed z-50 p-4 bg-background/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl max-w-sm mx-4 lg:mx-0 lg:right-6 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-6 animate-in slide-in-from-bottom-5 duration-500"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">Install EduTrack</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Add to home screen for offline access and better performance.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={installApp}
            className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Install
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={hidePrompt}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground rounded-lg"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}

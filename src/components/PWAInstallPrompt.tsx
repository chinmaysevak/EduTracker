import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

export default function PWAInstallPrompt({ onClose }: PWAInstallPromptProps): ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      if (onClose) {
        onClose();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose]);

  if (!isInstallable) {
    return null;
  }

  return (
    <div
      className="fixed z-50 p-4 bg-background border border-border rounded-lg shadow-lg max-w-sm mx-4 lg:mx-0 lg:right-4 right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-4"
    >
      <div className="flex items-center gap-3">
        <Smartphone className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Install EduTracker0</p>
          <p className="text-xs text-muted-foreground">
            Get the full experience with offline access and push notifications
          </p>
        </div>
        <Button
          onClick={async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome === 'accepted') {
                setIsInstallable(false);
                setDeferredPrompt(null);
                if (onClose) {
                  onClose();
                }
              }
            }
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Install
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsInstallable(false);
            setDeferredPrompt(null);
            if (onClose) {
              onClose();
            }
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

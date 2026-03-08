import React, { createContext, useContext, useState, useEffect } from 'react';

interface PwaContextType {
    deferredPrompt: any;
    isInstallable: boolean;
    installApp: () => Promise<void>;
    hidePrompt: () => void;
    showPromptManually: boolean;
    setShowPromptManually: (show: boolean) => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export function PwaProvider({ children }: { children: React.ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [showPromptManually, setShowPromptManually] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('PWA: beforeinstallprompt event fired');
        };

        const handleAppInstalled = () => {
            // Clear the deferredPrompt so it can be garbage collected
            setDeferredPrompt(null);
            setIsInstallable(false);
            setShowPromptManually(false);
            console.log('PWA: App was installed');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) {
            console.log('PWA: No deferredPrompt available');
            return;
        }
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA: User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
        setShowPromptManually(false);
    };

    const hidePrompt = () => {
        setShowPromptManually(false);
    };

    return (
        <PwaContext.Provider value={{
            deferredPrompt,
            isInstallable,
            installApp,
            hidePrompt,
            showPromptManually,
            setShowPromptManually
        }}>
            {children}
        </PwaContext.Provider>
    );
}

export function usePwa() {
    const context = useContext(PwaContext);
    if (context === undefined) {
        throw new Error('usePwa must be used within a PwaProvider');
    }
    return context;
}

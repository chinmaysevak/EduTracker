// ============================================
// ResponsiveWrapper — Platform Detection & Layout State
// Provides context for cross-platform navigation
// ============================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ResponsiveState {
    isMobile: boolean;      // < 768px
    isTablet: boolean;      // 768–1024px
    isDesktop: boolean;     // > 1024px
    isTouch: boolean;       // coarse pointer
    platform: 'ios' | 'android' | 'desktop';
}

const ResponsiveContext = createContext<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    platform: 'desktop',
});

export function useResponsive() {
    return useContext(ResponsiveContext);
}

function detectPlatform(): 'ios' | 'android' | 'desktop' {
    if (typeof navigator === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'ios';
    }
    if (/android/.test(ua)) return 'android';
    return 'desktop';
}

export function ResponsiveWrapper({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ResponsiveState>(() => ({
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
        isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
        isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
        isTouch: typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false,
        platform: detectPlatform(),
    }));

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            setState({
                isMobile: w < 768,
                isTablet: w >= 768 && w < 1024,
                isDesktop: w >= 1024,
                isTouch: window.matchMedia('(pointer: coarse)').matches,
                platform: detectPlatform(),
            });
        };

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Apply platform class to body
    useEffect(() => {
        const body = document.body;
        body.classList.remove('platform-ios', 'platform-android', 'platform-desktop');
        body.classList.add(`platform-${state.platform}`);

        if (state.isTouch) {
            body.classList.add('is-touch');
        } else {
            body.classList.remove('is-touch');
        }
    }, [state.platform, state.isTouch]);

    return (
        <ResponsiveContext.Provider value={state}>
            {children}
        </ResponsiveContext.Provider>
    );
}

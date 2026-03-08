// ============================================
// SystemStatusBadge — Responsive Status Indicator
// Hidden on mobile (bottom nav occupies that space)
// Compact on tablet, full on desktop
// ============================================

import { useResponsive } from '@/components/Layout/ResponsiveWrapper';

export function SystemStatusBadge() {
    const { isMobile } = useResponsive();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Don't render on mobile — bottom tab bar occupies the space
    if (isMobile) return null;

    return (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full glassy-surface text-xs mono-data text-muted-foreground select-none">
            <span
                className="console-dot"
                style={{ color: isOnline ? '#34d399' : '#f87171' }}
            />
            <span className="hidden lg:inline">
                System: {isOnline ? 'Online' : 'Offline'} | Sync: IndexedDB
            </span>
            <span className="lg:hidden">
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
}

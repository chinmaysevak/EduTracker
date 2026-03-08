// ============================================
// GlassyDataCard — Fluid Responsive Card
// GPU-accelerated, adaptive blur, container query
// ============================================

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassyDataCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    glowColor?: 'emerald' | 'blue' | 'amber' | 'red' | 'violet';
    onClick?: () => void;
    children?: ReactNode;
}

const glowMap: Record<string, string> = {
    emerald: 'dark:status-glow-emerald',
    blue: 'dark:status-glow-blue',
    amber: 'dark:status-glow-amber',
    red: 'dark:status-glow-red',
    violet: 'dark:status-glow-violet',
};

export function GlassyDataCard({
    title,
    value,
    subtitle,
    icon,
    glowColor,
    onClick,
    children,
}: GlassyDataCardProps) {
    const glowClass = glowColor ? glowMap[glowColor] || '' : '';

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`@container relative rounded-xl cursor-pointer ${glowClass}`}
            style={{ willChange: 'transform' }}
            onClick={onClick}
        >
            {/* Card surface — adaptive blur via CSS */}
            <div
                className="
          relative rounded-xl p-4
          bg-white dark:bg-white/[0.04]
          border border-border
          dark:border-transparent
          dark:border-image-[linear-gradient(to_bottom,rgba(255,255,255,0.12),rgba(255,255,255,0.02))_1]
          shadow-sm dark:shadow-glass
          dark:backdrop-blur-[8px] md:dark:backdrop-blur-[12px]
          dark:[-webkit-backdrop-filter:blur(8px)] md:dark:[-webkit-backdrop-filter:blur(12px)]
          transition-all duration-300
          hover:shadow-md dark:hover:shadow-glass-hover
        "
            >
                {/* Header: icon + title */}
                <div className="flex items-center gap-2 mb-2">
                    {icon && <div className="flex-shrink-0 opacity-80">{icon}</div>}
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                        {title}
                    </span>
                </div>

                {/* Value — fluid size with container query */}
                <div className="text-2xl @xs:text-3xl font-bold mono-data leading-none">
                    {value}
                </div>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1.5 truncate">{subtitle}</p>
                )}

                {/* Children (e.g. Progress bars) */}
                {children}
            </div>
        </motion.div>
    );
}

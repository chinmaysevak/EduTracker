// ============================================
// GlassyDataCard — Premium Animated Card
// GPU-accelerated, animated gradient border, shine sweep
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

const iconBgMap: Record<string, string> = {
    emerald: 'from-emerald-500/15 to-teal-500/15',
    blue: 'from-blue-500/15 to-indigo-500/15',
    amber: 'from-amber-500/15 to-orange-500/15',
    red: 'from-rose-500/15 to-red-500/15',
    violet: 'from-violet-500/15 to-purple-500/15',
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
    const iconBg = glowColor ? iconBgMap[glowColor] || '' : 'from-primary/15 to-primary/10';

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`@container relative rounded-xl cursor-pointer ${glowClass} gradient-border-animated`}
            style={{ willChange: 'transform' }}
            onClick={onClick}
        >
            {/* Card surface with shine sweep */}
            <div
                className="
          relative rounded-xl p-4 card-shine
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
                    {icon && (
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            {icon}
                        </div>
                    )}
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

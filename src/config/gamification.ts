import type { Badge } from "@/types";
import { Flame, Star, Zap, Clock, BookOpen, Trophy, Target, Crown } from "lucide-react";

export const LEVEL_THRESHOLDS = 1000;

export const AVAILABLE_BADGES: (Badge & { iconComponent: any })[] = [
    {
        id: 'first-step',
        name: 'First Step',
        description: 'Reach Level 2',
        icon: 'Star',
        iconComponent: Star,
        unlockedAt: ''
    },
    {
        id: 'streak-3',
        name: 'Consistency Is Key',
        description: 'Maintain a 3-day study streak',
        icon: 'Flame',
        iconComponent: Flame,
        unlockedAt: ''
    },
    {
        id: 'streak-7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: 'Zap',
        iconComponent: Zap,
        unlockedAt: ''
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Earn 5000 XP',
        icon: 'BookOpen',
        iconComponent: BookOpen,
        unlockedAt: ''
    },
    {
        id: 'focus-master',
        name: 'Focus Master',
        description: 'Complete a focus session of 60 mins',
        icon: 'Clock',
        iconComponent: Clock,
        unlockedAt: ''
    },
    {
        id: 'high-achiever',
        name: 'High Achiever',
        description: 'Reach Level 10',
        icon: 'Trophy',
        iconComponent: Trophy,
        unlockedAt: ''
    },
    {
        id: 'dedication',
        name: 'Pure Dedication',
        description: 'Studying late at night (after 10 PM)',
        icon: 'Target',
        iconComponent: Target,
        unlockedAt: ''
    },
    {
        id: 'legend',
        name: 'Legend',
        description: 'Reach Level 50',
        icon: 'Crown',
        iconComponent: Crown,
        unlockedAt: ''
    }
];

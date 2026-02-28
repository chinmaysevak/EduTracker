import type { ModuleType } from '@/types';
import { LayoutDashboard, BookOpen, ClipboardList, TrendingUp, Settings } from 'lucide-react';

interface BottomNavProps {
    activeModule: ModuleType;
    onChange: (module: ModuleType) => void;
}

export default function BottomNav({ activeModule, onChange }: BottomNavProps) {
    const items: { id: ModuleType; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'materials', label: 'Materials', icon: BookOpen },
        { id: 'planner', label: 'Planner', icon: ClipboardList },
        { id: 'progress', label: 'Analytics', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
            <div className="flex items-center justify-around p-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-primary/10' : 'bg-transparent'
                                }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

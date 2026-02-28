import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useSubjects, useUserProfile } from '@/hooks/useData';
import type { ModuleType } from '@/types';

interface ResumeSessionCardProps {
    onNavigate: (module: ModuleType) => void;
}

export function ResumeSessionCard({ onNavigate }: ResumeSessionCardProps) {
    const { profile } = useUserProfile();
    const { getSubjectById } = useSubjects();

    if (!profile.lastStudiedSubjectId) return null;

    const subject = getSubjectById(profile.lastStudiedSubjectId);
    if (!subject) return null;

    return (
        <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
            <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div>
                    <p className="text-violet-100 text-xs font-medium mb-1">Welcome back, {profile.name}!</p>
                    <h3 className="font-bold text-lg">Continue learning {subject.name}?</h3>
                </div>
                <Button
                    variant="secondary"
                    className="gap-2 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => onNavigate('focus')}
                >
                    <PlayCircle className="w-4 h-4" />
                    Resume Session
                </Button>
            </CardContent>
        </Card>
    );
}

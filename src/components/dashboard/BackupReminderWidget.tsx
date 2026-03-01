// ============================================
// Backup Reminder Widget - Dashboard
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Download } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useImportExport } from '@/hooks/useImportExport';
import { useAuth } from '@/context/AuthContext';

export function BackupReminderWidget() {
    const { user } = useAuth();
    const userId = user?.id;
    const [lastExportDate, setLastExportDate] = useLocalStorage<string | null>('edu-tracker-last-export', null, userId);
    const { exportData } = useImportExport(userId);

    const daysSinceExport = lastExportDate
        ? Math.floor((Date.now() - new Date(lastExportDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // Show if never exported or more than 7 days ago
    const shouldShow = daysSinceExport === null || daysSinceExport >= 7;

    if (!shouldShow) return null;

    const handleExport = () => {
        const success = exportData();
        if (success) {
            setLastExportDate(new Date().toISOString());
        }
    };

    return (
        <Card className="card-professional border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                        {daysSinceExport === null ? 'No backup found' : `Last backup ${daysSinceExport} days ago`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Your data is stored locally. Export regularly to avoid data loss.
                    </p>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl gap-1.5 flex-shrink-0" onClick={handleExport}>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Backup</span>
                </Button>
            </CardContent>
        </Card>
    );
}

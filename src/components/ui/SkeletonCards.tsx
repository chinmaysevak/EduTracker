// ============================================
// Reusable Skeleton Loaders for Dashboard Cards
// ============================================
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardCardSkeleton() {
    return (
        <Card className="card-modern border-0">
            <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
        </Card>
    );
}

export function WidgetSkeleton({ height = 'h-[200px]' }: { height?: string }) {
    return (
        <Card className="card-modern border-0">
            <CardHeader className="pb-2">
                <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="p-5">
                <Skeleton className={`w-full ${height} rounded-xl`} />
            </CardContent>
        </Card>
    );
}

export function StatCardSkeleton() {
    return (
        <Card className="card-modern border-0">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
            </CardContent>
        </Card>
    );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <Card className="card-modern border-0">
            <CardContent className="p-5 space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-6 w-16 rounded-lg" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

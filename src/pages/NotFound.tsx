// ============================================
// Custom 404 Not Found Page
// ============================================
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="text-center max-w-md space-y-6">
                {/* Animated 404 */}
                <div className="relative">
                    <h1 className="text-[120px] sm:text-[160px] font-black leading-none gradient-text select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Page Not Found</h2>
                    <p className="text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2 rounded-xl h-12">
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} className="btn-gradient gap-2 rounded-xl h-12">
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}

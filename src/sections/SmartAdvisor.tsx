import { ProductivityAnalytics } from '@/components/ProductivityAnalytics';
import { Sparkles } from 'lucide-react';

export default function SmartAdvisor() {
  return (
    <div className="settings-bg h-full flex flex-col w-full px-1 min-h-[calc(100vh-8rem)]">
      {/* ── Premium Hero Header ── */}
      <div className="section-hero mesh-gradient mb-6" data-tutorial="advisor-hero">
        <div className="orb orb-1" />
        <div className="orb orb-3" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="section-hero-icon">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display section-hero-title">Smart Advisor</h1>
              <p className="text-muted-foreground text-sm mt-2">Personalized insights based on your study patterns and progress.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto pb-8" data-tutorial="advisor-analytics">
        <ProductivityAnalytics />
      </div>
    </div>
  );
}

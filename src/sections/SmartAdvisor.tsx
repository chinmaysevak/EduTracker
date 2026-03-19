import { ProductivityAnalytics } from '@/components/ProductivityAnalytics';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function SmartAdvisor() {
  return (
    <div className="settings-bg h-full flex flex-col w-full px-1 min-h-[calc(100vh-8rem)]">
      {/* ── Premium Hero Header ── */}
      <div className="section-hero mesh-gradient mb-6">
        <div className="orb orb-1" />
        <div className="orb orb-3" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Insights & Strategy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display gradient-text-vibrant mb-1.5 flex items-center gap-2">
              <Lightbulb className="w-7 h-7 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              Smart Advisor
            </h1>
            <p className="text-muted-foreground text-sm">Actionable AI insights based on your study patterns and progress. 🧠</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto pb-8">
        <ProductivityAnalytics />
      </div>
    </div>
  );
}

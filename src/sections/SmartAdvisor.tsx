import { SmartAdvisor } from '@/components/SmartAdvisor';
import { WeeklyPlanGenerator } from '@/components/WeeklyPlanGenerator';
import { ProductivityAnalytics } from '@/components/ProductivityAnalytics';
import { AiChatAdvisor } from '@/components/AiChatAdvisor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function SmartAdvisorPage() {
  const [activeTab, setActiveTab] = useState('ai-chat');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Smart Academic Advisor</h2>
          <p className="text-muted-foreground text-sm">
            AI-powered insights and personalized study recommendations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        defaultValue="ai-chat"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="flex w-full h-11 p-1 bg-muted/50 rounded-2xl md:w-[520px]">
          <TabsTrigger value="ai-chat" className="flex-1 gap-2 rounded-xl">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </TabsTrigger>
          <TabsTrigger value="advisor" className="flex-1 gap-2 rounded-xl">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex-1 gap-2 rounded-xl">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Planner</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 gap-2 rounded-xl">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Productivity</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="ai-chat" className="mt-0">
            <AiChatAdvisor />
          </TabsContent>
          <TabsContent value="advisor" className="mt-0">
            <SmartAdvisor />
          </TabsContent>
          <TabsContent value="planner" className="mt-0">
            <WeeklyPlanGenerator />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <ProductivityAnalytics />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

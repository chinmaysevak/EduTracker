import { SmartAdvisor } from '@/components/SmartAdvisor';
import { WeeklyPlanGenerator } from '@/components/WeeklyPlanGenerator';
import { ProductivityAnalytics } from '@/components/ProductivityAnalytics';
import { Tabs, Tab } from '@heroui/react';
import { Brain, Calendar, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function SmartAdvisorPage() {
  const [activeTab, setActiveTab] = useState('advisor');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Smart Academic Advisor</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered insights and personalized study recommendations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-transparent",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-violet-600"
        }}
      >
        <Tab 
          key="advisor" 
          title={
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>Daily Advisor</span>
            </div>
          }
        />
        <Tab 
          key="planner" 
          title={
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Study Planner</span>
            </div>
          }
        />
        <Tab 
          key="analytics" 
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Productivity</span>
            </div>
          }
        />
      </Tabs>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'advisor' && <SmartAdvisor />}
        {activeTab === 'planner' && <WeeklyPlanGenerator />}
        {activeTab === 'analytics' && <ProductivityAnalytics />}
      </div>
    </div>
  );
}

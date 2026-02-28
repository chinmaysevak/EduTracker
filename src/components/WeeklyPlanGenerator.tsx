import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { Calendar, Clock, Target, Edit3, Save } from 'lucide-react';
import { useSmartAcademicAssistant } from '@/hooks/useSmartAcademicAssistant';
import { useState } from 'react';

export function WeeklyPlanGenerator() {
  const { 
    weeklyPlan, 
    generateWeeklyPlan, 
    saveWeeklyPlan, 
    savedPlans 
  } = useSmartAcademicAssistant();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(weeklyPlan);

  const handleGeneratePlan = () => {
    generateWeeklyPlan();
    setIsEditing(false);
  };

  const handleSavePlan = () => {
    if (editedPlan) {
      saveWeeklyPlan(editedPlan);
      setIsEditing(false);
    }
  };

  const handleEditPlan = () => {
    setEditedPlan(weeklyPlan);
    setIsEditing(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Card className="card-modern border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold">Weekly Study Plan</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleGeneratePlan}
              className="rounded-xl"
            >
              Generate Plan
            </Button>
            {weeklyPlan && !isEditing && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleEditPlan}
                className="rounded-xl"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            {isEditing && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSavePlan}
                className="rounded-xl"
              >
                <Save className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {!weeklyPlan ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No weekly plan generated yet</p>
            <Button 
              onClick={handleGeneratePlan}
              className="mt-4 btn-gradient rounded-xl"
            >
              Generate Weekly Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">{weeklyPlan.totalEstimatedHours}</div>
                <div className="text-sm text-muted-foreground">Total Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(weeklyPlan.dailyPlan).length}</div>
                <div className="text-sm text-muted-foreground">Days Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{weeklyPlan.weeklyGoals.length}</div>
                <div className="text-sm text-muted-foreground">Weekly Goals</div>
              </div>
            </div>

            {/* Weekly Goals */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                Weekly Goals
              </h4>
              <div className="flex flex-wrap gap-2">
                {weeklyPlan.weeklyGoals.map((goal, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm border border-violet-200"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            {/* Daily Plan */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Daily Schedule
              </h4>
              <div className="space-y-3">
                {Object.entries(weeklyPlan.dailyPlan).map(([date, plan], index) => {
                  const dayIndex = new Date(date).getDay();
                  const dayName = weekDays[dayIndex];
                  
                  return (
                    <div key={date} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dayName}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(plan.priority)}`}>
                            {plan.priority.toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {plan.studyTime}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Subjects: </span>
                          <span className="text-sm text-muted-foreground">
                            {plan.subjects.join(', ')}
                          </span>
                        </div>
                        
                        {plan.tasks.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Tasks: </span>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                              {plan.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

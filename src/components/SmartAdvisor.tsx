import { Card, CardBody, CardHeader } from '@heroui/react';
import { Brain, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useSmartAcademicAssistant } from '@/hooks/useSmartAcademicAssistant';

export function SmartAdvisor() {
  const { 
    recommendations, 
    performanceIndex, 
    riskAssessment
  } = useSmartAcademicAssistant();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily Recommendations */}
      <Card className="lg:col-span-2 card-modern border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold">Focus Today</h3>
          </div>
        </CardHeader>
        <CardBody>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No specific recommendations for today</p>
              <p className="text-sm mt-2">Keep up the good work!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.subject}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{rec.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rec.estimatedTime}
                        </span>
                        <span>{rec.tasks.length} tasks</span>
                      </div>
                      {rec.tasks.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1">Tasks:</p>
                          <ul className="text-xs space-y-1">
                            {rec.tasks.map((task, taskIndex) => (
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
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Performance & Risk Panel */}
      <div className="space-y-6">
        {/* Academic Performance Index */}
        <Card className="card-modern border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Performance Index</h3>
            </div>
          </CardHeader>
          <CardBody>
            {performanceIndex ? (
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getPerformanceColor(performanceIndex.level)}`}>
                  {performanceIndex.overall}/100
                </div>
                <div className={`text-sm font-medium mb-4 ${getPerformanceColor(performanceIndex.level)}`}>
                  {performanceIndex.level.toUpperCase()}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Attendance</span>
                    <span>{performanceIndex.attendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasks</span>
                    <span>{performanceIndex.taskCompletion}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress</span>
                    <span>{performanceIndex.progress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consistency</span>
                    <span>{performanceIndex.studyConsistency}%</span>
                  </div>
                </div>
                {performanceIndex.improvementSuggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium mb-2">Suggestions:</p>
                    <ul className="text-xs space-y-1">
                      {performanceIndex.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="w-1 h-1 rounded-full bg-current opacity-50 mt-1" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Calculating...</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Risk Assessment */}
        <Card className="card-modern border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Risk Level</h3>
            </div>
          </CardHeader>
          <CardBody>
            {riskAssessment ? (
              <div>
                <div className={`text-center p-3 rounded-lg border ${getRiskColor(riskAssessment.level)} mb-4`}>
                  <span className="font-bold uppercase">{riskAssessment.level}</span>
                </div>
                {riskAssessment.warnings.length > 0 && (
                  <div className="space-y-2">
                    {riskAssessment.warnings.map((warning, index) => (
                      <div key={index} className="text-xs p-2 rounded bg-muted">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Assessing...</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

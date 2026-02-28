import { Card, CardBody, CardHeader } from '@heroui/react';
import { TrendingUp, TrendingDown, Minus, Activity, Target, Award } from 'lucide-react';
import { useSmartAcademicAssistant } from '@/hooks/useSmartAcademicAssistant';

export function ProductivityAnalytics() {
  const { productivityMetrics } = useSmartAcademicAssistant();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100 border-green-200';
    if (score >= 70) return 'bg-blue-100 border-blue-200';
    if (score >= 55) return 'bg-yellow-100 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  if (!productivityMetrics) {
    return (
      <Card className="card-modern border-0">
        <CardBody className="p-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Calculating productivity metrics...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* EduScore Overview */}
      <Card className="card-modern border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-semibold">EduScore</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-center">
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(productivityMetrics.eduScore)}`}>
              {productivityMetrics.eduScore}/100
            </div>
            <div className="flex items-center justify-center gap-2 mb-6">
              {getTrendIcon(productivityMetrics.weeklyTrend)}
              <span className="text-sm font-medium capitalize">
                {productivityMetrics.weeklyTrend}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg border border-border">
                <div className="text-2xl font-bold text-blue-600">
                  {productivityMetrics.attendanceRate}%
                </div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
              <div className="text-center p-3 rounded-lg border border-border">
                <div className="text-2xl font-bold text-green-600">
                  {productivityMetrics.taskCompletionRate}%
                </div>
                <div className="text-xs text-muted-foreground">Task Completion</div>
              </div>
              <div className="text-center p-3 rounded-lg border border-border">
                <div className="text-2xl font-bold text-purple-600">
                  {productivityMetrics.consistency}%
                </div>
                <div className="text-xs text-muted-foreground">Consistency</div>
              </div>
              <div className="text-center p-3 rounded-lg border border-border">
                <div className="text-2xl font-bold text-orange-600">
                  {productivityMetrics.studyStreak}
                </div>
                <div className="text-xs text-muted-foreground">Study Streak</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Subject Performance */}
      <Card className="card-modern border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Subject Performance</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {Object.entries(productivityMetrics.subjectPerformance).map(([subject, performance]) => (
              <div key={subject} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getScoreBg(performance.score)}`}>
                    <span className="font-bold text-sm">{performance.score}</span>
                  </div>
                  <div>
                    <div className="font-medium">{subject}</div>
                    <div className="text-xs text-muted-foreground">Performance Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(performance.trend)}
                  <span className="text-sm capitalize">{performance.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-modern border-0">
          <CardHeader className="pb-4">
            <h4 className="font-semibold">Performance Breakdown</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span className={`text-sm font-bold ${getScoreColor(productivityMetrics.attendanceRate)}`}>
                    {productivityMetrics.attendanceRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${productivityMetrics.attendanceRate}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Task Completion</span>
                  <span className={`text-sm font-bold ${getScoreColor(productivityMetrics.taskCompletionRate)}`}>
                    {productivityMetrics.taskCompletionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${productivityMetrics.taskCompletionRate}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Study Consistency</span>
                  <span className={`text-sm font-bold ${getScoreColor(productivityMetrics.consistency)}`}>
                    {productivityMetrics.consistency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${productivityMetrics.consistency}%` }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="card-modern border-0">
          <CardHeader className="pb-4">
            <h4 className="font-semibold">Study Insights</h4>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Study Streak</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {productivityMetrics.studyStreak} days
                </div>
                <div className="text-xs text-blue-700">
                  Keep it going! Consistency is key to success.
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Weekly Trend</span>
                </div>
                <div className="text-lg font-bold text-green-600 capitalize">
                  {productivityMetrics.weeklyTrend}
                </div>
                <div className="text-xs text-green-700">
                  {productivityMetrics.weeklyTrend === 'improving' && 'Great progress! Keep up the momentum.'}
                  {productivityMetrics.weeklyTrend === 'stable' && 'Steady performance. Room for improvement.'}
                  {productivityMetrics.weeklyTrend === 'declining' && 'Time to refocus and get back on track.'}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';
import { AttendanceTrendChart } from '@/components/analytics/AttendanceTrendChart';
import { SubjectComparisonChart } from '@/components/analytics/SubjectComparisonChart';
import { ReadinessScorecard } from '@/components/analytics/ReadinessScorecard';
import { StudyHeatmap } from '@/components/analytics/StudyHeatmap';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useSubjects } from '@/hooks/useData';

export default function Analytics() {
  const { attendanceTrends, subjectComparison, studyHeatmap } = useAnalyticsData();
  const { subjects } = useSubjects();

  // Check if there's any data to display
  const hasData = subjects.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold gradient-text">Analytics</h2>
            <p className="text-muted-foreground mt-1">Visualize your academic performance and patterns</p>
          </div>
        </div>

        <Card className="card-modern border-0">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Data Available</h3>
              <p className="text-muted-foreground">
                Start by adding subjects and marking attendance to see your analytics here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Analytics</h2>
          <p className="text-muted-foreground mt-1">Visualize your academic performance and patterns</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">{subjectComparison.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Subjects</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {studyHeatmap.filter(d => d.intensity > 0).length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Active Study Days</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {subjectComparison.length > 0
                ? Math.max(...subjectComparison.map(s => s.percentage)).toFixed(1)
                : '0'
              }%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Best Subject</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {attendanceTrends.reduce((acc, trend) => acc + trend.data.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Data Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Scorecard (NEW) */}
        <ReadinessScorecard />

        {/* Attendance Trends */}
        <Card className="card-modern border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Attendance Trends</CardTitle>
            <p className="text-sm text-muted-foreground">Track attendance patterns over time</p>
          </CardHeader>
          <CardContent>
            {attendanceTrends.length > 0 ? (
              <AttendanceTrendChart data={attendanceTrends} />
            ) : (
              <div className="flex items-center justify-center h-80 text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Comparison */}
        <Card className="card-modern border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Subject Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Compare attendance across subjects</p>
          </CardHeader>
          <CardContent>
            {subjectComparison.length > 0 ? (
              <SubjectComparisonChart data={subjectComparison} />
            ) : (
              <div className="flex items-center justify-center h-80 text-muted-foreground">
                No subject data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Heatmap */}
      <Card className="card-modern border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Study Activity Heatmap</CardTitle>
          <p className="text-sm text-muted-foreground">Visualize study consistency patterns</p>
        </CardHeader>
        <CardContent>
          <StudyHeatmap data={studyHeatmap} />
        </CardContent>
      </Card>
    </div>
  );
}

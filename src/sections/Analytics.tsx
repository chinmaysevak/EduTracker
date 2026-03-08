import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="settings-bg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Analytics</h2>
            <p className="text-muted-foreground text-sm">Visualize your academic performance and patterns</p>
          </div>
        </div>

        <Card className="card-modern border-0">
          <CardContent className="p-8 text-center">
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
    <div className="settings-bg space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Analytics</h2>
          <p className="text-muted-foreground text-sm">Visualize your academic performance and patterns</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="card-modern card-hover border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md">
                <i className="fa-solid fa-layer-group text-white"></i>
              </div>
            </div>
            <p className="text-2xl font-bold">{subjectComparison.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Subjects</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                <i className="fa-solid fa-calendar-check text-white"></i>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {studyHeatmap.filter(d => d.intensity > 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Active Study Days</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <i className="fa-solid fa-star text-white"></i>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {subjectComparison.length > 0
                ? Math.max(...subjectComparison.map(s => s.percentage)).toFixed(1)
                : '0'
              }%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Best Subject</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-hover border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-md">
                <i className="fa-solid fa-chart-line text-white"></i>
              </div>
            </div>
            <p className="text-2xl font-bold">
              {attendanceTrends.reduce((acc, trend) => acc + trend.data.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Data Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
              <div className="flex items-center justify-center h-56 text-muted-foreground">
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
              <div className="flex items-center justify-center h-56 text-muted-foreground">
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

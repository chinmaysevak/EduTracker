import { format, eachDayOfInterval, startOfWeek } from 'date-fns';

interface StudyHeatmapProps {
  data: {
    date: string;
    count: number;
    intensity: number;
  }[];
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  // Generate last 12 weeks of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 84); // 12 weeks back

  const weeks = eachDayOfInterval({ start: startDate, end: endDate })
    .filter(day => day.getDay() !== 0 && day.getDay() !== 6) // Exclude weekends
    .reduce((acc: any[], day) => {
      const weekStart = startOfWeek(day, { weekStartsOn: 1 });
      const weekIndex = acc.findIndex(week => week.start.getTime() === weekStart.getTime());
      
      if (weekIndex === -1) {
        acc.push({ start: weekStart, days: [] });
      }
      
      const currentWeek = weekIndex === -1 ? acc[acc.length - 1] : acc[weekIndex];
      currentWeek.days.push(day);
      
      return acc;
    }, []);

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-gray-100',
      'bg-violet-200',
      'bg-violet-300',
      'bg-violet-400',
      'bg-violet-500',
      'bg-violet-600',
    ];
    return colors[Math.min(intensity, 5)];
  };

  const getDataForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = data.find(d => d.date === dateStr);
    return dayData || { count: 0, intensity: 0 };
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Study Activity Heatmap (Last 12 Weeks)</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground w-8">
                {format(week.start, 'MMM d')}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const currentDay = week.days[dayIndex];
                  if (!currentDay) {
                    return <div key={dayIndex} className="w-3 h-3" />;
                  }

                  const dayData = getDataForDate(currentDay);
                  const isToday = format(currentDay, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(dayData.intensity)} ${
                        isToday ? 'ring-1 ring-violet-600 ring-offset-1' : ''
                      }`}
                      title={`${format(currentDay, 'MMM d, yyyy')}: ${dayData.count} study activities`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

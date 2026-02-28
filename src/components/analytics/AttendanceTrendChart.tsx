import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useAttendance } from '@/hooks/useData';

export function AttendanceTrendChart() {
  const { attendanceData } = useAttendance();

  const data = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecord = attendanceData.find(rec => rec.date === dateStr);
      let percentage = null;

      if (dayRecord) {
        const subjects = dayRecord.subjects || {};
        const extra = dayRecord.extraClasses || [];

        let present = 0;
        let total = 0;

        Object.values(subjects).forEach(status => {
          if (status) {
            total++;
            if (status === 'present') present++;
          }
        });

        extra.forEach(ec => {
          if (ec.status) {
            total++;
            if (ec.status === 'present') present++;
          }
        });

        if (total > 0) {
          percentage = Math.round((present / total) * 100);
        }
      }

      days.push({
        day: dayName,
        percentage: percentage ?? 0,
        originalDate: dateStr,
        hasData: percentage !== null
      });
    }
    return days;
  }, [attendanceData]);

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {label}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {dataPoint.hasData ? `${dataPoint.percentage}%` : 'No classes'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorAttendance)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

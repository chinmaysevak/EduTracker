import { useMemo } from 'react';
import { useStudentStore } from '@/context/StudentContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function SmallProgressChart() {
    const { subjects, syllabus } = useStudentStore();

    const chartData = useMemo(() => {
        // Only show top 5 subjects to keep it clean
        return subjects.subjects.slice(0, 5).map(subject => {
            const p = syllabus.getSubjectProgress(subject.id);
            return {
                name: subject.name.length > 10 ? subject.name.substring(0, 10) + '...' : subject.name,
                Teacher: p.teacher,
                Student: p.student
            };
        });
    }, [subjects.subjects, syllabus]);

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-muted/20 rounded-xl">
                Add subjects to see chart
            </div>
        );
    }

    return (
        <div className="w-full h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    barGap={2}
                    barSize={12}
                >
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value}%`, undefined]}
                    />
                    <Bar dataKey="Teacher" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Student" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

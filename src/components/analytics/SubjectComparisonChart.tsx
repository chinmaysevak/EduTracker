import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface SubjectComparisonChartProps {
    data: {
        subjectId: string;
        subjectName: string;
        percentage: number;
        present: number;
        total: number;
    }[];
}

const COLORS = [
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
];

export function SubjectComparisonChart({ data }: SubjectComparisonChartProps) {
    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="subjectName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const dataPoint = payload[0].payload;
                                return (
                                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                                        <p className="font-semibold mb-1">{label}</p>
                                        <p className="text-sm text-foreground">
                                            Attendance: <span className="font-bold">{dataPoint.percentage}%</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {dataPoint.present}/{dataPoint.total} classes
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

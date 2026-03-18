'use client';

import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { HorizonAnalysisDataPoint } from '@/lib/types';
import styles from './HorizonChart.module.css';

interface Props {
    data: HorizonAnalysisDataPoint[];
    horizon: 't1' | 't2' | 't3' | 't4' | 't5';
}

interface ChartPoint {
    date: string;
    forecast: number | null;
    actual: number | null;
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number | null; color: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            {payload.map(p => (
                <div key={p.name} className={styles.tooltipRow} style={{ color: p.color }}>
                    {p.name}: <strong>{p.value !== null ? p.value.toFixed(4) : 'N/A'}</strong>
                </div>
            ))}
        </div>
    );
};

export default function HorizonChart({ data, horizon }: Props) {
    const forecastKey = `${horizon}_forecast` as const;
    const actualKey = `${horizon}_actual` as const;

    const chartData: ChartPoint[] = data.map(point => ({
        date: format(parseISO(point.created_date), 'MMM dd'),
        forecast: point[forecastKey] as number,
        actual: point[actualKey] as number | null,
    }));

    return (
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={chartData} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#1a2540" strokeDasharray="3 6" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                        width={62}
                        domain={['auto', 'auto']}
                        tickFormatter={v => v.toFixed(0)}
                        label={{
                            value: 'LKR / USD',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#475569',
                            fontSize: 10,
                            dx: -4,
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        iconType="line"
                        formatter={(value) => (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                {value === 'forecast' ? `${horizon.toUpperCase()} Forecast` : `${horizon.toUpperCase()} Actual`}
                            </span>
                        )}
                    />

                    {/* Forecast line */}
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="forecast"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6' }}
                        connectNulls={true}
                    />

                    {/* Actual line */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="actual"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        strokeDasharray="5 4"
                        dot={false}
                        activeDot={{ r: 4, fill: '#ef4444' }}
                        connectNulls={true}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

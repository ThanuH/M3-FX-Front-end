'use client';

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { ForecastResponse } from '@/lib/types';

interface Props {
    forecast: ForecastResponse;
}

interface ChartPoint {
    date: string;
    forecastMedian: number;
    forecastUpper: number;
    forecastLower: number;
    confidenceBand: [number, number];
    isFirst?: boolean;
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number | number[] | null; dataKey: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;

    const median = payload.find(p => p.dataKey === 'forecastMedian')?.value as number | undefined;
    const band = payload.find(p => p.dataKey === 'confidenceBand')?.value as number[] | undefined;

    return (
        <div style={{
            background: '#0f172a',
            border: '1px solid #1a2540',
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
        }}>
            <div style={{ color: '#64748b', marginBottom: 6, fontSize: 10 }}>{label}</div>
            {typeof median === 'number' && (
                <div style={{ color: '#8b5cf6' }}>
                    Predicted Median: <strong>{median.toFixed(4)}</strong>
                </div>
            )}
            {Array.isArray(band) && band.length === 2 && (
                <>
                    <div style={{ color: '#f59e0b' }}>
                        Upper Bound (80%): <strong>{band[1].toFixed(4)}</strong>
                    </div>
                    <div style={{ color: '#22d3ee' }}>
                        Lower Bound (80%): <strong>{band[0].toFixed(4)}</strong>
                    </div>
                </>
            )}
        </div>
    );
};

export default function ForecastBandChart({ forecast }: Props) {
    const intervals = [forecast.t1, forecast.t2, forecast.t3, forecast.t4, forecast.t5];

    // Include the last known price as the anchor point
    const anchorDate = format(parseISO(forecast.last_known_date), 'MMM dd');

    const anchorPoint: ChartPoint = {
        date: anchorDate,
        forecastMedian: forecast.last_known_price,
        forecastUpper: forecast.last_known_price,
        forecastLower: forecast.last_known_price,
        confidenceBand: [forecast.last_known_price, forecast.last_known_price],
        isFirst: true,
    };

    const forecastPoints: ChartPoint[] = forecast.forecast_dates.map((d, i) => ({
        date: format(parseISO(d), 'MMM dd'),
        forecastMedian: intervals[i].median,
        forecastUpper: intervals[i].upper,
        forecastLower: intervals[i].lower,
        confidenceBand: [intervals[i].lower, intervals[i].upper],
    }));

    const chartData = [anchorPoint, ...forecastPoints];

    const allValues = chartData.flatMap(p => [p.forecastMedian, p.forecastUpper, p.forecastLower])
        .filter(v => Number.isFinite(v));

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const spread = max - min;
    const padding = Math.max(spread * 0.4, 0.5);
    const yDomain: [number, number] = [min - padding, max + padding];

    return (
        <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="fcBandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                </defs>

                <CartesianGrid stroke="#1a2540" strokeDasharray="3 6" vertical={false} />

                <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                />

                <YAxis
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                    domain={yDomain}
                    tickFormatter={v => v.toFixed(2)}
                    label={{ value: 'LKR / USD', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10, dx: -4 }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                    formatter={(value) => (
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>
                    )}
                />

                {/* Anchor reference line at last known price */}
                <ReferenceLine
                    y={forecast.last_known_price}
                    stroke="#475569"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{ value: 'Last Known', position: 'insideTopLeft', fill: '#475569', fontSize: 9 }}
                />

                {/* 80% Confidence Band */}
                <Area
                    type="monotone"
                    dataKey="confidenceBand"
                    name="80% Confidence Band"
                    stroke="none"
                    fill="url(#fcBandGrad)"
                    connectNulls
                    isAnimationActive={false}
                    legendType="rect"
                />

                {/* Upper Bound dashed */}
                <Line
                    type="monotone"
                    dataKey="forecastUpper"
                    name="Upper Bound (80%)"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    activeDot={{ r: 4, fill: '#f59e0b' }}
                    connectNulls
                    isAnimationActive={false}
                />

                {/* Lower Bound dashed */}
                <Line
                    type="monotone"
                    dataKey="forecastLower"
                    name="Lower Bound (80%)"
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                    activeDot={{ r: 4, fill: '#22d3ee' }}
                    connectNulls
                    isAnimationActive={false}
                />

                {/* Predicted Median solid line with dots */}
                <Line
                    type="monotone"
                    dataKey="forecastMedian"
                    name="Predicted Median"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#22c55e', stroke: '#111827', strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: '#22c55e' }}
                    connectNulls
                    isAnimationActive={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

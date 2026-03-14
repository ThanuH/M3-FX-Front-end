'use client';

import {
    ComposedChart,
    Area,
    Line,
    XAxis, YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { PricePoint, ForecastResponse } from '@/lib/types';

interface Props {
    history: PricePoint[];
    forecast: ForecastResponse | null;
}

interface ChartPoint {
    date: string;
    historical?: number;
    forecast?: number;
    bridge?: number;
}

// Custom dot for forecast markers
function ForecastDot(props: {
    cx?: number; cy?: number; payload?: ChartPoint;
}) {
    const { cx, cy, payload } = props;
    if (!payload?.forecast || cx === undefined || cy === undefined) return null;
    return (
        <g>
            <circle cx={cx} cy={cy} r={6} fill="#8b5cf6" stroke="#fff" strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={10} fill="rgba(139,92,246,0.15)" />
        </g>
    );
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#111827',
            border: '1px solid #1a2540',
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
        }}>
            <div style={{ color: '#64748b', marginBottom: 6, fontSize: 10 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color }}>
                    {p.name}: <strong>{p.value?.toFixed(4)}</strong>
                </div>
            ))}
        </div>
    );
};

export default function ForecastChart({ history, forecast }: Props) {
    // Build unified chart data
    const histPoints: ChartPoint[] = history.map(p => ({
        date: format(parseISO(p.date), 'MMM dd'),
        historical: p.price,
    }));

    let chartData: ChartPoint[] = histPoints;

    if (forecast) {
        const lastHist = history[history.length - 1];
        // Bridge point
        const bridgePt: ChartPoint = {
            date: format(parseISO(lastHist.date), 'MMM dd'),
            historical: lastHist.price,
            bridge: lastHist.price,
        };
        chartData = [
            ...histPoints.slice(0, -1),
            bridgePt,
            ...forecast.forecast_dates.map((d, i) => ({
                date: format(parseISO(d), 'MMM dd'),
                forecast: forecast.forecasted_prices[i],
                bridge: i === 0 ? forecast.forecasted_prices[i] : undefined,
            })),
        ];
    }

    return (
        <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={chartData} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                    label={{ value: 'LKR / USD', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10, dx: -4 }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Historical area */}
                <Area
                    type="monotone"
                    dataKey="historical"
                    name="Historical"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#histGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#22c55e' }}
                />

                {/* Bridge dashed */}
                <Line
                    type="monotone"
                    dataKey="bridge"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    legendType="none"
                />

                {/* Forecast line */}
                {forecast && (
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="5-Day Forecast"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        strokeDasharray="7 4"
                        dot={<ForecastDot />}
                        activeDot={{ r: 5, fill: '#8b5cf6' }}
                    />
                )}

                {/* Reference line at last known price */}
                {forecast && (
                    <ReferenceLine
                        y={forecast.last_known_price}
                        stroke="#334155"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
}

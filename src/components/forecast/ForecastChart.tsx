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
    medianForecast?: number;
    lowerBound?: number;
    upperBound?: number;
    bridge?: number;
}

// Custom dot for median forecast markers
function MedianDot(props: {
    cx?: number; cy?: number; payload?: ChartPoint;
}) {
    const { cx, cy, payload } = props;
    if (!payload?.medianForecast || cx === undefined || cy === undefined) return null;
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={1.5} />
            <circle cx={cx} cy={cy} r={9} fill="rgba(139,92,246,0.1)" />
        </g>
    );
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;
    
    // Filter to show only relevant data
    const visibleItems = payload.filter(p => 
        p.dataKey === 'historical' || 
        p.dataKey === 'medianForecast' || 
        p.dataKey === 'lowerBound' || 
        p.dataKey === 'upperBound'
    );
    
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
            {visibleItems.map(p => {
                let displayName = p.name;
                if (p.dataKey === 'medianForecast') displayName = 'Median Forecast';
                if (p.dataKey === 'lowerBound') displayName = 'Lower Bound (80%)';
                if (p.dataKey === 'upperBound') displayName = 'Upper Bound (80%)';
                
                return (
                    <div key={p.dataKey} style={{ color: p.color }}>
                        {displayName}: <strong>{p.value?.toFixed(4)}</strong>
                    </div>
                );
            })}
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
        
        // Extract forecast intervals for each day
        const intervals = [
            forecast.t1,
            forecast.t2,
            forecast.t3,
            forecast.t4,
            forecast.t5,
        ];
        
        chartData = [
            ...histPoints.slice(0, -1),
            bridgePt,
            ...forecast.forecast_dates.map((d, i) => ({
                date: format(parseISO(d), 'MMM dd'),
                medianForecast: intervals[i].median,
                lowerBound: intervals[i].lower,
                upperBound: intervals[i].upper,
                bridge: i === 0 ? intervals[i].median : undefined,
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
                    <linearGradient id="upperBandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="lowerBandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.05} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.15} />
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
                    isAnimationActive={false}
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
                    isAnimationActive={false}
                />

                {/* Fan Chart - Upper Confidence Band */}
                {forecast && (
                    <Area
                        type="monotone"
                        dataKey="upperBound"
                        name="Upper Bound (80% CI)"
                        stroke="#a78bfa"
                        strokeWidth={1.5}
                        strokeOpacity={0.6}
                        fill="url(#upperBandGrad)"
                        dot={false}
                        isAnimationActive={false}
                    />
                )}

                {/* Fan Chart - Lower Confidence Band */}
                {forecast && (
                    <Area
                        type="monotone"
                        dataKey="lowerBound"
                        name="Lower Bound (80% CI)"
                        stroke="#a78bfa"
                        strokeWidth={1.5}
                        strokeOpacity={0.6}
                        fill="url(#lowerBandGrad)"
                        dot={false}
                        isAnimationActive={false}
                    />
                )}

                {/* Median Forecast Line - on top */}
                {forecast && (
                    <Line
                        type="monotone"
                        dataKey="medianForecast"
                        name="Median Forecast"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        strokeDasharray="6 3"
                        dot={<MedianDot />}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                        isAnimationActive={false}
                    />
                )}

                {/* Reference line at last known price */}
                {forecast && (
                    <ReferenceLine
                        y={forecast.last_known_price}
                        stroke="#475569"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
}

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
    bridge?: number;
    candleOpen?: number;
    candleClose?: number;
    candleHigh?: number;
    candleLow?: number;
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        dataKey: string;
        payload?: ChartPoint;
    }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload;
    const rows: Array<{ label: string; value: number; color: string }> = [];

    if (typeof point?.historical === 'number') {
        rows.push({ label: 'Historical', value: point.historical, color: '#22c55e' });
    }
    if (typeof point?.candleOpen === 'number') {
        rows.push({ label: 'Open', value: point.candleOpen, color: '#60a5fa' });
    }
    if (typeof point?.candleClose === 'number') {
        rows.push({ label: 'Close (Median)', value: point.candleClose, color: '#8b5cf6' });
    }
    if (typeof point?.candleHigh === 'number') {
        rows.push({ label: 'High (Upper)', value: point.candleHigh, color: '#a78bfa' });
    }
    if (typeof point?.candleLow === 'number') {
        rows.push({ label: 'Low (Lower)', value: point.candleLow, color: '#f472b6' });
    }
    
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
            {rows.map(row => {
                return (
                    <div key={row.label} style={{ color: row.color }}>
                        {row.label}: <strong>{row.value.toFixed(4)}</strong>
                    </div>
                );
            })}
            {rows.length === 0 && (
                <div style={{ color: '#94a3b8' }}>No value for this point</div>
            )}
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
            ...forecast.forecast_dates.map((d, i) => {
                const prevClose = i === 0 ? forecast.last_known_price : intervals[i - 1].median;
                const close = intervals[i].median;
                return {
                    date: format(parseISO(d), 'MMM dd'),
                    candleOpen: prevClose,
                    candleClose: close,
                    candleHigh: intervals[i].upper,
                    candleLow: intervals[i].lower,
                    bridge: i === 0 ? close : undefined,
                };
            }),
        ];
    }

    // Calculate a stable Y domain with a small padding.
    const allValues = chartData.flatMap(p => [
        p.historical,
        p.candleOpen,
        p.candleClose,
        p.candleHigh,
        p.candleLow,
    ])
        .filter((v): v is number => typeof v === 'number' && isFinite(v));
    
    const yDomain: [number, number] | ['auto', 'auto'] = (() => {
        if (!allValues.length) return ['auto', 'auto'];
        
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        const spread = max - min;
        const padding = Math.max(spread * 0.1, 0.1);
        return [min - padding, max + padding];
    })();

    return (
        <>
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
                    domain={yDomain}
                    allowDataOverflow
                    tickFormatter={v => v.toFixed(2)}
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

                {/* Hidden lines so tooltip includes OHLC values for forecast points */}
                {forecast && (
                    <>
                        <Line dataKey="candleOpen" name="Open" stroke="transparent" dot={false} activeDot={false} legendType="none" isAnimationActive={false} />
                        <Line dataKey="candleClose" name="Close" stroke="transparent" dot={false} activeDot={false} legendType="none" isAnimationActive={false} />
                        <Line dataKey="candleHigh" name="High" stroke="transparent" dot={false} activeDot={false} legendType="none" isAnimationActive={false} />
                        <Line dataKey="candleLow" name="Low" stroke="transparent" dot={false} activeDot={false} legendType="none" isAnimationActive={false} />
                    </>
                )}

                {/* Forecast candlesticks (wick + body) */}
                {forecast && forecast.forecast_dates.map((d, i) => {
                    const dateLabel = format(parseISO(d), 'MMM dd');
                    const interval = [forecast.t1, forecast.t2, forecast.t3, forecast.t4, forecast.t5][i];
                    const open = i === 0 ? forecast.last_known_price : [forecast.t1, forecast.t2, forecast.t3, forecast.t4, forecast.t5][i - 1].median;
                    const close = interval.median;
                    const bullish = close >= open;
                    const candleColor = bullish ? '#22c55e' : '#ef4444';

                    return (
                        <>
                            <ReferenceLine
                                key={`${dateLabel}-wick`}
                                segment={[
                                    { x: dateLabel, y: interval.lower },
                                    { x: dateLabel, y: interval.upper },
                                ]}
                                stroke={candleColor}
                                strokeWidth={2}
                            />
                            <ReferenceLine
                                key={`${dateLabel}-body`}
                                segment={[
                                    { x: dateLabel, y: open },
                                    { x: dateLabel, y: close },
                                ]}
                                stroke={candleColor}
                                strokeWidth={8}
                            />
                        </>
                    );
                })}

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
        </>
    );
}

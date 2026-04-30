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
    ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { PerformanceResponse } from '@/lib/types';
import styles from './HorizonChart.module.css';
import { useState } from 'react';

interface Props {
    data: PerformanceResponse;
}

interface ChartPoint {
    date: string;
    actual: number | null;
    forecastMedian: number;
    candleOpen: number;
    candleClose: number;
    candleHigh: number;
    candleLow: number;
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number | null;
        color: string;
        payload?: ChartPoint;
    }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload;
    const rows: Array<{ label: string; value: number; color: string }> = [];

    if (typeof point?.actual === 'number') {
        rows.push({ label: 'Actual Price', value: point.actual, color: '#10b981' });
    }
    if (typeof point?.forecastMedian === 'number') {
        rows.push({ label: 'Predicted Median', value: point.forecastMedian, color: '#3b82f6' });
    }
    if (typeof point?.candleHigh === 'number') {
        rows.push({ label: 'Upper Bound (80%)', value: point.candleHigh, color: '#f59e0b' });
    }
    if (typeof point?.candleLow === 'number') {
        rows.push({ label: 'Lower Bound (80%)', value: point.candleLow, color: '#22d3ee' });
    }

    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            {rows.map(row => (
                <div key={row.label} className={styles.tooltipRow} style={{ color: row.color }}>
                    {row.label}: <strong>{row.value.toFixed(4)}</strong>
                </div>
            ))}
        </div>
    );
};

export default function HorizonChart({ data }: Props) {
    const [selectedHorizon, setSelectedHorizon] = useState<number>(1);

    // Get comparison data for selected horizon
    const horizonData = data.records
        .flatMap(record =>
            record.comparisons
                .filter(comp => comp.horizon === selectedHorizon)
                .map(comp => ({
                    ...comp,
                    created_date: record.created_date,
                }))
        )
        .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());

    const chartData: ChartPoint[] = horizonData.map((point, idx) => {
        const previousMedian = idx === 0
            ? point.forecast_price.median
            : horizonData[idx - 1].forecast_price.median;

        return {
            date: format(parseISO(point.created_date), 'MMM dd'),
            actual: point.actual_price,
            forecastMedian: point.forecast_price.median,
            candleOpen: previousMedian,
            candleClose: point.forecast_price.median,
            candleHigh: point.forecast_price.upper,
            candleLow: point.forecast_price.lower,
        };
    });

    const numericValues = chartData.flatMap(point => [
        point.actual,
        point.candleOpen,
        point.candleClose,
        point.candleHigh,
        point.candleLow,
    ])
        .filter((value): value is number => value !== null && Number.isFinite(value));

    const yDomain: [number, number] | ['auto', 'auto'] = (() => {
        if (!numericValues.length) {
            return ['auto', 'auto'];
        }

        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const spread = max - min;
        const padding = Math.max(spread * 0.22, 0.35);

        return [min - padding, max + padding];
    })();

    // Calculate error metrics for selected horizon
    const errorMetrics = (() => {
        const actuals = chartData.filter(p => p.actual !== null);
        if (!actuals.length) return null;

        const mae = actuals.reduce((sum, p) => sum + Math.abs(p.forecastMedian - p.actual!), 0) / actuals.length;
        const mape = actuals.reduce((sum, p) => sum + Math.abs((p.forecastMedian - p.actual!) / p.actual!), 0) / actuals.length;

        return { mae, mape };
    })();

    return (
        <>
            {/* Horizon selector */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(h => (
                    <button
                        key={h}
                        onClick={() => setSelectedHorizon(h)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 6,
                            border: selectedHorizon === h ? '2px solid #8b5cf6' : '1px solid #1a2540',
                            background: selectedHorizon === h ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: selectedHorizon === h ? '#8b5cf6' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: selectedHorizon === h ? 600 : 400,
                            fontSize: 12,
                            transition: 'all 0.2s',
                        }}
                    >
                        Horizon {h}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart data={chartData} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                            tickFormatter={v => v.toFixed(0)}
                            label={{ value: 'LKR / USD', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10, dx: -4 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Hidden line keeps predicted series in legend */}
                        <Line
                            type="monotone"
                            dataKey="forecastMedian"
                            name="Predicted (Candlestick)"
                            stroke="#3b82f6"
                            strokeWidth={0}
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                        />

                        {/* Bound markers to make upper/lower limits easier to read */}
                        <Line
                            type="monotone"
                            dataKey="candleHigh"
                            name="Upper Bound (80%)"
                            stroke="transparent"
                            strokeWidth={0}
                            dot={{ r: 3, fill: '#f59e0b', stroke: '#111827', strokeWidth: 1 }}
                            activeDot={{ r: 5, fill: '#f59e0b' }}
                            connectNulls
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="candleLow"
                            name="Lower Bound (80%)"
                            stroke="transparent"
                            strokeWidth={0}
                            dot={{ r: 3, fill: '#22d3ee', stroke: '#111827', strokeWidth: 1 }}
                            activeDot={{ r: 5, fill: '#22d3ee' }}
                            connectNulls
                            isAnimationActive={false}
                        />

                        {/* Predicted candlesticks */}
                        {chartData.flatMap((point, idx) => {
                            const bullish = point.candleClose >= point.candleOpen;
                            const bodyColor = bullish ? '#22c55e' : '#ef4444';
                            const wickColor = '#93c5fd';

                            return [
                                <ReferenceLine
                                    key={`${point.date}-${idx}-pred-wick`}
                                    segment={[
                                        { x: point.date, y: point.candleLow },
                                        { x: point.date, y: point.candleHigh },
                                    ]}
                                    stroke={wickColor}
                                    strokeWidth={2}
                                />,
                                <ReferenceLine
                                    key={`${point.date}-${idx}-pred-body`}
                                    segment={[
                                        { x: point.date, y: point.candleOpen },
                                        { x: point.date, y: point.candleClose },
                                    ]}
                                    stroke={bodyColor}
                                    strokeWidth={8}
                                />,
                            ];
                        })}

                        {/* Actual line */}
                        <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual Price"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6, fill: '#10b981' }}
                            connectNulls
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Error metrics */}
            {errorMetrics && (
                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    <div style={{
                        padding: 12,
                        background: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: 6,
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Mean Absolute Error</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#3b82f6' }}>{errorMetrics.mae.toFixed(4)}</div>
                    </div>
                    <div style={{
                        padding: 12,
                        background: 'rgba(16, 185, 129, 0.05)',
                        borderRadius: 6,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Mean Absolute % Error</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>{(errorMetrics.mape * 100).toFixed(2)}%</div>
                    </div>
                </div>
            )}
        </>
    );
}

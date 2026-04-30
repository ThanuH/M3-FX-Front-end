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
    forecastUpper: number;
    forecastLower: number;
    // Area uses [lower, upper] as a range
    confidenceBand: [number, number];
}

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number | number[] | null;
        color: string;
        dataKey: string;
    }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;

    const point = payload.find(p => p.dataKey === 'forecastMedian')?.value as number | undefined;
    const actual = payload.find(p => p.dataKey === 'actual')?.value as number | undefined;
    const band = payload.find(p => p.dataKey === 'confidenceBand')?.value as number[] | undefined;

    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            {typeof actual === 'number' && (
                <div className={styles.tooltipRow} style={{ color: '#10b981' }}>
                    Actual Price: <strong>{actual.toFixed(4)}</strong>
                </div>
            )}
            {typeof point === 'number' && (
                <div className={styles.tooltipRow} style={{ color: '#8b5cf6' }}>
                    Predicted Median: <strong>{point.toFixed(4)}</strong>
                </div>
            )}
            {Array.isArray(band) && band.length === 2 && (
                <>
                    <div className={styles.tooltipRow} style={{ color: '#f59e0b' }}>
                        Upper Bound (80%): <strong>{band[1].toFixed(4)}</strong>
                    </div>
                    <div className={styles.tooltipRow} style={{ color: '#22d3ee' }}>
                        Lower Bound (80%): <strong>{band[0].toFixed(4)}</strong>
                    </div>
                </>
            )}
        </div>
    );
};

export default function HorizonChart({ data }: Props) {
    const [selectedHorizon, setSelectedHorizon] = useState<number>(1);

    // Get comparison data for selected horizon, sorted by forecast date
    const horizonData = data.records
        .flatMap(record =>
            record.comparisons
                .filter(comp => comp.horizon === selectedHorizon)
                .map(comp => ({
                    ...comp,
                    created_date: record.created_date,
                }))
        )
        .sort((a, b) => new Date(a.forecast_date).getTime() - new Date(b.forecast_date).getTime());

    const chartData: ChartPoint[] = horizonData.map(point => ({
        date: format(parseISO(point.forecast_date), 'MMM dd'),
        actual: point.actual_price,
        forecastMedian: point.forecast_price.median,
        forecastUpper: point.forecast_price.upper,
        forecastLower: point.forecast_price.lower,
        confidenceBand: [point.forecast_price.lower, point.forecast_price.upper],
    }));

    const numericValues = chartData.flatMap(p => [
        p.actual,
        p.forecastMedian,
        p.forecastUpper,
        p.forecastLower,
    ]).filter((v): v is number => v !== null && Number.isFinite(v));

    const yDomain: [number, number] | ['auto', 'auto'] = (() => {
        if (!numericValues.length) return ['auto', 'auto'];
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const spread = max - min;
        const padding = Math.max(spread * 0.15, 0.5);
        return [min - padding, max + padding];
    })();

    // Calculate error metrics
    const errorMetrics = (() => {
        const actuals = chartData.filter(p => p.actual !== null);
        if (!actuals.length) return null;
        const mae = actuals.reduce((sum, p) => sum + Math.abs(p.forecastMedian - p.actual!), 0) / actuals.length;
        const mape = actuals.reduce((sum, p) => sum + Math.abs((p.forecastMedian - p.actual!) / p.actual!), 0) / actuals.length;
        return { mae, mape };
    })();

    const tickInterval = Math.max(1, Math.floor(chartData.length / 10));

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
                            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid stroke="#1a2540" strokeDasharray="3 6" vertical={false} />

                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                            axisLine={false}
                            tickLine={false}
                            interval={tickInterval}
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

                        <Legend
                            formatter={(value) => (
                                <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>
                            )}
                        />

                        {/* 80% Confidence Band */}
                        <Area
                            type="monotone"
                            dataKey="confidenceBand"
                            name="80% Confidence Band"
                            stroke="none"
                            fill="url(#confidenceGrad)"
                            connectNulls
                            isAnimationActive={false}
                            legendType="rect"
                        />

                        {/* Upper Bound line */}
                        <Line
                            type="monotone"
                            dataKey="forecastUpper"
                            name="Upper Bound (80%)"
                            stroke="#f59e0b"
                            strokeWidth={1}
                            strokeDasharray="4 3"
                            dot={false}
                            activeDot={{ r: 4, fill: '#f59e0b' }}
                            connectNulls
                            isAnimationActive={false}
                        />

                        {/* Lower Bound line */}
                        <Line
                            type="monotone"
                            dataKey="forecastLower"
                            name="Lower Bound (80%)"
                            stroke="#22d3ee"
                            strokeWidth={1}
                            strokeDasharray="4 3"
                            dot={false}
                            activeDot={{ r: 4, fill: '#22d3ee' }}
                            connectNulls
                            isAnimationActive={false}
                        />

                        {/* Predicted Median line */}
                        <Line
                            type="monotone"
                            dataKey="forecastMedian"
                            name="Predicted Median"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 5, fill: '#8b5cf6' }}
                            connectNulls
                            isAnimationActive={false}
                        />

                        {/* Actual Price line */}
                        <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual Price"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            dot={false}
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

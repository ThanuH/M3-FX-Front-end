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
import type { PerformanceResponse } from '@/lib/types';
import styles from './HorizonChart.module.css';
import { useState } from 'react';

interface Props {
    data: PerformanceResponse;
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

    const chartData: ChartPoint[] = horizonData.map(point => ({
        date: format(parseISO(point.created_date), 'MMM dd'),
        forecast: point.forecast_price.median,
        actual: point.actual_price,
    }));

    const numericValues = chartData.flatMap(point => [point.forecast, point.actual])
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

        const mae = actuals.reduce((sum, p) => sum + Math.abs(p.forecast! - p.actual!), 0) / actuals.length;
        const mape = actuals.reduce((sum, p) => sum + Math.abs((p.forecast! - p.actual!) / p.actual!), 0) / actuals.length;

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
                            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
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

                        {/* Forecast line */}
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            name="Forecast (Median)"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6, fill: '#3b82f6' }}
                            isAnimationActive={false}
                        />

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

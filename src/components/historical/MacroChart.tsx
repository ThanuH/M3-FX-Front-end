'use client';

import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    records: Record<string, number | string | null>[];
    column: string;
    columnLabel: string;
}

const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#111827',
                border: '1px solid #1a2540',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
            }}
        >
            <div style={{ color: '#64748b', marginBottom: 6, fontSize: 10 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color }}>
                    {p.name}:{' '}
                    <strong>
                        {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
                    </strong>
                </div>
            ))}
        </div>
    );
};

const MONTH_SHORT: Record<string, string> = {
    January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr',
    May: 'May', June: 'Jun', July: 'Jul', August: 'Aug',
    September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
};

const MONTH_IDX: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12,
};

function recordSortKey(r: Record<string, number | string | null>): number {
    const yr = Number(r['year'] ?? 0);
    const mo = MONTH_IDX[String(r['month'] ?? '').trim().toLowerCase()] ?? 0;
    return yr * 100 + mo;
}

export default function MacroChart({ records, column, columnLabel }: Props) {
    const chartData = records
        .filter(r => r[column] != null && r['year'] != null)
        .map(r => {
            const yr = String(r['year'] ?? '');
            const mo = String(r['month'] ?? '').trim();
            const dateLabel = mo ? `${MONTH_SHORT[mo] ?? mo} ${yr}` : yr;
            return { date: dateLabel, value: Number(r[column]), _key: recordSortKey(r) };
        })
        .sort((a, b) => a._key - b._key);

    return (
        <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={chartData} margin={{ left: 8, right: 20, top: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="macroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                    width={72}
                    domain={['auto', 'auto']}
                    tickFormatter={v => Number(v).toFixed(2)}
                    label={{
                        value: columnLabel,
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#475569',
                        fontSize: 10,
                        dx: -4,
                    }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="value"
                    name={columnLabel}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#macroGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1.5 }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

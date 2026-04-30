import type { MarketStats } from '@/lib/types';
import styles from './MarketSnapshot.module.css';
import {
    Radio,
    ArrowLeftRight,
    CalendarDays,
    CalendarRange,
    Globe,
    TrendingUp,
    Flame,
    Brain,
} from 'lucide-react';

interface Props {
    stats: MarketStats | null;
}

function fmt(n: number, decimals = 2) {
    return n.toFixed(decimals);
}

function Badge({ value, unit = '%' }: { value: number; unit?: string }) {
    const cls = value >= 0 ? 'badge-up' : 'badge-down';
    const arrow = value >= 0 ? '▲' : '▼';
    return (
        <div className={`badge ${cls}`}>
            {arrow} {value >= 0 ? '+' : ''}{fmt(value)}{unit}
        </div>
    );
}

function MetricCard({
    label, value, badge, type = 'neutral',
}: {
    label: string;
    value: string;
    badge?: React.ReactNode;
    type?: 'up' | 'down' | 'neutral' | 'amber';
}) {
    return (
        <div className={`metric-card ${type}`}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            {badge}
        </div>
    );
}

export default function MarketSnapshot({ stats }: Props) {
    if (!stats) {
        return (
            <section className="section" id="market-snapshot">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Market Snapshot</div>
                    </div>
                    <div className="empty-state">
                        <div className="empty-icon"><Radio size={32} strokeWidth={1.5} /></div>
                        <p>Connecting to market data…</p>
                    </div>
                </div>
            </section>
        );
    }

    const {
        currentRate,
        dailyChange, dailyChangePct,
        weeklyChange, weeklyChangePct,
        volatility30,
        dxy, gdpGrowth, inflation, sentiment,
        lastUpdated,
    } = stats;

    const sentimentLabel = sentiment > 0.1 ? 'Bullish' : sentiment < -0.1 ? 'Bearish' : 'Neutral';
    const sentimentType = sentiment > 0.1 ? 'up' : sentiment < -0.1 ? 'down' : 'neutral';
    const inflationType = inflation > 5 ? 'down' : 'neutral';

    return (
        <section className="section" id="market-snapshot">
            <div className="container">
                <div className="section-header">
                    <div className="section-label">Market Snapshot</div>
                    <div className="section-sub">Last data: {lastUpdated} &nbsp;·&nbsp; LKR / USD</div>
                </div>

                {/* FX Rates group */}
                <p className="group-label">FX Rates &amp; Momentum</p>
                <div className={`cards-4 ${styles.group}`}>
                    <MetricCard
                        label={<><ArrowLeftRight size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />USD / LKR Spot</>}
                        value={fmt(currentRate)}
                        type={dailyChangePct >= 0 ? 'up' : 'down'}
                        badge={<Badge value={dailyChangePct} />}
                    />
                    <MetricCard
                        label={<><CalendarDays size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />Daily Change</>}
                        value={`${dailyChange >= 0 ? '+' : ''}${fmt(dailyChange)}`}
                        type={dailyChange >= 0 ? 'up' : 'down'}
                        badge={<Badge value={dailyChangePct} />}
                    />
                    <MetricCard
                        label={<><CalendarRange size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />Weekly Change</>}
                        value={`${weeklyChange >= 0 ? '+' : ''}${fmt(weeklyChange)}`}
                        type={weeklyChange >= 0 ? 'up' : 'down'}
                        badge={<Badge value={weeklyChangePct} />}
                    />
                    <MetricCard
                        label="⚡ 30-Day Volatility"
                        value={`${fmt(volatility30)}%`}
                        type="neutral"
                        badge={<div className="badge badge-neutral">σ annualised</div>}
                    />
                </div>

                {/* Macro group */}
                <p className="group-label" style={{ marginTop: 24 }}>Macro Indicators</p>
                <div className={`cards-4 ${styles.group}`}>
                    <MetricCard
                        label={<><Globe size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />DXY Index</>}
                        value={fmt(dxy)}
                        type="neutral"
                        badge={<div className="badge badge-neutral">Dollar Index</div>}
                    />
                    <MetricCard
                        label={<><TrendingUp size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />GDP Growth</>}
                        value={`${fmt(gdpGrowth)}%`}
                        type={gdpGrowth >= 0 ? 'up' : 'down'}
                        badge={<Badge value={gdpGrowth} />}
                    />
                    <MetricCard
                        label={<><Flame size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />Inflation Rate</>}
                        value={`${fmt(inflation)}%`}
                        type={inflationType}
                        badge={<div className={`badge ${inflationType === 'down' ? 'badge-down' : 'badge-neutral'}`}>{inflation > 5 ? 'Elevated' : 'Moderate'}</div>}
                    />
                    <MetricCard
                        label={<><Brain size={12} style={{display:'inline',marginRight:4}} strokeWidth={1.5} />Sentiment Score</>}
                        value={sentiment.toFixed(4)}
                        type={sentimentType as 'up' | 'down' | 'neutral'}
                        badge={<div className={`badge badge-${sentimentType}`}>{sentimentLabel}</div>}
                    />
                </div>
            </div>
        </section>
    );
}

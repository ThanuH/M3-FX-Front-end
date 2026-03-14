import type { ForecastResponse } from '@/lib/types';
import styles from './TradeBrief.module.css';

interface Props {
    forecast: ForecastResponse;
}

function StatItem({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
    return (
        <div className={styles.stat}>
            <div className={styles.statLabel}>{label}</div>
            <div className={styles.statValue}>{value}</div>
            {sub}
        </div>
    );
}

export default function TradeBrief({ forecast }: Props) {
    const { forecasted_prices, last_known_price } = forecast;
    const lastFc = forecasted_prices[forecasted_prices.length - 1];
    const totalChg = lastFc - last_known_price;
    const totalChgPct = (totalChg / last_known_price) * 100;
    const avgFc = forecasted_prices.reduce((a, b) => a + b, 0) / forecasted_prices.length;
    const isUp = totalChg >= 0;

    return (
        <div className={styles.wrap}>
            <p className={styles.heading}>📈 Trade Brief</p>
            <div className="cards-2">
                <StatItem label="Current Rate" value={last_known_price.toFixed(4)} />
                <StatItem label="Day 5 Target" value={lastFc.toFixed(4)} />
                <StatItem
                    label="5-Day Move"
                    value={`${totalChg >= 0 ? '+' : ''}${totalChg.toFixed(4)}`}
                    sub={
                        <div className={`badge ${isUp ? 'badge-up' : 'badge-down'} ${styles.badge}`}>
                            {isUp ? '▲' : '▼'} {totalChgPct.toFixed(2)}%
                        </div>
                    }
                />
                <StatItem
                    label="Avg Forecast"
                    value={avgFc.toFixed(4)}
                    sub={<div className={styles.bias}>{isUp ? 'Bullish Bias' : 'Bearish Bias'}</div>}
                />
            </div>
        </div>
    );
}

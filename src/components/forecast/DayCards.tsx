import { format, parseISO } from 'date-fns';
import styles from './DayCards.module.css';
import type { ForecastResponse } from '@/lib/types';

interface Props {
    forecast: ForecastResponse;
}

export default function DayCards({ forecast }: Props) {
    const { forecast_dates, forecasted_prices, last_known_price } = forecast;

    return (
        <div className={styles.grid}>
            {forecast_dates.map((date, i) => {
                const price = forecasted_prices[i];
                const change = price - last_known_price;
                const changePct = (change / last_known_price) * 100;
                const isUp = change >= 0;

                return (
                    <div key={date} className={styles.card}>
                        <div className={styles.bar} />
                        <div className={styles.label}>Day {i + 1}</div>
                        <div className={styles.date}>{format(parseISO(date), 'MMM dd, yyyy')}</div>
                        <div className={styles.value}>{price.toFixed(2)}</div>
                        <div className={`badge ${isUp ? 'badge-up' : 'badge-down'} ${styles.delta}`}>
                            {isUp ? '▲' : '▼'} {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

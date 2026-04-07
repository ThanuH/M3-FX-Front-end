import { format, parseISO } from 'date-fns';
import styles from './DayCards.module.css';
import type { ForecastResponse } from '@/lib/types';

interface Props {
    forecast: ForecastResponse;
}

export default function DayCards({ forecast }: Props) {
    const { forecast_dates, t1, t2, t3, t4, t5 } = forecast;
    const intervals = [t1, t2, t3, t4, t5];

    return (
        <div className={styles.grid}>
            {forecast_dates.map((date, i) => {
                const { lower, upper } = intervals[i];

                return (
                    <div key={date} className={styles.card}>
                        <div className={styles.bar} />
                        <div className={styles.label}>Day {i + 1}</div>
                        <div className={styles.date}>{format(parseISO(date), 'MMM dd')}</div>
                        
                        <div className={styles.boundsContainer}>
                            <div className={styles.boundRow}>
                                <div className={styles.boundLabel}>Lower</div>
                                <div className={styles.boundValue}>{lower.toFixed(2)}</div>
                            </div>
                            <div className={styles.boundRow}>
                                <div className={styles.boundLabel}>Upper</div>
                                <div className={styles.boundValue}>{upper.toFixed(2)}</div>
                            </div>
                        </div>
                        
                        <div className={styles.range}>
                            Range: {(upper - lower).toFixed(2)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import Link from 'next/link';
import styles from './Footer.module.css';

const YEAR = new Date().getFullYear();

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.top}>
                    <div className={styles.brandBlock}>
                        <Link href="/" className={styles.brand}>
                            <span className={styles.logo}>
                                M3<span className={styles.logoAccent}>-FX</span>
                            </span>
                            <span className={styles.tag}>USD / LKR Intelligence</span>
                        </Link>
                        <p className={styles.copy}>
                            M3-FX brings together exchange-rate signals, macro indicators, and
                            sentiment analysis into a focused USD/LKR forecasting workspace for
                            research, monitoring, and scenario review.
                        </p>
                    </div>

                    <div>
                        <p className={styles.sectionTitle}>Explore</p>
                        <nav className={styles.links}>
                            <Link href="/" className={styles.link}>Home</Link>
                            <Link href="/forecast" className={styles.link}>Forecast</Link>
                            <Link href="/historical" className={styles.link}>Historical</Link>
                            <Link href="/news" className={styles.link}>News</Link>
                        </nav>
                    </div>

                    <div>
                        <p className={styles.sectionTitle}>Platform Notes</p>
                        <div className={styles.notes}>
                            <p className={styles.note}>Forecasts are model-generated views, not trading advice.</p>
                            <p className={styles.note}>Signals combine FX history, macro data, and sentiment context.</p>
                            <p className={styles.note}>Designed around Sri Lanka-focused market monitoring and policy interpretation.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.meta}>© {YEAR} M3-FX. Built for USD/LKR intelligence and macro signal analysis.</p>
                    <p className={styles.disclaimer}>Data availability, publication lags, and model assumptions can affect outputs.</p>
                </div>
            </div>
        </footer>
    );
}
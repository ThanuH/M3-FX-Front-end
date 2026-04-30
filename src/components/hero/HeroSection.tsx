'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import styles from './HeroSection.module.css';
import NewsTicker from './NewsTicker';

const GlobeCanvas = dynamic(() => import('./GlobeCanvas'), { ssr: false });

export default function HeroSection() {
    return (
        <section className={styles.hero}>
            {/* Grid overlay */}
            <div className={styles.grid} aria-hidden="true" />

            {/* Left panel */}
            <div className={styles.left}>
                <div className={styles.eyebrow}>
                    <span className={styles.eyebrowLine} />
                    <span>USD / LKR &nbsp;·&nbsp; FX Intelligence Platform</span>
                </div>

                <h1 className={styles.title}>
                    M3<span className={styles.titleAccent}>‑FX</span>
                </h1>

                <p className={styles.subtitle}>
                    Multivariate <strong>LSTM forecasting</strong> powered by macro signals,
                    central&nbsp;bank policy, trade data &amp; live sentiment analysis.
                </p>

                {/* Stats row */}
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <div className={styles.statVal}>23</div>
                        <div className={styles.statLbl}>Features</div>
                    </div>
                    <div className={styles.statSep} />
                    <div className={styles.stat}>
                        <div className={styles.statVal}>30d</div>
                        <div className={styles.statLbl}>Lookback</div>
                    </div>
                    <div className={styles.statSep} />
                    <div className={styles.stat}>
                        <div className={styles.statVal}>5d</div>
                        <div className={styles.statLbl}>Horizon</div>
                    </div>
                </div>

                {/* CTA buttons */}
                <div className={styles.cta}>
                    <Link href="/forecast" className="btn-primary">
                         Open Forecast
                    </Link>
                    <a href="#how-it-works" className="btn-secondary">
                         How It Works
                    </a>
                </div>

                {/* Globe location labels */}
                <div className={styles.hubs}>
                    <span className={`${styles.hub} ${styles.hubLkr}`}>🇱🇰 Colombo</span>
                    <span className={styles.hub}>🇬🇧 London</span>
                    <span className={styles.hub}>🇺🇸 New York</span>
                    <span className={styles.hub}>🇯🇵 Tokyo</span>
                    <span className={styles.hub}>🇦🇪 Dubai</span>
                    <span className={styles.hub}>🇸🇬 Singapore</span>
                </div>
            </div>

            {/* Right — Globe */}
            <div className={styles.right}>
                <div className={styles.globeWrap}>
                    <div className={styles.glow} aria-hidden="true" />
                    <GlobeCanvas />
                </div>
            </div>

            {/* News ticker */}
            <NewsTicker />
        </section>
    );
}

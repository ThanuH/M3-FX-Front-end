'use client';

import type { ForecastExplanationResponse } from '@/lib/types';
import styles from './ForecastExplanation.module.css';

interface Props {
    explanation: ForecastExplanationResponse;
}

export default function ForecastExplanation({ explanation }: Props) {
    return (
        <section className="section">
            <div className="container">
                <div className="section-header">
                    <div className="section-label">Forecast Explanations</div>
                    <div className="section-sub">AI-powered reasoning for each time horizon prediction</div>
                </div>

                {/* Explanations by Horizon */}
                <div className={styles.explanationsGrid}>
                    {explanation.items.map((item) => (
                        <div key={item.horizon} className={styles.explanationCard}>
                            <div className={styles.horizon}>
                                <span className={styles.horizonLabel}>T+{item.horizon}</span>
                                <span className={styles.price}>{item.predicted_price.toFixed(4)}</span>
                            </div>
                            <div className={styles.badge}>
                                {item.source === 'cache' ? '🔄 Cached' : '✨ Generated'}
                            </div>
                            <p className={styles.explanation}>{item.explanation}</p>
                        </div>
                    ))}
                </div>

                {/* Key Drivers (SHAP) */}
                <div className={styles.driversSection}>
                    <p className="group-label">Model Feature Drivers (SHAP Analysis)</p>
                    <div className={styles.driversGrid}>
                        {explanation.shap_drivers.map((driver) => (
                            <div key={driver.feature} className={styles.driverCard}>
                                <div className={styles.driverLabel}>{driver.label}</div>
                                <div className={styles.driverValue}>{typeof driver.feature_value === 'number' ? driver.feature_value.toFixed(4) : driver.feature_value}</div>
                                <div className={styles.driverFeature}>{driver.feature}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sentiment Analysis */}
                <div className={styles.sentimentSection}>
                    <p className="group-label">Sentiment & News Analysis</p>

                    {/* Market Sentiment (EconomyNext) */}
                    <div className={styles.sentimentBox}>
                        <div className={styles.sentimentTitle}>📰 Market Sentiment (EconomyNext)</div>
                        {explanation.sentiment_trace.economynext.has_fresh_news ? (
                            <div className={styles.freshNews}>✨ Fresh news available today</div>
                        ) : (
                            <div className={styles.noFreshNews}>No new news today</div>
                        )}

                        <div className={styles.contributionsGrid}>
                            {explanation.sentiment_trace.economynext.contributions.map((contrib) => (
                                <div key={contrib.date} className={styles.contributionCard}>
                                    <div className={styles.contribDate}>
                                        <span className={styles.dateLabel}>{contrib.date}</span>
                                        <span className={styles.daysAgo}>({contrib.days_ago}d ago)</span>
                                    </div>
                                    <div className={styles.decayBar}>
                                        <div
                                            className={styles.decayFill}
                                            style={{ width: `${contrib.weight_pct}%` }}
                                        >
                                            {contrib.weight_pct.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className={styles.articleCount}>{contrib.article_count} article{contrib.article_count !== 1 ? 's' : ''}</div>
                                    <div className={styles.headlines}>
                                        {contrib.headlines.map((headline, i) => (
                                            <a
                                                key={i}
                                                href={contrib.urls[i]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.headline}
                                                title={headline}
                                            >
                                                {headline}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Central Bank Sentiment */}
                    <div className={styles.sentimentBox}>
                        <div className={styles.sentimentTitle}>🏦 Central Bank Sentiment (CBSL)</div>
                        <div className={styles.cbslDetails}>
                            <div className={styles.cbslItem}>
                                <span className={styles.label}>Original Score:</span>
                                <span className={styles.value}>{explanation.sentiment_trace.cbsl.original_score.toFixed(4)}</span>
                            </div>
                            <div className={styles.cbslItem}>
                                <span className={styles.label}>Published:</span>
                                <span className={styles.value}>{explanation.sentiment_trace.cbsl.published_date}</span>
                            </div>
                            <div className={styles.cbslItem}>
                                <span className={styles.label}>Days Since Published:</span>
                                <span className={styles.value}>{explanation.sentiment_trace.cbsl.days_since_published}</span>
                            </div>
                            <div className={styles.cbslItem}>
                                <span className={styles.label}>Decayed Score:</span>
                                <span className={styles.value}>{explanation.sentiment_trace.cbsl.decayed_score.toFixed(4)}</span>
                            </div>
                            <div className={styles.cbslItem}>
                                <span className={styles.label}>Freshness:</span>
                                <span className={`${styles.value} ${explanation.sentiment_trace.cbsl.is_fresh ? styles.fresh : styles.stale}`}>
                                    {explanation.sentiment_trace.cbsl.is_fresh ? '✓ Fresh' : '✗ Stale'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Source Info */}
                <div className={styles.sourceInfo}>
                    <span className={styles.sourceLabel}>Data Source:</span>
                    <span className={styles.sourceBadge}>{explanation.source}</span>
                </div>
            </div>
        </section>
    );
}

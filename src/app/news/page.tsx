import { getNews } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import styles from './page.module.css';

export const metadata = {
    title: 'M3-FX | Market News',
    description: 'Latest USD/LKR and Sri Lanka economy news headlines, live from Economy Next.',
};

export default async function NewsPage() {
    let headlines: { snippet: string; url: string; date: string }[] = [];

    try {
        const res = await getNews();
        headlines = res.headlines;
    } catch {
        headlines = [];
    }

    return (
        <>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div>
                    <div className={styles.headerTitle}>Market News</div>
                    <div className={styles.headerSub}>Live headlines &nbsp;·&nbsp; Economy Next &nbsp;·&nbsp; USD / LKR</div>
                </div>
                <div className={styles.headerBadge}>📰 {headlines.length} Headlines</div>
            </div>

            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Latest Headlines</div>
                        <div className="section-sub">Source: Economy Next &amp; CBSL policy feeds</div>
                    </div>

                    {headlines.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📡</div>
                            <p>Could not load headlines. Make sure the backend is running at <strong>localhost:7860</strong></p>
                        </div>
                    ) : (
                        <div className={styles.cardGrid}>
                            {headlines.map((item, i) => {
                                let formattedDate = '';
                                try {
                                    formattedDate = item.date
                                        ? format(parseISO(item.date), 'dd MMM yyyy')
                                        : '';
                                } catch {
                                    formattedDate = item.date ?? '';
                                }

                                return (
                                    <article key={i} className={styles.card}>
                                        {/* Index badge */}
                                        <div className={styles.indexBadge}>{String(i + 1).padStart(2, '0')}</div>

                                        {/* Date */}
                                        {formattedDate && (
                                            <div className={styles.date}>{formattedDate}</div>
                                        )}

                                        {/* Snippet */}
                                        <p className={styles.snippet}>{item.snippet}</p>

                                        {/* Read more */}
                                        {item.url && item.url !== '#' ? (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.readMore}
                                            >
                                                Read full article
                                                <span className={styles.arrow}>↗</span>
                                            </a>
                                        ) : (
                                            <span className={styles.readMoreDisabled}>No link available</span>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

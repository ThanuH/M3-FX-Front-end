'use client';

import { useState, useEffect } from 'react';
import styles from './NewsTicker.module.css';
import type { HeadlineItem } from '@/lib/types';

const PX_PER_SEC = 80; // scroll speed — pixels per second

export default function NewsTicker() {
    const [headlines, setHeadlines] = useState<HeadlineItem[]>([]);

    useEffect(() => {
        async function fetchHeadlines() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/market/news`,
                    { cache: 'no-store' },
                );
                if (!res.ok) return;
                const data = (await res.json()) as { headlines: HeadlineItem[] };
                if (data.headlines.length) setHeadlines(data.headlines);
            } catch { /* keep fallback */ }
        }
        fetchHeadlines();
    }, []);

    const joined = headlines.length
        ? headlines.map(h => h.snippet).join('   ·   ')
        : 'Fetching latest market headlines…';

    // Estimate rendered width (avg ~7px per char at 11px font)
    const estWidth = joined.length * 7;
    const duration = Math.round(estWidth / PX_PER_SEC);

    return (
        <div className={styles.wrapper}>
            <div className={styles.liveTag}>LIVE</div>
            <div className={styles.track}>
                {/* Two identical spans side-by-side; animate both left by 50% of total width */}
                <div
                    className={styles.belt}
                    style={{ animationDuration: `${duration}s` }}
                >
                    <span className={styles.text}>{joined}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span className={styles.text} aria-hidden="true">{joined}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </div>
            </div>
        </div>
    );
}

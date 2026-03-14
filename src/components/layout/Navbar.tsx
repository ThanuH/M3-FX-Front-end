'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

function useMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sun, 6 = Sat
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

export default function Navbar() {
    const pathname = usePathname();
    const isOpen = useMarketStatus();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.inner}>
                {/* Brand */}
                <Link href="/" className={styles.brand}>
                    <span className={styles.logo}>M3<span className={styles.logoAccent}>‑FX</span></span>
                    <span className={styles.tag}>USD / LKR</span>
                </Link>

                {/* Nav links */}
                <div className={styles.links}>
                    <Link href="/"
                        className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
                        <span className={styles.dot} />
                        Home
                    </Link>
                    <Link href="/forecast"
                        className={`${styles.link} ${pathname === '/forecast' ? styles.active : ''}`}>
                        <span className={styles.dot} />
                        Forecast
                    </Link>
                    <Link href="/historical"
                        className={`${styles.link} ${pathname === '/historical' ? styles.active : ''}`}>
                        <span className={styles.dot} />
                        Historical
                    </Link>

                    <div className={styles.divider} />

                    <div className={`${styles.status} ${isOpen ? styles.open : styles.closed}`}>
                        <span className={styles.statusDot} />
                        {isOpen ? 'Market Open' : 'Market Closed'}
                    </div>
                </div>
            </div>
        </nav>
    );
}

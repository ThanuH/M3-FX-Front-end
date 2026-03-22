'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getPredictPerformance } from '@/lib/api';
import type { PerformanceResponse } from '@/lib/types';
import styles from './page.module.css';

const HorizonChart = dynamic(() => import('@/components/accuracy/HorizonChart'), { ssr: false });

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function AccuracyPage() {
    const [status, setStatus] = useState<Status>('idle');
    const [data, setData] = useState<PerformanceResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [limit, setLimit] = useState(100);

    // Auto-fetch on mount
    useEffect(() => {
        void handleFetch();
    }, []);

    async function handleFetch() {
        setStatus('loading');
        setData(null);
        setErrorMsg('');
        try {
            const result = await getPredictPerformance(limit);
            setData(result);
            setStatus('done');
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
            setStatus('error');
        }
    }

    return (
        <>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backLink}>← Back</Link>
                    <div>
                        <div className={styles.headerTitle}>Predictive Accuracy Overview</div>
                        <div className={styles.headerSub}>Forecast vs Actual performance across horizons · USD / LKR</div>
                    </div>
                </div>
            </div>

            {/* Main section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Forecast Performance Analysis</div>
                        <div className="section-sub">Compare predictions with actual prices across all time horizons</div>
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.datePickerGroup}>
                            <label htmlFor="limit-input" className={styles.label}>Records to Display</label>
                            <input
                                id="limit-input"
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 100))}
                                min="1"
                                max="500"
                                className={styles.dateInput}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleFetch}
                            disabled={status === 'loading'}
                            style={{ alignSelf: 'flex-end' }}
                        >
                            {status === 'loading' ? (
                                <><span className="spinner" style={{ width: 16, height: 16 }} /> Loading…</>
                            ) : (
                                'Refresh Data'
                            )}
                        </button>
                    </div>

                    {/* Error message */}
                    {status === 'error' && (
                        <div className={styles.errorBox}>
                            {errorMsg}
                        </div>
                    )}

                    {/* Results */}
                    {status === 'done' && data && (
                        <>
                            <div style={{ marginTop: 24, marginBottom: 24 }}>
                                <div className="badge badge-neutral">
                                    Total Records: <strong>{data.total}</strong> · Displaying: <strong>{data.records.length}</strong>
                                </div>
                            </div>

                            {/* Chart */}
                            <div style={{ marginTop: 32 }}>
                                <p className="group-label">Forecast vs Actual Performance</p>
                                <HorizonChart data={data} />
                            </div>
                        </>
                    )}

                    {/* Loading state */}
                    {status === 'loading' && (
                        <div className={styles.idleBox}>
                            <div style={{ fontSize: 20 }}>⏳ Loading performance data...</div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

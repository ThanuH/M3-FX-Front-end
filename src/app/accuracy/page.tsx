'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { getHorizonAnalysis } from '@/lib/api';
import type { HorizonAnalysisResponse } from '@/lib/types';
import styles from './page.module.css';

const HorizonChart = dynamic(() => import('@/components/accuracy/HorizonChart'), { ssr: false });

type Status = 'idle' | 'loading' | 'done' | 'error';
type Horizon = 't1' | 't2' | 't3' | 't4' | 't5';

const MIN_DATE = '2026-01-01';

export default function AccuracyPage() {
    const [status, setStatus] = useState<Status>('idle');
    const [data, setData] = useState<HorizonAnalysisResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedHorizon, setSelectedHorizon] = useState<Horizon>('t1');

    // Get today's date in YYYY-MM-DD format
    const today = format(new Date(), 'yyyy-MM-dd');

    const [fromDate, setFromDate] = useState(MIN_DATE);
    const [toDate, setToDate] = useState(today);

    async function fetchData() {
        setStatus('loading');
        setData(null);
        setErrorMsg('');
        try {
            const result = await getHorizonAnalysis(fromDate, toDate);
            setData(result);
            setStatus('done');
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
            setStatus('error');
        }
    }

    // Auto-fetch on component mount or date range change
    useEffect(() => {
        if (fromDate && toDate) {
            fetchData();
        }
    }, []); // Only on mount

    function handleFetch() {
        if (fromDate && toDate) {
            fetchData();
        }
    }

    const horizons: Horizon[] = ['t1', 't2', 't3', 't4', 't5'];

    return (
        <>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backLink}>← Back</Link>
                    <div>
                        <div className={styles.headerTitle}>Predictive Accuracy Overview</div>
                        <div className={styles.headerSub}>Forecast vs Actual comparison across time horizons · USD / LKR</div>
                    </div>
                </div>
            </div>

            {/* Main section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Date Range Selection</div>
                        <div className="section-sub">Select dates from January 1, 2026 to today</div>
                    </div>

                    {/* Date picker controls */}
                    <div className={styles.controls}>
                        <div className={styles.datePickerGroup}>
                            <label className={styles.label}>From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                min={MIN_DATE}
                                max={today}
                                className={styles.dateInput}
                            />
                        </div>

                        <div className={styles.datePickerGroup}>
                            <label className={styles.label}>To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                min={fromDate}
                                max={today}
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
                                'Fetch Analysis'
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
                            {/* Horizon selection */}
                            <div className={styles.section}>
                                <div className={styles.sectionLabel}>Select Time Horizon</div>
                                <div className={styles.horizonButtons}>
                                    {horizons.map(h => (
                                        <button
                                            key={h}
                                            className={`${styles.horizonBtn} ${selectedHorizon === h ? styles.active : ''}`}
                                            onClick={() => setSelectedHorizon(h)}
                                        >
                                            {h.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chart */}
                            <div className={styles.section}>
                                <HorizonChart data={data.data} horizon={selectedHorizon} />
                            </div>

                            {/* MAE Metrics */}
                            <div className={styles.section}>
                                <div className={styles.sectionLabel}>Mean Absolute Error (MAE)</div>
                                <div className={styles.metricsGrid}>
                                    {horizons.map(h => (
                                        <div key={h} className={styles.metricCard}>
                                            <div className={styles.metricLabel}>{h.toUpperCase()}</div>
                                            <div className={styles.metricValue}>
                                                {data.mae[h as keyof typeof data.mae].toFixed(4)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className={styles.section}>
                                <div className={styles.sectionLabel}>Data Summary</div>
                                <div className={styles.summaryGrid}>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Total Data Points</div>
                                        <div className={styles.summaryValue}>{data.data.length}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Date Range</div>
                                        <div className={styles.summaryValue}>{fromDate} to {toDate}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Best Performing Horizon</div>
                                        <div className={styles.summaryValue}>
                                            {
                                                horizons.reduce((best, h) => 
                                                    data.mae[h as keyof typeof data.mae] < data.mae[best as keyof typeof data.mae] 
                                                        ? h 
                                                        : best
                                                ).toUpperCase()
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Idle state message */}
                    {status === 'idle' && (
                        <div className={styles.idleBox}>
                            <div className={styles.idleIcon}>📊</div>
                            <div className={styles.idleText}>Select a date range and click "Fetch Analysis" to view forecast accuracy data</div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

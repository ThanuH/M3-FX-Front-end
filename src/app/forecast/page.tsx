'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';
import type { ForecastResponse, PricePoint } from '@/lib/types';
import DayCards from '@/components/forecast/DayCards';
import TradeBrief from '@/components/forecast/TradeBrief';
import styles from './page.module.css';

const ForecastChart = dynamic(() => import('@/components/forecast/ForecastChart'), { ssr: false });

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function ForecastPage() {
    const [status, setStatus] = useState<Status>('idle');
    const [forecast, setForecast] = useState<ForecastResponse | null>(null);
    const [history, setHistory] = useState<PricePoint[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    async function runForecast() {
        setStatus('loading');
        setForecast(null);
        setErrorMsg('');
        try {
            const [fcRes, histRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/auto`).then(r => {
                    if (!r.ok) throw new Error(`Forecast error ${r.status}`);
                    return r.json() as Promise<ForecastResponse>;
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/market/history?limit=90`).then(r => {
                    if (!r.ok) throw new Error(`History error ${r.status}`);
                    return r.json().then((d: { points: PricePoint[] }) => d.points);
                }),
            ]);
            setForecast(fcRes);
            setHistory(histRes);
            setStatus('done');
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
            setStatus('error');
        }
    }

    function reset() {
        setStatus('idle');
        setForecast(null);
        setHistory([]);
    }

    function downloadCsv() {
        if (!forecast) return;
        const rows = forecast.forecast_dates.map((d, i) => `${d},${forecast.forecasted_prices[i].toFixed(4)}`);
        const csv = 'date,forecast_usd_lkr\n' + rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `m3fx_forecast_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backLink}>← Back</Link>
                    <div>
                        <div className={styles.headerTitle}>5-Day LSTM Forecast</div>
                        <div className={styles.headerSub}>Multivariate deep learning model &nbsp;·&nbsp; USD / LKR</div>
                    </div>
                </div>
                <div className={styles.headerBadge}>⚡ LSTM · 13 Features · 60-Day Lookback</div>
            </div>

            {/* Forecast section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Generate Forecast</div>
                        <div className="section-sub">Click to run the LSTM model on the latest available data</div>
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <button
                            className="btn-primary"
                            onClick={runForecast}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? (
                                <><span className="spinner" style={{ width: 16, height: 16 }} /> Running Model…</>
                            ) : (
                                '⚡ Generate Forecast'
                            )}
                        </button>

                        {status === 'done' && (
                            <>
                                <button className="btn-ghost" onClick={downloadCsv}>📥 Download CSV</button>
                                <button className="btn-ghost" onClick={reset}>🔄 New Forecast</button>
                            </>
                        )}

                        <div className={styles.tip}>
                            Runs the pre-trained LSTM model on the most recent 60 days of data.
                            Forecast horizon: <strong>5 trading days</strong>.
                        </div>
                    </div>

                    {/* Error */}
                    {status === 'error' && (
                        <div className={styles.errorBox}>
                            <strong>⚠ Failed to generate forecast</strong><br />
                            {errorMsg}<br />
                            <small>Make sure the backend is running at localhost:7860</small>
                        </div>
                    )}

                    {/* Results */}
                    {status === 'done' && forecast && (
                        <div className={`fade-up ${styles.results}`}>

                            {/* Last known data */}
                            <div className={styles.lastKnown}>
                                <span className="badge badge-neutral">
                                    Last known: {format(parseISO(forecast.last_known_date), 'dd MMM yyyy')}
                                    &nbsp;·&nbsp;
                                    {forecast.last_known_price.toFixed(4)} LKR
                                </span>
                            </div>

                            {/* Chart */}
                            <div className={styles.chartWrap}>
                                <ForecastChart history={history} forecast={forecast} />
                            </div>

                            {/* Day cards */}
                            <div style={{ marginTop: 28 }}>
                                <p className="group-label" style={{ marginBottom: 16 }}>5-Day Forecast</p>
                                <DayCards forecast={forecast} />
                            </div>

                            {/* Details table + Trade Brief */}
                            <div className={styles.detailsRow}>
                                {/* Table */}
                                <div className={styles.tableWrap}>
                                    <p className={styles.tableHeading}>📋 Forecast Details</p>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Day</th>
                                                <th>Date</th>
                                                <th>USD/LKR</th>
                                                <th>Change</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {forecast.forecast_dates.map((d, i) => {
                                                const price = forecast.forecasted_prices[i];
                                                const chg = price - forecast.last_known_price;
                                                const chgPct = (chg / forecast.last_known_price) * 100;
                                                const isUp = chg >= 0;
                                                return (
                                                    <tr key={d}>
                                                        <td>Day {i + 1}</td>
                                                        <td>{format(parseISO(d), 'yyyy-MM-dd')}</td>
                                                        <td className={styles.monoCell}>{price.toFixed(4)}</td>
                                                        <td>
                                                            <span className={`badge ${isUp ? 'badge-up' : 'badge-down'}`}>
                                                                {isUp ? '▲' : '▼'} {chgPct.toFixed(2)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Trade Brief */}
                                <div className={styles.briefWrap}>
                                    <TradeBrief forecast={forecast} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Idle */}
                    {status === 'idle' && (
                        <div className="empty-state" style={{ marginTop: 32 }}>
                            <div className="empty-icon">📡</div>
                            <p>Click <strong>Generate Forecast</strong> above to run the 5-day LSTM prediction model.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

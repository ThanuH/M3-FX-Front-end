'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';
import type { ForecastResponse, PricePoint, ForecastExplanationResponse } from '@/lib/types';
import { getForecastExplanation } from '@/lib/api';
import DayCards from '@/components/forecast/DayCards';
import TradeBrief from '@/components/forecast/TradeBrief';
import ForecastExplanation from '@/components/forecast/ForecastExplanation';
import styles from './page.module.css';
import { Download, RefreshCw, Table2, Radio } from 'lucide-react';

const ForecastChart = dynamic(() => import('@/components/forecast/ForecastChart'), { ssr: false });
const ForecastBandChart = dynamic(() => import('@/components/forecast/ForecastBandChart'), { ssr: false });

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function ForecastPage() {
    const [status, setStatus] = useState<Status>('idle');
    const [forecast, setForecast] = useState<ForecastResponse | null>(null);
    const [explanation, setExplanation] = useState<ForecastExplanationResponse | null>(null);
    const [history, setHistory] = useState<PricePoint[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    async function runForecast() {
        setStatus('loading');
        setForecast(null);
        setExplanation(null);
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
            
            // Fetch explanation for the forecast using the forecast date
            try {
                const explRes = await getForecastExplanation(fcRes.last_known_date);
                setExplanation(explRes);
            } catch (explError) {
                console.warn('Failed to fetch explanation:', explError);
                // Continue without explanation - it's optional
            }
            
            setStatus('done');
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
            setStatus('error');
        }
    }

    function reset() {
        setStatus('idle');
        setForecast(null);
        setExplanation(null);
        setHistory([]);
    }

    function downloadCsv() {
        if (!forecast) return;
        const intervals = [forecast.t1, forecast.t2, forecast.t3, forecast.t4, forecast.t5];
        const rows = forecast.forecast_dates.map((d, i) => `${d},${intervals[i].median.toFixed(4)},${intervals[i].lower.toFixed(4)},${intervals[i].upper.toFixed(4)}`);
        const csv = 'date,median_forecast,lower_bound_80pct,upper_bound_80pct\n' + rows.join('\n');
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
                                ' Generate Forecast'
                            )}
                        </button>

                        {status === 'done' && (
                            <>
                                <button className="btn-ghost" onClick={downloadCsv}><Download size={14} style={{display:'inline',marginRight:6}} />Download CSV</button>
                                <button className="btn-ghost" onClick={reset}><RefreshCw size={14} style={{display:'inline',marginRight:6}} />New Forecast</button>
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

                            {/* 5-Day Forecast Band Chart */}
                            <div style={{ marginTop: 32 }}>
                                <p className="group-label" style={{ marginBottom: 12 }}>5-Day Forecast · Confidence Band</p>
                                <div style={{
                                    background: 'rgba(15,23,42,0.6)',
                                    border: '1px solid #1a2540',
                                    borderRadius: 12,
                                    padding: '16px 8px 8px',
                                }}>
                                    <ForecastBandChart forecast={forecast} />
                                </div>
                            </div>

                            {/* Details table + Trade Brief */}
                            <div className={styles.detailsRow}>
                                {/* Table */}
                                <div className={styles.tableWrap}>
                                    <p className={styles.tableHeading}><Table2 size={13} style={{display:'inline',marginRight:6}} strokeWidth={1.5} />Forecast Details</p>
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
                                                const intervals = [forecast.t1, forecast.t2, forecast.t3, forecast.t4, forecast.t5];
                                                const price = intervals[i].median;
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

                            {/* Forecast Explanations */}
                            {explanation && <ForecastExplanation explanation={explanation} />}
                        </div>
                    )}

                    {/* Idle */}
                    {status === 'idle' && (
                        <div className="empty-state" style={{ marginTop: 32 }}>
                            <div className="empty-icon"><Radio size={32} strokeWidth={1.5} /></div>
                            <p>Click <strong>Generate Forecast</strong> above to run the 5-day LSTM prediction model.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

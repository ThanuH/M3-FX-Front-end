'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { MacroIndicatorsResponse } from '@/lib/types';
import styles from './page.module.css';

const MacroChart = dynamic(() => import('@/components/historical/MacroChart'), { ssr: false });

const COLUMN_LABELS: Record<string, string> = {
    tourism_earning: 'Tourism Earnings',
    exports: 'Exports (USD M)',
    imports: 'Imports (USD M)',
    workers_remmitance: 'Workers Remittance',
    reserve_assets: 'Reserve Assets',
    inflation_rate: 'Inflation Rate %',
};

// Columns that are metadata/dimensions, not plottable indicators
const META_COLS = new Set(['id', 'year', 'month']);

const MONTH_IDX: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12,
};

function rowSortKey(r: Record<string, number | string | null>): number {
    const yr = Number(r['year'] ?? 0);
    const mo = MONTH_IDX[String(r['month'] ?? '').trim().toLowerCase()] ?? 0;
    return yr * 100 + mo;
}

function friendlyLabel(col: string): string {
    return (
        COLUMN_LABELS[col] ??
        col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );
}

function getSeriesColumns(data: Pick<MacroIndicatorsResponse, 'records'> & { columns?: string[] }): string[] {
    const rawCols = Array.isArray(data.columns) && data.columns.length
        ? data.columns
        : Array.from(
            new Set(
                data.records.flatMap(r => Object.keys(r)),
            ),
        );
    return rawCols.filter(c => !META_COLS.has(c));
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function HistoricalPage() {
    const [status, setStatus] = useState<Status>('loading');
    const [data, setData] = useState<MacroIndicatorsResponse | null>(null);
    const [selectedCol, setSelectedCol] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState('');

    async function loadData() {
        setStatus('loading');
        setErrorMsg('');
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/market/macro?limit=500`,
            );
            if (!res.ok) throw new Error(`API error ${res.status}`);
            const json = (await res.json()) as MacroIndicatorsResponse;
            // Sort records oldest → latest by year then month
            const MONTH_ORDER: Record<string, number> = {
                January: 1, February: 2, March: 3, April: 4,
                May: 5, June: 6, July: 7, August: 8,
                September: 9, October: 10, November: 11, December: 12,
            };
            json.records.sort((a, b) => {
                const yDiff = Number(a['year'] ?? 0) - Number(b['year'] ?? 0);
                if (yDiff !== 0) return yDiff;
                return (MONTH_ORDER[String(a['month'] ?? '')] ?? 0) -
                       (MONTH_ORDER[String(b['month'] ?? '')] ?? 0);
            });
            setData(json);
            const seriesCols = getSeriesColumns(json);
            setSelectedCol(seriesCols[0] ?? '');
            setStatus('done');
        } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
            setStatus('error');
        }
    }

    useEffect(() => { loadData(); }, []);

    function downloadCsv() {
        if (!data || !selectedCol) return;
        const sorted = [...data.records].sort((a, b) => rowSortKey(a) - rowSortKey(b));
        const header = `year,month,${selectedCol}`;
        const rows = sorted.map(
            r => `${r['year'] ?? ''},${r['month'] ?? ''},${r[selectedCol] ?? ''}`,
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `m3fx_${selectedCol}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const seriesCols = data ? getSeriesColumns(data) : [];

    const values =
        data && selectedCol
            ? data.records
                  .map(r => Number(r[selectedCol]))
                  .filter(v => !isNaN(v) && isFinite(v))
            : [];

    const minVal = values.length ? Math.min(...values) : 0;
    const maxVal = values.length ? Math.max(...values) : 0;
    const latestVal = values.length ? values[values.length - 1] : 0;
    const firstVal = values.length ? values[0] : 0;
    const totalChange = latestVal - firstVal;
    const totalChangePct =
        firstVal !== 0 ? (totalChange / Math.abs(firstVal)) * 100 : 0;
    const isUp = totalChange >= 0;

    return (
        <>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.backLink}>← Back</Link>
                    <div>
                        <div className={styles.headerTitle}>Macro Indicators</div>
                        <div className={styles.headerSub}>
                            Monthly macroeconomic data &nbsp;·&nbsp; Sri Lanka
                        </div>
                    </div>
                </div>
                <div className={styles.headerBadge}>📊 12 Indicators · Monthly Series</div>
            </div>

            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Historical Data</div>
                        <div className="section-sub">
                            Load the full macro indicator dataset and explore each series
                        </div>
                    </div>

                    {/* Controls */}
                    {status === 'done' && (
                        <div className={styles.controls}>
                            <button className="btn-ghost" onClick={downloadCsv} disabled={!selectedCol}>
                                📥 Download CSV
                            </button>
                            <div className={styles.tip}>
                                Monthly macro series from CBSL &amp; World Bank feeds.
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className={styles.errorBox}>
                            <strong>⚠ Failed to load data</strong>
                            <br />
                            {errorMsg}
                            <br />
                            <small>Make sure the backend is running at localhost:7860</small>
                        </div>
                    )}

                    {/* Results */}
                    {status === 'done' && data && (
                        <div className={`fade-up ${styles.results}`}>
                            {/* Meta badge */}
                            <div className={styles.metaRow}>
                                <span className="badge badge-neutral">
                                    {data.total ?? data.records.length} records &nbsp;·&nbsp; {seriesCols.length}{' '}
                                    indicators
                                </span>
                            </div>

                            {/* Series selector pills */}
                            <div className={styles.seriesRow}>
                                <p className={styles.seriesLabel}>Select Indicator</p>
                                <div className={styles.pills}>
                                    {seriesCols.map(col => (
                                        <button
                                            key={col}
                                            className={`${styles.pill} ${
                                                selectedCol === col ? styles.pillActive : ''
                                            }`}
                                            onClick={() => setSelectedCol(col)}
                                        >
                                            {friendlyLabel(col)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stats cards */}
                            {selectedCol && values.length > 0 && (
                                <>
                                    <p
                                        className="group-label"
                                        style={{ marginBottom: 16 }}
                                    >
                                        {friendlyLabel(selectedCol)} — Overview
                                    </p>
                                    <div className="cards-4" style={{ marginBottom: 28 }}>
                                        <div className="metric-card neutral">
                                            <div className="metric-label">Latest Value</div>
                                            <div className="metric-value">
                                                {latestVal.toFixed(4)}
                                            </div>
                                        </div>
                                        <div
                                            className={`metric-card ${isUp ? 'up' : 'down'}`}
                                        >
                                            <div className="metric-label">Total Change</div>
                                            <div className="metric-value">
                                                {totalChange >= 0 ? '+' : ''}
                                                {totalChange.toFixed(4)}
                                            </div>
                                            <div
                                                className={`badge ${
                                                    isUp ? 'badge-up' : 'badge-down'
                                                }`}
                                            >
                                                {isUp ? '▲' : '▼'} {totalChangePct.toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="metric-card up">
                                            <div className="metric-label">High</div>
                                            <div className="metric-value">
                                                {maxVal.toFixed(4)}
                                            </div>
                                        </div>
                                        <div className="metric-card down">
                                            <div className="metric-label">Low</div>
                                            <div className="metric-value">
                                                {minVal.toFixed(4)}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Chart */}
                            {selectedCol && (
                                <div className={styles.chartWrap}>
                                    <MacroChart
                                        records={data.records}
                                        column={selectedCol}
                                        columnLabel={friendlyLabel(selectedCol)}
                                    />
                                </div>
                            )}

                            {/* Data table */}
                            {selectedCol && (
                                <div style={{ marginTop: 32 }}>
                                    <p className={styles.tableHeading}>
                                        📋 Data Records — {friendlyLabel(selectedCol)}
                                    </p>
                                    <div className={styles.tableScroll}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Date</th>
                                                    <th>{friendlyLabel(selectedCol)}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...data.records].sort((a, b) => rowSortKey(a) - rowSortKey(b)).map((row, i) => {
                                                    const val = row[selectedCol];
                                                    return (
                                                        <tr key={i}>
                                                            <td>
                                                                {String(i + 1).padStart(2, '0')}
                                                            </td>
                                                            <td>{`${row['month'] ?? ''} ${row['year'] ?? ''}`.trim()}</td>
                                                            <td className={styles.monoCell}>
                                                                {val != null
                                                                    ? Number(val).toFixed(4)
                                                                    : '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading */}
                    {status === 'loading' && (
                        <div className="empty-state" style={{ marginTop: 32 }}>
                            <div className="empty-icon"><span className="spinner" /></div>
                            <p>Loading macro indicator data…</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

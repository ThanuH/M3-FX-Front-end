import styles from './HowItWorks.module.css';
import {
    Globe,
    Settings2,
    BrainCircuit,
    BarChart2,
    LayoutDashboard,
    TrendingDown,
    Landmark,
    Newspaper,
    Building2,
    RefreshCcw,
    SlidersHorizontal,
    Target,
    Shuffle,
    Rss,
    Flag,
    ClipboardList,
} from 'lucide-react';

const PIPELINE = [
    { num: '01', icon: Globe,            title: 'Data Collection',     desc: 'Real-time macro, FX rates & news pulled from Supabase via FastAPI.' },
    { num: '02', icon: Settings2,        title: 'Feature Engineering', desc: 'Log transforms, sentiment decay weighting, 60-day rolling window.' },
    { num: '03', icon: BrainCircuit,     title: 'LSTM Inference',      desc: 'Sequence model learns temporal patterns across 13 input variables.' },
    { num: '04', icon: BarChart2,        title: 'Forecast Output',     desc: 'Inverse-scaled daily predictions with directional momentum signals.' },
    { num: '05', icon: LayoutDashboard, title: 'Dashboard Update',    desc: 'Visual report: chart, day cards, trade brief & exportable CSV.' },
];

const SOURCES = [
    {
        icon: TrendingDown, tag: 'Primary Signal', title: 'FX Rate History',
        desc: 'Daily USD/LKR exchange rate from CBSL, cleaned and forward-filled for trading gaps.',
        pills: ['Target Variable', 'Daily OHLC'],
    },
    {
        icon: Landmark, tag: 'Macro Signal', title: 'Macroeconomic Indicators',
        desc: 'GDP growth, inflation, treasury bill rates, worker remittances, reserves, exports & imports.',
        pills: ['CBSL Data', 'World Bank', 'DXY Index'],
    },
    {
        icon: Newspaper, tag: 'Sentiment Signal', title: 'News & Policy Sentiment',
        desc: 'NLP-scored articles from Economy Next. CBSL policy statements mapped with time decay.',
        pills: ['NLP Scoring', 'Decay Weighted'],
    },
    {
        icon: Building2, tag: 'Policy Signal', title: 'CBSL Monetary Policy',
        desc: 'Central bank statements encoded as structured sentiment. Rate decisions & intervention signals.',
        pills: ['Rate Decisions', 'Intervention'],
    },
];

const ARCH = [
    {
        icon: RefreshCcw, title: 'LSTM Network',
        desc: 'Long Short-Term Memory recurrent neural network — designed for temporal sequence learning. Captures long-range dependencies in multivariate financial time series.',
        stat: 'TensorFlow / Keras',
    },
    {
        icon: SlidersHorizontal, title: 'Input Features',
        desc: '13 input variables including macro indicators, sentiment scores, DXY, log-transformed trade data, and lagged FX history fed into a rolling lookback window.',
        stat: '13 Features · 60-Day Window',
    },
    {
        icon: Target, title: '5-Day Horizon',
        desc: 'Multi-step ahead forecasting over a 5-trading-day horizon. MinMax scaled inputs and outputs are inverse-transformed for real LKR values.',
        stat: 'H=5 · MinMax Scaled',
    },
];

const WHY = [
    { icon: Shuffle,       title: 'Multivariate Fusion',  desc: 'Unlike univariate chart-based tools, M3-FX fuses macro, trade, and sentiment into a single joint model.' },
    { icon: Rss,           title: 'Live Sentiment Feed',  desc: 'Real-time news ingestion from Economy Next — sentiment updated continuously and weighted by recency.' },
    { icon: Flag,          title: 'Sri Lanka Focused',    desc: 'Trained exclusively on LKR market data. Local policy & remittance cycles are first-class signals.' },
    { icon: ClipboardList, title: 'Policy-Maker Ready',   desc: 'Exportable forecasts, economic snapshots, and clear directional signals designed for decision-makers.' },
];

export default function HowItWorks() {
    return (
        <section className="section" id="how-it-works">
            <div className="container">
                <div className="section-header">
                    <div className="section-label">How M3-FX Works</div>
                    <div className="section-sub">Multivariate LSTM · End-to-end pipeline</div>
                </div>

                {/* Pipeline */}
                <p className="group-label" style={{ marginBottom: 28 }}>Prediction Pipeline</p>
                <div className={styles.pipeline}>
                    {PIPELINE.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.num} className={styles.step}>
                                <div className={styles.stepIcon}><Icon size={20} strokeWidth={1.5} /></div>
                                <div className={styles.stepNum}>Step {step.num}</div>
                                <div className={styles.stepTitle}>{step.title}</div>
                                <div className={styles.stepDesc}>{step.desc}</div>
                                {i < PIPELINE.length - 1 && <div className={styles.stepArrow}>›</div>}
                            </div>
                        );
                    })}
                </div>

                {/* Data Sources */}
                <p className="group-label" style={{ marginBottom: 20, marginTop: 56 }}>Data Sources</p>
                <div className={`cards-4 ${styles.sourcesGrid}`}>
                    {SOURCES.map(src => {
                        const Icon = src.icon;
                        return (
                            <div key={src.title} className={styles.srcCard}>
                                <div className={styles.srcIcon}><Icon size={20} strokeWidth={1.5} /></div>
                                <div className={styles.srcTag}>{src.tag}</div>
                                <div className={styles.srcTitle}>{src.title}</div>
                                <div className={styles.srcDesc}>{src.desc}</div>
                                <div className={styles.pills}>
                                    {src.pills.map(p => <span key={p} className={styles.pill}>{p}</span>)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Architecture */}
                <p className="group-label" style={{ marginBottom: 20, marginTop: 56 }}>Model Architecture</p>
                <div className={`cards-3 ${styles.archGrid}`}>
                    {ARCH.map(a => {
                        const Icon = a.icon;
                        return (
                            <div key={a.title} className={styles.archCard}>
                                <div className={styles.archIcon}><Icon size={20} strokeWidth={1.5} /></div>
                                <div className={styles.archTitle}>{a.title}</div>
                                <div className={styles.archDesc}>{a.desc}</div>
                                <div className={styles.archStat}>{a.stat}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Why */}
                <p className="group-label" style={{ marginBottom: 20, marginTop: 56 }}>Why M3-FX</p>
                <div className={`cards-4 ${styles.whyGrid}`}>
                    {WHY.map(w => {
                        const Icon = w.icon;
                        return (
                            <div key={w.title} className={styles.whyCard}>
                                <div className={styles.whyIcon}><Icon size={20} strokeWidth={1.5} /></div>
                                <div className={styles.whyTitle}>{w.title}</div>
                                <div className={styles.whyDesc}>{w.desc}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

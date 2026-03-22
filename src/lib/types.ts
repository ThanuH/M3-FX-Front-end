// API Response Types matching FastAPI backend

export interface PricePoint {
  date: string;
  price: number;
}

export interface HistoryResponse {
  points: PricePoint[];
  total: number;
  from_date: string;
  to_date: string;
}

export interface MarketDataRow {
  date: string;
  target_price: number;
  features: Record<string, number>;
}

export interface MarketDataResponse {
  rows: MarketDataRow[];
  total: number;
}

export interface MarketSnapshotResponse {
  as_of_date: string;
  fx: {
    pair: string;
    spot: number;
    daily_change: {
      value: number;
      pct: number;
    };
    weekly_change: {
      value: number;
      pct: number;
    };
    volatility_30d_annualized_pct: number;
  };
  macro: {
    dxy_index: number;
    gdp_growth_pct: number;
    inflation_rate_pct: number;
    sentiment_score: number;
    inflation_regime: string;
    sentiment_label: string;
  };
  data_points_used: number;
}

export interface HeadlineItem {
  snippet: string;
  url: string;
  date: string;
}

export interface NewsResponse {
  headlines: HeadlineItem[];
  count: number;
}

export interface ForecastInterval {
  lower: number;
  median: number;
  upper: number;
}

export interface ForecastResponse {
  forecast_dates: string[];
  t1: ForecastInterval;
  t2: ForecastInterval;
  t3: ForecastInterval;
  t4: ForecastInterval;
  t5: ForecastInterval;
  last_known_price: number;
  last_known_date: string;
  calibration_factor: number;
  coverage: number;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  version: string;
}

export interface MacroIndicatorsResponse {
  records: Record<string, number | string | null>[];
  columns?: string[];
  total?: number;
}

// Derived UI types
export interface ForecastDay {
  date: string;
  price: number;
  change: number;
  changePct: number;
}

export interface MarketStats {
  currentRate: number;
  dailyChange: number;
  dailyChangePct: number;
  weeklyChange: number;
  weeklyChangePct: number;
  volatility30: number;
  dxy: number;
  gdpGrowth: number;
  inflation: number;
  sentiment: number;
  lastUpdated: string;
}

export interface HorizonAnalysisDataPoint {
  created_date: string;
  t1_forecast: number;
  t2_forecast: number;
  t3_forecast: number;
  t4_forecast: number;
  t5_forecast: number;
  t1_actual: number | null;
  t2_actual: number | null;
  t3_actual: number | null;
  t4_actual: number | null;
  t5_actual: number | null;
}

export interface HorizonAnalysisResponse {
  data: HorizonAnalysisDataPoint[];
  mae: {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    t5: number;
  };
}

export interface PerformanceComparison {
  horizon: number;
  forecast_date: string;
  forecast_price: ForecastInterval;
  actual_price: number | null;
}

export interface PerformanceRecord {
  created_date: string;
  forecast_start_date: string;
  comparisons: PerformanceComparison[];
}

export interface PerformanceResponse {
  records: PerformanceRecord[];
  total: number;
  columns: string[];
}

export interface ForecastExplanationItem {
  horizon: number;
  predicted_price: number;
  explanation: string;
  source: 'cache' | 'generated';
}

export interface SHAPDriver {
  feature: string;
  label: string;
  feature_value: number;
  shap_value: number | null;
}

export interface SentimentContribution {
  date: string;
  days_ago: number;
  decay_weight: number;
  weight_pct: number;
  article_count: number;
  headlines: string[];
  urls: string[];
}

export interface SentimentTraceSource {
  has_fresh_news: boolean;
  contributions: SentimentContribution[];
}

export interface CBSLSentiment {
  original_score: number;
  published_date: string;
  days_since_published: number;
  decayed_score: number;
  remaining_pct: number;
  is_fresh: boolean;
}

export interface SentimentTrace {
  economynext: SentimentTraceSource;
  cbsl: CBSLSentiment;
}

export interface ForecastExplanationResponse {
  created_date: string;
  items: ForecastExplanationItem[];
  shap_drivers: SHAPDriver[];
  sentiment_trace: SentimentTrace;
  source: 'cache' | 'mixed' | 'generated';
}

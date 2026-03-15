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

export interface ForecastResponse {
  forecast_dates: string[];
  forecasted_prices: number[];
  last_known_price: number;
  last_known_date: string;
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

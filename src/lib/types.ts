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

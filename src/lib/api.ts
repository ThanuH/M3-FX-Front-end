import type {
    HistoryResponse,
    MarketDataResponse,
    MarketSnapshotResponse,
    NewsResponse,
    ForecastResponse,
    HealthResponse,
    MacroIndicatorsResponse,
    HorizonAnalysisResponse,
    ForecastExplanationResponse,
    PerformanceResponse,
} from './types';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7860';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BACKEND}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>('/health');
}

export async function getPriceHistory(limit = 120): Promise<HistoryResponse> {
    return apiFetch<HistoryResponse>(`/market/history?limit=${limit}`);
}

export async function getMarketData(limit = 60): Promise<MarketDataResponse> {
    return apiFetch<MarketDataResponse>(`/market/data?limit=${limit}`);
}

export async function getMarketSnapshotToday(lookback = 60): Promise<MarketSnapshotResponse> {
    return apiFetch<MarketSnapshotResponse>(`/market/snapshot/today?lookback=${lookback}`);
}

export async function getNews(): Promise<NewsResponse> {
    return apiFetch<NewsResponse>('/market/news');
}

export async function getForecastAuto(): Promise<ForecastResponse> {
    return apiFetch<ForecastResponse>('/predict/auto');
}

export async function getMacroData(limit = 500): Promise<MacroIndicatorsResponse> {
    return apiFetch<MacroIndicatorsResponse>(`/market/macro?limit=${limit}`);
}

export async function getHorizonAnalysis(fromDate: string, toDate: string): Promise<HorizonAnalysisResponse> {
    return apiFetch<HorizonAnalysisResponse>(`/forecast/horizon-analysis?from_date=${fromDate}&to_date=${toDate}`);
}

export async function getPredictPerformance(limit = 100): Promise<PerformanceResponse> {
    return apiFetch<PerformanceResponse>(`/predict/performance?limit=${limit}`);
}

export async function getForecastExplanation(date: string): Promise<ForecastExplanationResponse> {
    return apiFetch<ForecastExplanationResponse>(`/forecasts/explain/all?date=${date}`);
}

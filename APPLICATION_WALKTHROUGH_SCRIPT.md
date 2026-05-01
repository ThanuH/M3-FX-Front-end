# M3-FX Code Walkthrough Script (3 Minutes)

## 0:00-0:15 | Entry Point and App Shell
We start from the App Router shell in `src/app/layout.tsx`.
This is the global wrapper that mounts `Navbar`, page `children`, and `Footer` for every route.
So every page shares one consistent layout, and route files only focus on feature logic.

## 0:15-0:35 | Core Data Access Layer
Next, the API abstraction is centralized in `src/lib/api.ts`.
`apiFetch` builds requests from `NEXT_PUBLIC_API_URL` and handles non-OK responses in one place.
Then we expose typed helpers like `getMarketSnapshotToday`, `getPredictPerformance`, and `getForecastExplanation`.
This keeps network logic out of UI components and makes page code cleaner.

## 0:35-1:00 | Home Route Flow
In `src/app/page.tsx`, the Home page is server-rendered.
`fetchPageData` calls `getMarketSnapshotToday(60)`, maps backend response fields into a `MarketStats` shape, and handles failure by returning `null`.
Then `computeMarketStatus` determines open or closed market state based on local day and hour.
Finally, Home composes three sections: `HeroSection`, `MarketSnapshot`, and `HowItWorks`.

## 1:00-1:45 | Forecast Route (Main Interactive Module)
Now in `src/app/forecast/page.tsx`, this is a client component using React state.
The key action is `runForecast`.
It runs two requests in parallel using `Promise.all`: `/predict/auto` and `/market/history`.
After forecast data is returned, it optionally calls `getForecastExplanation` using the forecast date.

UI state is driven by a clear status machine: `idle`, `loading`, `done`, and `error`.
On success, we render:
- `ForecastChart` for combined history plus projection
- `DayCards` for quick horizon values
- a detailed table with day-level changes
- `TradeBrief` for interpretation
- `ForecastExplanation` if available

There is also `downloadCsv`, which serializes t1 to t5 intervals into a client-side CSV blob.

## 1:45-2:10 | Accuracy Route
In `src/app/accuracy/page.tsx`, the page auto-fetches with `useEffect` on mount.
`handleFetch` calls `getPredictPerformance(limit)` and updates the same status pattern.
The result is visualized by `HorizonChart`, showing how predicted and actual behavior compare.
So this route is mainly about model validation, not forecasting.

## 2:10-2:40 | Historical Route
In `src/app/historical/page.tsx`, we fetch macro data from `/market/macro?limit=500`.
Records are sorted by year and month, then series columns are derived dynamically.
Users can switch indicators through pills, and stats are computed from selected values: latest, min, max, and percent change.
`MacroChart` renders trends, and `downloadCsv` exports the selected column.

## 2:40-2:55 | News Route
In `src/app/news/page.tsx`, the route server-fetches `getNews()` and renders headline cards.
Dates are parsed and formatted with `date-fns`, and each card links out to source articles.
Fallback handling shows an empty state when data is unavailable.

## 2:55-3:00 | Technical Close
So architecturally, this app uses:
- shared layout composition
- typed API wrappers
- route-level status-driven UI
- reusable visualization components

That gives a clean separation between data fetching, state management, and presentation across all modules.

import { getMarketSnapshotToday } from '@/lib/api';
import type { MarketStats } from '@/lib/types';
import HeroSection from '@/components/hero/HeroSection';
import MarketSnapshot from '@/components/market/MarketSnapshot';
import HowItWorks from '@/components/howItWorks/HowItWorks';

function computeMarketStatus(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

async function fetchPageData(): Promise<{ stats: MarketStats | null }> {
  try {
    const snapshot = await getMarketSnapshotToday(60);

    const stats: MarketStats = {
      currentRate: snapshot.fx.spot,
      dailyChange: snapshot.fx.daily_change.value,
      dailyChangePct: snapshot.fx.daily_change.pct,
      weeklyChange: snapshot.fx.weekly_change.value,
      weeklyChangePct: snapshot.fx.weekly_change.pct,
      volatility30: snapshot.fx.volatility_30d_annualized_pct,
      dxy: snapshot.macro.dxy_index,
      gdpGrowth: snapshot.macro.gdp_growth_pct,
      inflation: snapshot.macro.inflation_rate_pct,
      sentiment: snapshot.macro.sentiment_score,
      lastUpdated: snapshot.as_of_date,
    };

    return { stats };
  } catch {
    return { stats: null };
  }
}

export default async function Home() {
  const { stats } = await fetchPageData();
  const isOpen = computeMarketStatus();

  return (
    <>
      <HeroSection isMarketOpen={isOpen} />
      <MarketSnapshot stats={stats} />
      <HowItWorks />
    </>
  );
}

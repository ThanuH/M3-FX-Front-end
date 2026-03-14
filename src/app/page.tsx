import { getMarketData } from '@/lib/api';
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
    const marketRes = await getMarketData(60);

    const rows = marketRes.rows;
    if (!rows || rows.length < 2) return { stats: null };

    const latest = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    const prevWk = rows.length > 7 ? rows[rows.length - 7] : rows[0];

    const rate = latest.target_price;
    const ratePrev = prev.target_price;
    const rateWk = prevWk.target_price;

    const dailyChange = rate - ratePrev;
    const dailyChangePct = (dailyChange / ratePrev) * 100;
    const weeklyChange = rate - rateWk;
    const weeklyChangePct = (weeklyChange / rateWk) * 100;

    const tail30 = rows.slice(-30);
    let volatility30 = 0;
    if (tail30.length > 1) {
      const returns = tail30.slice(1).map((r, i) => (r.target_price - tail30[i].target_price) / tail30[i].target_price);
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      volatility30 = Math.sqrt(variance) * 100;
    }

    const feats = latest.features;
    const stats: MarketStats = {
      currentRate: rate,
      dailyChange,
      dailyChangePct,
      weeklyChange,
      weeklyChangePct,
      volatility30,
      dxy: feats['dxy_rate'] ?? 0,
      gdpGrowth: feats['gdp_growth'] ?? 0,
      inflation: feats['inflation'] ?? 0,
      sentiment: feats['sentiment_decay'] ?? 0,
      lastUpdated: latest.date.slice(0, 10),
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

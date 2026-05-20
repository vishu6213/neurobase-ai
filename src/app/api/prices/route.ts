import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// CoinGecko free API for live prices
// Falls back to mock data if API is unavailable (free tier rate limits)
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

const TOKEN_IDS: Record<string, string> = {
  ETH: "ethereum",
  BTC: "bitcoin",
  USDC: "usd-coin",
  DEGEN: "degen-base",
  AERO: "aerodrome-finance",
  TOSHI: "toshi",
  BRETT: "based-brett",
};

// Mock fallback prices (updated manually)
const MOCK_PRICES: Record<string, { usd: number; usd_24h_change: number }> = {
  ethereum: { usd: 2481.20, usd_24h_change: 3.24 },
  bitcoin: { usd: 67450.80, usd_24h_change: 1.89 },
  "usd-coin": { usd: 1.00, usd_24h_change: 0.01 },
  "degen-base": { usd: 0.0124, usd_24h_change: -2.31 },
  "aerodrome-finance": { usd: 1.148, usd_24h_change: 5.62 },
  toshi: { usd: 0.000451, usd_24h_change: 12.4 },
  "based-brett": { usd: 0.0834, usd_24h_change: -1.14 },
};

// 60 second cache
let cache: { data: Record<string, number>; ts: number } | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < 60_000) {
      return NextResponse.json({ prices: cache.data, source: "cache" });
    }

    const ids = Object.values(TOKEN_IDS).join(",");
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    let priceData: Record<string, { usd: number; usd_24h_change: number }>;

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        priceData = await res.json();
      } else {
        priceData = MOCK_PRICES;
      }
    } catch {
      priceData = MOCK_PRICES;
    }

    const prices: Record<string, number> = {};
    for (const [symbol, id] of Object.entries(TOKEN_IDS)) {
      prices[symbol] = priceData[id]?.usd || MOCK_PRICES[id]?.usd || 0;
    }

    cache = { data: prices, ts: now };

    return NextResponse.json({
      prices,
      changes: Object.fromEntries(
        Object.entries(TOKEN_IDS).map(([symbol, id]) => [
          symbol,
          priceData[id]?.usd_24h_change || MOCK_PRICES[id]?.usd_24h_change || 0,
        ])
      ),
      source: "live",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Prices API error:", error);
    return NextResponse.json(
      { prices: Object.fromEntries(Object.entries(MOCK_PRICES).map(([k, v]) => [k, v.usd])), source: "mock" },
      { status: 200 }
    );
  }
}

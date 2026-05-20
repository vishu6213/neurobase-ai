import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mock pricing data for Base tokens
const TOKEN_PRICES: Record<string, number> = {
  ETH: 2481.20,
  USDC: 1.00,
  USDT: 1.00,
  DEGEN: 0.0124,
  TOSHI: 0.000451,
  AERO: 1.148,
  BRETT: 0.0834,
};

export async function POST(req: Request) {
  try {
    const { fromToken, toToken, fromAmount, slippage } = await req.json();

    if (!fromToken || !toToken || !fromAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fromPrice = TOKEN_PRICES[fromToken] || 1;
    const toPrice = TOKEN_PRICES[toToken] || 1;

    const fromUSD = parseFloat(fromAmount) * fromPrice;
    const estimatedOut = fromUSD / toPrice;

    // Simulate realistic price impact (higher for smaller liquidity tokens)
    const liquidityFactor: Record<string, number> = {
      ETH: 1, USDC: 1, USDT: 1, AERO: 0.8, DEGEN: 0.5, TOSHI: 0.3, BRETT: 0.4,
    };
    const avgLiquidity = ((liquidityFactor[fromToken] || 0.5) + (liquidityFactor[toToken] || 0.5)) / 2;
    const priceImpact = Math.min(15, (fromUSD / (avgLiquidity * 1_000_000)) * 100);

    // Gas estimate (Base L2 is very cheap)
    const gasUSD = 0.01 + Math.random() * 0.02;

    // Apply slippage
    const slippagePct = parseFloat(slippage?.replace("%", "") || "0.5") / 100;
    const minimumReceived = estimatedOut * (1 - slippagePct);

    // Exchange rate
    const rate = toPrice / fromPrice;

    return NextResponse.json({
      simulation: {
        fromToken,
        toToken,
        fromAmount: parseFloat(fromAmount),
        fromUSD: fromUSD.toFixed(2),
        estimatedOut: estimatedOut.toFixed(estimatedOut < 0.01 ? 8 : 4),
        minimumReceived: minimumReceived.toFixed(estimatedOut < 0.01 ? 8 : 4),
        priceImpact: priceImpact.toFixed(3) + "%",
        gasEstimate: "$" + gasUSD.toFixed(4),
        exchangeRate: `1 ${fromToken} = ${(1 / rate).toFixed(fromToken === "ETH" ? 2 : 6)} ${toToken}`,
        slippage: slippage || "0.5%",
        route: [fromToken, toToken].join(" → "),
        protocol: fromToken === "ETH" || toToken === "ETH" ? "Aerodrome V2" : "Aerodrome V2",
        warning: priceImpact > 5 ? "High price impact detected. Consider splitting your trade." : null,
      },
    });
  } catch (error) {
    console.error("Swap simulate error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}

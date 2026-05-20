import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getOpenRouterResponse(prompt: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://neurobase.ai",
      "X-Title": "NeuroBase AI",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) throw new Error("OpenRouter request failed");
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function GET() {
  try {
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `You are a professional crypto market analyst specializing in the Base L2 ecosystem.

Today is ${today}. Generate a realistic market intelligence report for the Base ecosystem.

Provide a JSON response:
{
  "marketSentiment": "<bullish|bearish|neutral>",
  "sentimentScore": <number 0-100>,
  "summary": "<3-4 sentence market summary focusing on Base ecosystem>",
  "topNarratives": [
    {"title": "<narrative>", "description": "<description>", "momentum": "<rising|stable|fading>"}
  ],
  "keyEvents": [
    {"event": "<event title>", "impact": "<positive|negative|neutral>", "description": "<brief>"}
  ],
  "opportunities": [
    {"title": "<opportunity>", "protocol": "<protocol name>", "type": "<type>", "description": "<brief>"}
  ],
  "risks": [
    {"title": "<risk>", "severity": "<low|medium|high>", "description": "<brief>"}
  ]
}

Include 3 top narratives, 3 key events, 3 opportunities, and 2 risks. Be realistic and informative.
Respond with ONLY the JSON object.`;

    const text = await getOpenRouterResponse(prompt);


    let parsed;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    } catch {
      parsed = null;
    }

    if (!parsed) {
      parsed = {
        marketSentiment: "neutral",
        sentimentScore: 55,
        summary: "The Base ecosystem continues to show steady growth with increasing TVL and user adoption. DeFi protocols are maintaining stable liquidity while new projects launch regularly. Market conditions remain constructive but cautious.",
        topNarratives: [
          { title: "AI x Crypto Convergence", description: "AI-powered DeFi tools gaining significant traction on Base", momentum: "rising" },
          { title: "Base Ecosystem Growth", description: "Base TVL continues to grow with new protocol launches", momentum: "stable" },
          { title: "Real-World Assets on Base", description: "RWA protocols exploring Base for tokenized assets", momentum: "rising" },
        ],
        keyEvents: [
          { event: "Aerodrome V3 Update", impact: "positive", description: "New concentrated liquidity features improving capital efficiency" },
          { event: "Base Fee Reduction", impact: "positive", description: "Gas fees on Base dropped further following network optimizations" },
          { event: "Market Consolidation", impact: "neutral", description: "Prices consolidating after recent rally — accumulation phase likely" },
        ],
        opportunities: [
          { title: "AERO Liquidity Mining", protocol: "Aerodrome", type: "Yield", description: "High APY pools available on AERO/ETH pairs" },
          { title: "Moonwell Lending", protocol: "Moonwell", type: "Lending", description: "Above-average supply APY on USDC and ETH" },
          { title: "Base Native Tokens", protocol: "Various", type: "Token", description: "Base-native tokens trading at significant discount to peers" },
        ],
        risks: [
          { title: "Smart Contract Risk", severity: "medium", description: "New protocol launches without extended audits — DYOR before depositing" },
          { title: "Market Volatility", severity: "medium", description: "Broader crypto market volatility may impact Base ecosystem tokens" },
        ],
      };
    }

    return NextResponse.json({ intelligence: parsed, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json({ error: "Failed to generate market intelligence" }, { status: 500 });
  }
}

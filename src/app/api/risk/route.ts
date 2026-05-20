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

export async function POST(req: Request) {
  try {
    const { address, tokenName } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Token address required" }, { status: 400 });
    }

    const prompt = `You are a blockchain security expert specializing in token contract analysis on Base network.

Analyze the following token contract and provide a security risk assessment:
- Contract Address: ${address}
- Token Name: ${tokenName || "Unknown"}
- Network: Base (Chain ID: 8453)

Provide a JSON response with this exact structure:
{
  "riskScore": <number 0-100, where 0=safe, 100=critical>,
  "riskLevel": "<SAFE|CAUTION|DANGER|CRITICAL>",
  "summary": "<2-3 sentence risk summary>",
  "honeypotRisk": "<low|medium|high>",
  "liquidityRisk": "<low|medium|high>",
  "ownerRisk": "<low|medium|high>",
  "contractRisk": "<low|medium|high>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}

Base your assessment on common risk patterns. If you don't have specific data about this contract, provide a realistic general assessment.
Respond with ONLY the JSON object, no markdown.`;

    const text = await getOpenRouterResponse(prompt);


    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {
        riskScore: 50,
        riskLevel: "CAUTION",
        summary: "Unable to perform detailed analysis. Exercise caution with unknown contracts.",
        honeypotRisk: "medium",
        liquidityRisk: "medium",
        ownerRisk: "medium",
        contractRisk: "medium",
        recommendations: ["Verify contract on BaseScan", "Check liquidity lock status", "Research the project team"],
      };
    }

    return NextResponse.json({ analysis: parsed, address });
  } catch (error) {
    console.error("Risk API error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

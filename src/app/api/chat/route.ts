import { NextResponse } from "next/server";
import { executeAgentAction } from "@/lib/agentkit-service";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, walletContext } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // Check if the message requires an onchain action
    const onchainKeywords = ["balance", "swap", "buy", "sell", "send", "transfer", "onchain", "wallet"];
    let agentContext = "";
    
    if (onchainKeywords.some(keyword => lastMessage.toLowerCase().includes(keyword))) {
      agentContext = await executeAgentAction(lastMessage);
    }
    let walletContextPrompt = "";
    if (walletContext && walletContext.connectedAddress) {
      const tokensList = Array.isArray(walletContext.tokens) 
        ? walletContext.tokens.map((t: any) => `${t.bal} ${t.symbol} ($${t.usdValue})`).join(", ")
        : "None";
      
      const nativeSymbols: Record<string, string> = {
        base: "ETH",
        ethereum: "ETH",
        arb: "ETH",
        op: "ETH",
        bsc: "BNB",
        poly: "POL",
        avax: "AVAX",
        solana: "SOL"
      };

      const nativeList = walletContext.nativeBalances 
        ? Object.entries(walletContext.nativeBalances)
            .map(([chain, data]: [string, any]) => {
              const sym = nativeSymbols[chain.toLowerCase()] || "ETH";
              return `${chain.toUpperCase()}: ${data.bal} ${sym} (at $${data.price}/${sym})`;
            })
            .join(", ")
        : "None";

      walletContextPrompt = `
      Connected Wallet: ${walletContext.connectedAddress}
      Total Portfolio Balance (USD): $${walletContext.totalValue}
      Native Balances: ${nativeList}
      ERC-20 Token Balances: ${tokensList}
      `;
    } else {
      walletContextPrompt = "No wallet currently connected to the terminal.";
    }

    const systemPrompt = `You are NeuroBase AI, a professional senior Base blockchain developer and onchain assistant.
    You follow official Base documentation (docs.base.org) and use modern web3 standards (wagmi/viem).
    
    Connected User Wallet Details: ${walletContextPrompt}
    Current onchain context from AgentKit: ${agentContext || "No specific onchain action triggered."}
    
    Portolio Synchronization Notice:
    - If a wallet address is connected, but the balances or tokens are shown as empty or $0, it means the onchain indexer is running a background synchronization/scan. Suggest that the user wait a few seconds and try again, or switch to the Portfolio tab to verify final values.
    
    Guidelines:
    - Prioritize Base L2 ecosystem (Chain ID: 8453).
    - Suggest batch transactions for smart wallets when possible.
    - Mention low fees (~$0.01) and fast finality.
    - Always provide production-ready code snippets.
    - Keep responses concise, helpful, and professional. Use markdown for formatting.
    
    Agentic Onchain Action Capabilities:
    You have secure onchain execution powers! When a user asks you to perform an active transaction (like sending/transferring coins or swapping/trading tokens), you can prepare and request transaction execution directly inside the chat.
    To trigger an onchain action, explain briefly what transaction you have prepared, and then append EXACTLY ONE of the following XML blocks at the very end of your message:

    1. For Token Transfers (ETH or ERC-20 tokens):
    <onchain_action>
    {
      "type": "transfer",
      "to": "0xRecipientAddress",
      "amount": "0.01",
      "symbol": "ETH"
    }
    </onchain_action>

    2. For Token Swaps (via Odos Smart Router):
    <onchain_action>
    {
      "type": "swap",
      "fromToken": "ETH",
      "toToken": "USDC",
      "amount": "0.05"
    }
    </onchain_action>

    Rules for Actions:
    - Only generate an action block if the user explicitly requests a transfer or swap.
    - For transfers, if the recipient address is missing or invalid, do NOT output the action block. Ask the user for the address first.
    - Support symbols such as: ETH, USDC, DEGEN, AERO, WETH.
    - The JSON payload inside the <onchain_action> tag must be valid and contain exactly the fields listed above.`;

    const openRouterKey = process.env.OPENROUTER_API_KEY?.replace(/^["']|["']$/g, '');
    const googleApiKey = process.env.GOOGLE_AI_API_KEY?.replace(/^["']|["']$/g, '');

    let response: Response;
    let isGeminiDirect = false;

    if (openRouterKey) {
      try {
        console.log("[AI Chat] Attempting OpenRouter stream...");
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "HTTP-Referer": "https://neurobase.ai",
            "X-Title": "NeuroBase AI",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: any) => ({
                role: m.role,
                content: m.content
              }))
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error");
          console.warn("[AI Chat] OpenRouter call failed:", errText);
          throw new Error(`OpenRouter failed: ${errText}`);
        }
      } catch (err) {
        if (googleApiKey) {
          console.log("[AI Chat] OpenRouter failed, falling back to direct Google Gemini API...");
          isGeminiDirect = true;
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${googleApiKey}&alt=sse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                ...messages.map((m: any) => ({
                  role: m.role === "assistant" ? "model" : "user",
                  parts: [{ text: m.content }]
                }))
              ]
            })
          });
        } else {
          throw err;
        }
      }
    } else if (googleApiKey) {
      console.log("[AI Chat] OpenRouter Key missing, using direct Google Gemini API...");
      isGeminiDirect = true;
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${googleApiKey}&alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...messages.map((m: any) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            }))
          ]
        })
      });
    } else {
      throw new Error("No valid AI API keys found. Please set OPENROUTER_API_KEY or GOOGLE_AI_API_KEY.");
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      console.error("[AI Chat] API request failed completely:", errText);
      throw new Error(`AI API request failed: ${errText}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body?.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) return;
        
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const cleanLine = line.trim();
              if (cleanLine === "" || cleanLine === "data: [DONE]") continue;
              if (cleanLine.startsWith("data: ")) {
                try {
                  const json = JSON.parse(cleanLine.substring(6));
                  let content = "";
                  if (isGeminiDirect) {
                    content = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  } else {
                    content = json.choices?.[0]?.delta?.content || "";
                  }
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error("AI Chat Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to process chat";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}



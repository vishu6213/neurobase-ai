"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export function TradingViewWidget({ symbol, network, pairAddress }: { symbol: string, network: string, pairAddress?: string }) {
  const [resolvedPair, setResolvedPair] = useState<{address: string, chainId: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const container = useRef<HTMLDivElement>(null);

  // Major tokens that are guaranteed to exist on Binance or other major CEXs
  const MAJOR_CEX_TOKENS = [
    "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "LINK", 
    "TRX", "SHIB", "BCH", "LTC", "NEAR", "APT", "ICP", "STX", "UNI", "ATOM", "XMR",
    "TON", "SUI", "SEI", "INJ", "RNDR", "FET", "AR", "OP", "ARB", "TIA", "MATIC", 
    "POL", "FTM", "PEPE", "WIF", "BONK", "FLOKI", "IMX", "TAO", "KAS", "XLM", "HBAR", "VET", "MKR"
  ];
  const STABLECOINS = ["USDT", "USDC", "DAI", "FDUSD", "TUSD", "USDE"];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const isMajor = MAJOR_CEX_TOKENS.includes(symbol.toUpperCase());
    const isStable = STABLECOINS.includes(symbol.toUpperCase());

    // If we already have a pairAddress, or it's a major token that we prefer to show on TradingView, skip DexScreener fetch
    if (pairAddress) {
       setResolvedPair({ address: pairAddress, chainId: network.toLowerCase() });
       setLoading(false);
       return;
    }

    if (isMajor || isStable) {
       setResolvedPair(null);
       setLoading(false);
       return;
    }

    // Try to resolve unknown CoinGecko tokens (like OKB, CRO, KAS) via DexScreener
    fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`)
      .then(res => res.json())
      .then(data => {
         if (!isMounted) return;
         if (data?.pairs && data.pairs.length > 0) {
            // Find highest volume pair that matches the symbol exactly
            const exactMatches = data.pairs.filter((p:any) => p.baseToken?.symbol?.toUpperCase() === symbol.toUpperCase());
            const pairsToUse = exactMatches.length > 0 ? exactMatches : data.pairs;
            const bestPair = pairsToUse.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];
            setResolvedPair({ address: bestPair.pairAddress, chainId: bestPair.chainId });
         } else {
            setResolvedPair(null);
         }
         setLoading(false);
      })
      .catch(() => {
         if (isMounted) setLoading(false);
      });

      return () => { isMounted = false; };
  }, [symbol, network, pairAddress]);

  // Handle TradingView Script injection
  useEffect(() => {
    if (loading || resolvedPair || !container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const symUpper = symbol.toUpperCase();
    let tvSymbol = `BINANCE:${symUpper}USDT`;
    if (STABLECOINS.includes(symUpper)) {
       tvSymbol = `COINBASE:${symUpper}USD`;
    } else if (!MAJOR_CEX_TOKENS.includes(symUpper) && !STABLECOINS.includes(symUpper)) {
       // Absolute fallback if DexScreener failed and it's not a major token
       tvSymbol = `MEXC:${symUpper}USDT`; 
    }
    
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": tvSymbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(0, 0, 0, 1)",
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "withdateranges": true,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "save_image": false,
      "calendar": false,
      "show_popup_button": true,
      "popup_width": "1000",
      "popup_height": "650",
      "support_host": "https://www.tradingview.com"
    });
    
    container.current.innerHTML = "";
    container.current.appendChild(script);
  }, [symbol, loading, resolvedPair]);

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center bg-[#0a0a0a] rounded-2xl border border-white/10"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (resolvedPair) {
     return (
       <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
          <iframe 
             src={`https://dexscreener.com/${resolvedPair.chainId}/${resolvedPair.address}?embed=1&theme=dark&trades=0&info=0`}
             className="w-full h-full border-0"
          />
       </div>
     );
  }

  return (
    <div className="tradingview-widget-container h-full w-full flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]" ref={container}>
       <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

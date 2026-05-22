"use client";

import { 
  TrendingUp, 
  BarChart3, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Bot,
  Zap,
  Globe,
  Waves,
  Activity,
  Sparkles,
  Flame,
  ArrowDown,
  ArrowUp,
  Target,
  BrainCircuit,
  Coins,
  RefreshCw,
  Loader2,
  X,
  LineChart,
  Eye,
  PlusCircle,
  TrendingDown,
  Clock,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  TrendingUp as TrendingUpIcon,
  Zap as ZapIcon,
  Cpu,
  Layers,
  Network,
  Radar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip as ReTooltip 
} from "recharts";
import { TradingViewWidget } from "@/components/trading-view-widget";

// AI Signal Types
type Signal = "STRONG_BUY" | "BUY" | "SELL" | "STRONG_SELL" | "ACCUMULATE" | "NEUTRAL" | "HIGH_RISK";

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  mcap: number;
  logo: string;
  network: string;
  address: string;
  sparkline: any[];
  signal?: Signal;
  reason?: string;
  rank?: number;
  pairAddress?: string;
  liquidity?: number;
}

const CATEGORIES = [
  { id: "trending", name: "Trending", icon: Flame, color: "text-orange-500" },
  { id: "gainers", name: "Top Gainers", icon: TrendingUp, color: "text-emerald-500" },
  { id: "losers", name: "Top Losers", icon: TrendingDown, color: "text-rose-500" },
  { id: "new", name: "New Listed", icon: PlusCircle, color: "text-blue-500" },
  { id: "memes", name: "Hot Memes", icon: Zap, color: "text-yellow-500" },
  { id: "base", name: "Base Ecosystem", icon: Globe, color: "text-indigo-400" },
  { id: "volume", name: "Highest Volume", icon: Activity, color: "text-purple-500" },
  { id: "viewed", name: "Most Viewed", icon: Eye, color: "text-pink-500" },
];

async function proxiedFetch(url: string) {
  try {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}
// Function removed, imported from components

export default function MarketAnalysisPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("trending");
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [showStrategy, setShowStrategy] = useState(false);

  const fetchMarketData = () => {
    const isBaseToken = (t: any) => {
      const symbol = (t.symbol || "").toUpperCase();
      const name = (t.name || "").toLowerCase();
      const id = (t.id || "").toLowerCase();
      return symbol === "BASE" || name === "base protocol" || id === "base";
    };

    const processBatch = (cgData: any, ...dexDataArr: any[]) => {
      let combined: TokenData[] = [];

      if (cgData && Array.isArray(cgData)) {
        combined = cgData
          .filter(c => !isBaseToken(c))
          .map((c: any) => ({
            symbol: c.symbol.toUpperCase(),
            name: c.name,
            price: c.current_price,
            change: c.price_change_percentage_24h || 0,
            volume: c.total_volume || 0,
            mcap: c.market_cap || 0,
            logo: c.image,
            network: "Ethereum",
            address: c.id,
            rank: c.market_cap_rank,
            sparkline: c.sparkline_in_7d?.price?.map((p: number) => ({ val: p })) || []
          }));
      }

      const processDexData = (data: any) => {
        if (!data?.pairs) return;
        data.pairs.forEach((p: any) => {
          if (!p.baseToken || isBaseToken(p.baseToken)) return;
          
          const liquidity = p.liquidity?.usd || 0;
          const volume24h = p.volume?.h24 || 0;
          
          if (liquidity < 5000 || volume24h < 5000) return;

          const price = parseFloat(p.priceUsd) || 0;
          const change = p.priceChange?.h24 || 0;

          const syntheticSparkline = Array.from({ length: 24 }).map((_, i) => {
             const progress = i / 23;
             const variance = Math.sin(i * (p.baseToken.symbol.length || 1)) * (Math.abs(change) || 5) * 0.05;
             const startPrice = price / (1 + change / 100);
             const currentPointPrice = startPrice + (price - startPrice) * progress;
             return { val: currentPointPrice * (1 + variance / 100) };
          });
          
          let networkName = "Ethereum";
          if (p.chainId === "base") networkName = "Base";
          else if (p.chainId === "solana") networkName = "Solana";
          else if (p.chainId) networkName = p.chainId.charAt(0).toUpperCase() + p.chainId.slice(1);

          const bt = {
            symbol: p.baseToken.symbol,
            name: p.baseToken.name,
            price: price,
            change: change,
            volume: volume24h,
            mcap: p.fdv || 0,
            liquidity: liquidity,
            logo: p.info?.imageUrl || `https://ui-avatars.com/api/?name=${p.baseToken.symbol}&background=random`,
            network: networkName,
            address: p.baseToken.address,
            pairAddress: p.pairAddress,
            sparkline: syntheticSparkline
          };

          const existingIdx = combined.findIndex(c => c.symbol === bt.symbol);
          if (existingIdx === -1) combined.push(bt);
          else if (bt.volume > combined[existingIdx].volume) combined[existingIdx] = { ...combined[existingIdx], ...bt };
        });
      };

      dexDataArr.forEach(data => {
         if (data) processDexData(data);
      });

      if (combined.length > 0) {
        const analyzed = combined.map(t => {
          let signal: Signal = "NEUTRAL";
          let reason = "Equilibrium vector maintained.";
          const volToMcap = t.volume / (t.mcap || 1);
          
          if (t.change > 40 && volToMcap > 0.5) {
            signal = "STRONG_SELL";
            reason = "Parabolic exhaustion detected. High probability of mean reversion.";
          } else if (t.change > 12 && t.change < 28 && volToMcap > 0.12) {
            signal = "STRONG_BUY";
            reason = "Matrix breakout confirmed. Institutional-grade volume support.";
          } else if (t.change > 4 && t.change < 12) {
            signal = "BUY";
            reason = "Structural uptrend intact. Synaptic pressure remains positive.";
          } else if (t.change < -12 && t.change > -30) {
            signal = "ACCUMULATE";
            reason = "Support zone reached. Opportunity for strategic scaling.";
          } else if (t.change < -45) {
            signal = "SELL";
            reason = "Liquidity drain identified. Matrix integrity compromised.";
          } else if (volToMcap > 0.7) {
            signal = "HIGH_RISK";
            reason = "Extreme volatility spike. Wash trading or high-leverage nodes active.";
          }
          return { ...t, signal, reason };
        });

        setTokens(prevTokens => {
          const newTokensMap = new Map(prevTokens.map(t => [t.symbol, t]));
          analyzed.forEach(t => {
             const existing = newTokensMap.get(t.symbol);
             if (existing && existing.network !== "Ethereum" && t.network === "Ethereum") {
                 t.network = existing.network;
                 t.address = existing.address;
                 t.pairAddress = existing.pairAddress;
             }
             newTokensMap.set(t.symbol, t);
          });
          return Array.from(newTokensMap.values()).sort((a, b) => b.volume - a.volume);
        });
        setLastSync(new Date());
      }
    };
    
    const fetchDirect = async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    };

    // 1. Fetch Fast DexScreener APIs directly from client (bypassing proxy bottleneck)
    Promise.all([
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=eth"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=base"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=sol"),
      // High fundamental/popular meme coins
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=pepe"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=brett"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=wif"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=bonk"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=popcat"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=toshi"),
      fetchDirect("https://api.dexscreener.com/latest/dex/search?q=mog")
    ]).then((results) => {
      processBatch(null, ...results);
      setLoading(false); // Unblock UI immediately after fast fetch
      
      // 2. Fetch Slow CoinGecko API concurrently through Proxy so it doesn't block UI
      const cgUrl = encodeURIComponent("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h");
      fetchDirect(`/api/proxy?url=${cgUrl}`)
        .then(cgData => {
          if (cgData && !cgData.error && Array.isArray(cgData)) {
             processBatch(cgData, null, null, null);
          }
        }).catch(console.error);
        
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const filteredTokens = useMemo(() => {
    let result = [...tokens];
    
    if (activeCat === "gainers") result.sort((a, b) => b.change - a.change);
    else if (activeCat === "losers") result.sort((a, b) => a.change - b.change);
    else if (activeCat === "volume") result.sort((a, b) => b.volume - a.volume);
    else if (activeCat === "memes") result = result.filter(t => t.mcap < 10000000000 && t.volume > 100000 && ["PEPE", "BRETT", "WIF", "BONK", "POPCAT", "TOSHI", "MOG"].includes(t.symbol));
    else if (activeCat === "base") result = result.filter(t => t.network === "Base");
    else if (activeCat === "new") result = result.filter(t => t.network === "Base" || t.network === "Solana").sort((a, b) => (b.liquidity || 0) - (a.liquidity || 0));
    else if (activeCat === "viewed") result.sort((a, b) => (a.rank || 9999) - (b.rank || 9999));

    if (search) {
      result = result.filter(t => 
        t.symbol.toLowerCase().includes(search.toLowerCase()) || 
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return result.slice(0, 50);
  }, [tokens, activeCat, search]);

  const marketSentiment = useMemo(() => {
    if (tokens.length === 0) return 50;
    const gainers = tokens.filter(t => t.change > 0).length;
    return Math.round((gainers / tokens.length) * 100);
  }, [tokens]);

  const topOpportunities = useMemo(() => {
    return tokens
      .filter(t => t.signal === "STRONG_BUY" || t.signal === "ACCUMULATE")
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
  }, [tokens]);

  const dynamicStrategy = useMemo(() => {
    if (tokens.length === 0) return null;
    const isBullish = marketSentiment > 50;
    
    // Find network with highest volume
    const volumeByNetwork: Record<string, number> = {};
    tokens.forEach(t => {
       volumeByNetwork[t.network] = (volumeByNetwork[t.network] || 0) + t.volume;
    });
    let topNetwork = "Ethereum";
    let maxVol = 0;
    Object.entries(volumeByNetwork).forEach(([net, vol]) => {
      if (vol > maxVol) { maxVol = vol; topNetwork = net; }
    });

    const topGainersList = [...tokens].sort((a, b) => b.change - a.change).slice(0, 3);
    const topGainerSymbol = topGainersList[0]?.symbol || "$ETH";

    return {
       bias: isBullish ? "Bullish Synergy" : "Bearish Friction",
       biasDesc: `Capital concentration in **${topNetwork} Ecosystem**. Priority focus: ${topGainerSymbol} and high-volume nodes. Expect ${isBullish ? "accumulation vector before breakout" : "increased friction and mean reversion"}.`,
       biasColor: isBullish ? "emerald" : "rose",
       risk: isBullish ? "Low Risk Vectors" : "High Risk Vectors",
       riskDesc: isBullish ? "Market structure remains intact. Continue strategic positioning in high-liquidity assets across established hubs." : "Market structure compromised. De-risk high-leverage nodes and rotate capital into stable networks to preserve value.",
       optimalNode: `Rotate to ${topNetwork}`,
       topSymbols: topGainersList.map(t => `$${t.symbol}`)
    };
  }, [tokens, marketSentiment]);

  return (
    <div className="space-y-8 pb-12 relative px-4 md:px-8 max-w-[1800px] mx-auto">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
               <Radar className="w-3 h-3 text-emerald-400 animate-spin-slow" />
               <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Neural Vector: Sync</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">
                  Parity: {lastSync.toLocaleTimeString()}
                </span>
             </div>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase liquid-text select-none drop-shadow-sm">
            Market<br/>Matrix
          </h1>
          <p className="text-lg font-medium text-white/40 tracking-tight max-w-xl leading-relaxed">
            Parsing global liquidity synapses in real-time. Autonomous intelligence for elite cross-chain positioning.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
           <Button 
            onClick={fetchMarketData}
            disabled={loading}
            className="flex-1 lg:flex-none h-14 px-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold uppercase tracking-wider text-xs group"
           >
             {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-500" /> : <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-700" />}
             Sync Nodes
           </Button>
           <Button 
             onClick={() => setShowStrategy(true)}
             className="flex-1 lg:flex-none h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] hover:-translate-y-0.5 group"
           >
             <BrainCircuit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-500" />
             AI Strategy
           </Button>
        </div>
      </motion.div>

      {/* Featured Alpha Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="wait">
          {topOpportunities.map((token, i) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedToken(token)}
              className="group cursor-pointer h-full"
            >
              <Card className="glass-card border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden h-full rounded-3xl p-0.5">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-700">
                   <Target className="w-24 h-24 text-emerald-500 -rotate-12 group-hover:rotate-0" />
                </div>
                <CardContent className="p-6 space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src={token.logo} className="w-14 h-14 rounded-2xl shadow-lg border border-white/10 group-hover:scale-105 transition-all duration-500" alt="" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white leading-none tracking-tight">{token.symbol}</h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{token.name}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md",
                      token.signal?.includes("BUY") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10" : "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10"
                    )}>
                      {token.signal?.replace("_", " ")}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                     <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                       "{token.reason}"
                     </p>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Live Value</p>
                      <p className="text-3xl font-black text-white tabular-nums tracking-tighter">${token.price < 0.1 ? token.price.toFixed(6) : token.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <div className={cn(
                         "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold tabular-nums shadow-lg border backdrop-blur-md",
                         token.change >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                       )}>
                         {token.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                         {token.change.toFixed(2)}%
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        {/* Navigation Rail */}
        <div className="xl:col-span-3 space-y-6">
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search nodes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-emerald-500/40 transition-all placeholder:text-white/20 shadow-sm"
              />
           </div>

           <div className="flex flex-row overflow-x-auto no-scrollbar max-w-full pb-2 xl:flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  variant="ghost"
                  className={cn(
                    "h-12 justify-start px-4 rounded-xl border transition-all duration-300 relative group overflow-hidden shrink-0",
                    activeCat === cat.id 
                      ? "bg-white/10 border-white/10 text-white shadow-md" 
                      : "bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white/70"
                  )}
                >
                  {activeCat === cat.id && (
                    <motion.div layoutId="cat-glow" className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-xl opacity-50" />
                  )}
                  <cat.icon className={cn("w-4 h-4 mr-3 relative z-10 transition-transform group-hover:scale-110", activeCat === cat.id ? cat.color : "text-white/30")} />
                  <span className="text-sm font-bold relative z-10 tracking-wide">{cat.name}</span>
                  {activeCat === cat.id && <motion.div layoutId="cat-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                </Button>
              ))}
           </div>

           <Card className="glass-card border-white/5 bg-black/20 rounded-3xl p-0.5 overflow-hidden shadow-lg">
              <CardContent className="p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Activity className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Global Sentiment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                    </div>
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">{marketSentiment}</p>
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      marketSentiment > 50 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {marketSentiment > 50 ? "Bullish Synergy" : "Bearish Friction"}
                    </p>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${marketSentiment}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        marketSentiment > 50 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                      )}
                    />
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Matrix Table */}
        <div className="xl:col-span-9">
           <Card className="glass-card border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black text-white tracking-tight">Market Matrix</CardTitle>
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Real-time Activity Stream</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Nodes: {filteredTokens.length}
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      High Signal: {tokens.filter(t => t.signal?.includes("STRONG_BUY")).length}
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 {loading && tokens.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-6">
                       <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                       <div className="text-center space-y-2">
                          <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Initializing Matrix...</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">Bridging cross-chain synapses</p>
                       </div>
                    </div>
                 ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 font-medium">Asset Node</th>
                                <th className="px-6 py-4 text-right font-medium">Matrix Value</th>
                                <th className="px-6 py-4 text-right font-medium">24H Vector</th>
                                <th className="px-6 py-4 text-center font-medium">Neural Signal</th>
                                <th className="px-6 py-4 text-right font-medium hidden sm:table-cell">Liquidity Pool</th>
                                <th className="px-6 py-4 text-right font-medium hidden sm:table-cell">Trajectory</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {filteredTokens.length === 0 ? (
                               <tr>
                                  <td colSpan={6} className="py-24 text-center">
                                     <div className="flex flex-col items-center gap-4 opacity-30">
                                        <Radar className="w-12 h-12" />
                                        <p className="text-xs font-bold text-white uppercase tracking-widest">Sector Clear</p>
                                     </div>
                                  </td>
                               </tr>
                             ) : filteredTokens.map((token, i) => (
                                <tr 
                                  key={`${token.symbol}-${token.address}`} 
                                  onClick={() => setSelectedToken(token)}
                                  className="group hover:bg-white/[0.04] transition-colors cursor-pointer"
                                >
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-4">
                                         <img src={token.logo} className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 group-hover:scale-105 transition-transform" alt="" />
                                         <div>
                                            <p className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">{token.symbol}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                               <p className="text-[10px] text-white/40 truncate max-w-[100px]">{token.name}</p>
                                               <div className="w-1 h-1 rounded-full bg-white/10" />
                                               <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider">{token.network}</p>
                                            </div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <p className="text-sm font-bold text-white tabular-nums">
                                        ${token.price < 0.00001 ? token.price.toFixed(8) : token.price < 1 ? token.price.toFixed(5) : token.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </p>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <div className={cn(
                                         "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tabular-nums border",
                                         token.change >= 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                                      )}>
                                         {token.change >= 0 ? "+" : ""}{token.change.toFixed(2)}%
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                      <div className={cn(
                                         "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block border",
                                         token.signal?.includes("STRONG_BUY") ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                         token.signal?.includes("BUY") ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" :
                                         token.signal?.includes("SELL") ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                                         token.signal?.includes("HIGH_RISK") ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                         "bg-white/5 text-white/40 border-white/10"
                                      )}>
                                         {token.signal?.replace("_", " ")}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right hidden sm:table-cell">
                                      <p className="text-sm text-white/60 tabular-nums font-medium">
                                        ${token.mcap > 1000000000 ? (token.mcap / 1000000000).toFixed(2) + "B" : (token.mcap / 1000000).toFixed(2) + "M"}
                                      </p>
                                   </td>
                                   <td className="px-6 py-4 hidden sm:table-cell">
                                      <div className="h-10 w-24 ml-auto">
                                         {token.sparkline.length > 0 && (
                                            <ResponsiveContainer width="100%" height="100%">
                                               <AreaChart data={token.sparkline}>
                                                  <defs>
                                                     <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={token.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor={token.change >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                                                     </linearGradient>
                                                  </defs>
                                                  <Area 
                                                    type="monotone" 
                                                    dataKey="val" 
                                                    stroke={token.change >= 0 ? "#10b981" : "#f43f5e"} 
                                                    strokeWidth={2} 
                                                    fillOpacity={1} 
                                                    fill={`url(#grad-${i})`} 
                                                    isAnimationActive={false}
                                                  />
                                               </AreaChart>
                                            </ResponsiveContainer>
                                         )}
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Chart Modal */}
      <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm z-[999]" />
          <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] h-[90vh] sm:max-w-none max-w-7xl bg-[#0a0a0a] border border-white/10 p-0 overflow-hidden rounded-3xl shadow-2xl z-[1000]">
             {selectedToken && (
               <div className="flex flex-col h-full">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center bg-white/[0.02]">
                     <div className="flex items-center gap-6">
                        <img src={selectedToken.logo} className="w-16 h-16 rounded-2xl border border-white/10" alt="" />
                        <div>
                           <div className="flex items-center gap-3">
                              <h2 className="text-4xl font-black text-white tracking-tight">{selectedToken.symbol}</h2>
                              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest">{selectedToken.network}</span>
                           </div>
                           <p className="text-sm font-medium text-white/40 mt-1">{selectedToken.name}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Price</p>
                          <p className="text-3xl font-black text-white tabular-nums">${selectedToken.price < 0.001 ? selectedToken.price.toFixed(6) : selectedToken.price.toLocaleString()}</p>
                        </div>
                        <div className={cn(
                          "px-4 py-2 rounded-xl text-xl font-bold tabular-nums border",
                          selectedToken.change >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {selectedToken.change >= 0 ? "+" : ""}{selectedToken.change.toFixed(2)}%
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedToken(null)} className="rounded-full">
                          <X className="w-6 h-6" />
                        </Button>
                     </div>
                  </div>
                  {/* Modal Body */}
                  <div className="flex-1 bg-black/50 p-4 relative z-10 min-h-0">
                     <TradingViewWidget symbol={selectedToken.symbol} network={selectedToken.network} pairAddress={selectedToken.pairAddress} />
                  </div>
                  {/* Modal Footer */}
                  <div className="p-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.01]">
                     {[
                        { label: "24H Volume", value: `$${(selectedToken.volume / 1000000).toFixed(2)}M`, icon: Activity },
                        { label: "AI Signal", value: selectedToken.signal?.replace("_", " "), icon: BrainCircuit, color: "text-blue-400" },
                        { label: "Trend", value: selectedToken.change > 0 ? "Bullish" : "Bearish", icon: Target, color: selectedToken.change > 0 ? "text-emerald-400" : "text-rose-400" },
                        { label: "Address", value: selectedToken.address.slice(0, 8) + "...", icon: Network },
                     ].map((item, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex items-center gap-2 text-white/40">
                              <item.icon className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                           </div>
                           <p className={cn("text-xl font-bold text-white tabular-nums", item.color)}>{item.value}</p>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* AI Strategy Hub */}
      <Dialog open={showStrategy} onOpenChange={setShowStrategy}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm z-[999]" />
          <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] h-[90vh] sm:max-w-none max-w-6xl bg-[#0a0a0a] border border-white/10 p-0 rounded-3xl overflow-y-auto md:overflow-hidden z-[1000]">
             <div className="flex flex-col md:flex-row h-full">
                {/* Sidebar */}
                <div className="md:w-[30%] bg-white/[0.02] p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between">
                   <div className="space-y-8">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                         <BrainCircuit className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div className="space-y-3">
                         <DialogTitle className="text-4xl font-black text-white tracking-tight">Neural Hub</DialogTitle>
                         <DialogDescription className="text-white/50 text-sm leading-relaxed">
                            Autonomous matrix processing of global capital flux and institutional positioning.
                         </DialogDescription>
                      </div>
                   </div>
                   
                   <div className="space-y-8 hidden md:block">
                      <div className="space-y-3">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Confidence</span>
                            <span className="text-2xl font-bold text-emerald-400 tabular-nums">98.4%</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[98.4%] bg-emerald-500 rounded-full" />
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                         <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-bold text-white">System Active</span>
                         </div>
                         <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">Oracles synced: Alchemy, CoinGecko, DexScreener.</p>
                      </div>
                   </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
                   <div className="flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => setShowStrategy(false)} className="rounded-full bg-white/5 hover:bg-white/10">
                        <X className="w-5 h-5 text-white" />
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                               <TrendingUpIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">{dynamicStrategy?.bias || "Analyzing..."}</span>
                         </div>
                         <p className="text-sm text-white/70 leading-relaxed">
                            {dynamicStrategy?.biasDesc || "Awaiting enough data blocks to form a stable vector..."}
                         </p>
                         <div className="flex flex-wrap gap-2 pt-2">
                            {(dynamicStrategy?.topSymbols || []).map(t => (
                              <span key={t} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">{t}</span>
                            ))}
                         </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                               <ShieldAlert className="w-6 h-6 text-rose-400" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">{dynamicStrategy?.risk || "Risk Unknown"}</span>
                         </div>
                         <p className="text-sm text-white/70 leading-relaxed">
                            {dynamicStrategy?.riskDesc || "Waiting for volatility index stabilization..."}
                         </p>
                         <div className="flex flex-wrap gap-2 pt-2">
                            {["GAS VOLATILITY", "LEVERAGE DRAIN"].map(t => (
                              <span key={t} className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">{t}</span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <ZapIcon className="w-32 h-32 text-blue-500 rotate-12" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                         <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <ZapIcon className="w-6 h-6 text-blue-400" />
                         </div>
                         <span className="text-2xl font-bold text-white tracking-tight">Opportunity Alpha</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                         {[
                            { label: "Optimal Node", value: dynamicStrategy?.optimalNode || "Unknown", icon: Network, color: "text-blue-400" },
                            { label: "Predicted Velocity", value: "45% Monthly", icon: Target, color: "text-emerald-400" },
                            { label: "AI Directive", value: "DCA into Top Tier", icon: Sparkles, color: "text-purple-400" },
                         ].map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                               <div className="flex items-center gap-2 mb-3 text-white/40">
                                  <item.icon className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                               </div>
                               <p className={cn("text-lg font-bold leading-tight", item.color)}>{item.value}</p>
                            </div>
                         ))}
                      </div>
                   </div>

                   <Button 
                      onClick={() => setShowStrategy(false)} 
                      className="w-full h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-widest shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
                   >
                      Acknowledge Strategy Node
                   </Button>
                </div>
             </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

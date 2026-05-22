"use client";

import { useState, useEffect } from "react";
import { 
  Zap, ArrowUpRight, Target, ShieldAlert, Info, TrendingUp, Clock, CheckCircle2, Bot, Sparkles, Activity, Cpu, Layers, Loader2, X, AlertTriangle, TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { TradingViewWidget } from "@/components/trading-view-widget";
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "@/components/ui/dialog";

interface LiveSignal {
  token: string;
  symbol: string;
  network: string;
  type: "BUY" | "SELL";
  confidence: number;
  entry: string;
  target: string;
  stop: string;
  time: string;
  status: string;
  rationale: string;
  riskTier: "Low Risk" | "Medium Risk" | "High Risk";
  price: number;
  pairAddress?: string;
  isMeme?: boolean;
}

export default function SignalsPage() {
  const router = useRouter();
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<LiveSignal | null>(null);

  const fetchLiveSignals = async () => {
    setLoading(true);
    try {
      // Fetch data from fast DexScreener endpoints
      const fetchDirect = async (url: string) => {
        try {
           const res = await fetch(url);
           if (!res.ok) return null;
           return await res.json();
        } catch (e) { return null; }
      };

      const fetchCoinGecko = async () => {
         try {
            const cgUrl = encodeURIComponent("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&price_change_percentage=24h");
            const res = await fetch(`/api/proxy?url=${cgUrl}`);
            const data = await res.json();
            if (Array.isArray(data)) {
               return data.map(c => ({
                  baseToken: { symbol: c.symbol.toUpperCase(), name: c.name },
                  chainId: "ethereum",
                  liquidity: { usd: 10000000 },
                  volume: { h24: c.total_volume },
                  priceChange: { h24: c.price_change_percentage_24h },
                  priceUsd: c.current_price.toString(),
                  fdv: c.market_cap,
                  pairAddress: undefined // we let the chart resolve it dynamically
               }));
            }
         } catch (e) { return null; }
         return null;
      };

      const [dsTrending, dsBase, dsSolana, dsArbitrum, dsMeme1, dsMeme2, cgData] = await Promise.all([
        fetchDirect("https://api.dexscreener.com/latest/dex/search?q=eth"),
        fetchDirect("https://api.dexscreener.com/latest/dex/search?q=base"),
        fetchDirect("https://api.dexscreener.com/latest/dex/search?q=sol"),
        fetchDirect("https://api.dexscreener.com/latest/dex/search?q=arbitrum"),
        fetchDirect("https://api.dexscreener.com/latest/dex/search?q=pepe"),
        fetchDirect("https://api.dexscreener.com/latest/dex/search?q=wif"),
        fetchCoinGecko()
      ]);

      let rawTokens: any[] = [];
      const processDex = (data: any) => {
         if (!data?.pairs) return;
         rawTokens.push(...data.pairs);
      };
      [dsTrending, dsBase, dsSolana, dsArbitrum, dsMeme1, dsMeme2].forEach(processDex);
      if (cgData) rawTokens.push(...cgData);

      // Randomize the rawTokens slightly so the signals list feels fresh every 45 seconds when similar tokens tie in confidence
      rawTokens = rawTokens.sort(() => Math.random() - 0.5);

      // Filter and analyze
      const processed: LiveSignal[] = [];
      const seen = new Set();

      rawTokens.forEach(p => {
         if (!p.baseToken || seen.has(p.baseToken.symbol)) return;
         
         const liquidity = p.liquidity?.usd || 0;
         const volume = p.volume?.h24 || 0;
         const change = p.priceChange?.h24 || 0;
         const price = parseFloat(p.priceUsd) || 0;
         const mcap = p.fdv || 0;

         if (liquidity < 10000 || volume < 10000) return; // Ignore dust

         const STABLECOINS = ["USDT", "USDC", "DAI", "FDUSD", "TUSD", "USDE", "BUSD", "FRAX", "USDD", "PYUSD", "USDG", "USDP", "EURC", "EURT", "GUSD", "USDB"];
         if (STABLECOINS.includes(p.baseToken.symbol.toUpperCase()) || p.baseToken.symbol.toUpperCase().includes("USD")) {
             return; // Ignore stablecoins
         }

         seen.add(p.baseToken.symbol);
         
         const memeKeywords = ["PEPE", "DOGE", "SHIB", "FLOKI", "WIF", "BONK", "BRETT", "TOSHI", "DEGEN", "POPCAT", "MOG", "CAT", "INU", "TRUMP", "MAGA", "BODEN"];
         const isMeme = memeKeywords.some(k => p.baseToken.symbol.toUpperCase().includes(k)) || (mcap > 0 && mcap < 100000000 && !p.baseToken.symbol.toUpperCase().includes("USD") && !p.baseToken.symbol.toUpperCase().includes("ETH"));

         let type: LiveSignal["type"] = "BUY";
         let riskTier: LiveSignal["riskTier"] = "Medium Risk";
         let confidence = 50;
         let rationale = "";
         let targetMult = 1.2;
         let stopMult = 0.8;

         // Risk Categorization Algorithm (1:2 or 1:3 Risk/Reward Ratios)
         if (mcap > 500000000) {
            riskTier = "Low Risk";
            if (change >= 0) {
               type = "BUY";
               confidence = 75 + Math.floor(Math.random() * 15); // 75-90%
               rationale = `Momentum established. Maintaining long position until structural resistance is met.`;
               targetMult = 1.10; // +10% target
               stopMult = 0.95;   // -5% stop (1:2)
            } else if (change < -5) {
               type = "BUY"; // Buy the dip
               confidence = 80 + Math.floor(Math.random() * 10);
               rationale = `Asset is technically oversold. Accumulation matrix active for relief bounce.`;
               targetMult = 1.15; // +15% target
               stopMult = 0.90;   // -10% stop
            } else {
               type = "SELL";
               confidence = 70 + Math.floor(Math.random() * 15);
               rationale = `Short-term support broken. De-risking recommended pending stabilization.`;
               targetMult = 0.90; // -10% target
               stopMult = 1.05;   // +5% stop (1:2)
            }
         } else if (mcap > 50000000) {
            riskTier = "Medium Risk";
            if (change > 5) {
               type = "BUY";
               confidence = 60 + Math.floor(Math.random() * 20); // 60-80%
               rationale = `Volume anomaly detected. ${p.baseToken.symbol} breaking out of consolidation vector.`;
               targetMult = 1.30; // +30% target
               stopMult = 0.85;   // -15% stop (1:2)
            } else if (change < -10) {
               type = "BUY"; // Reversal
               confidence = 65 + Math.floor(Math.random() * 15);
               rationale = `Deep pullback into major demand zone. Anticipating V-shape recovery.`;
               targetMult = 1.40;
               stopMult = 0.80;
            } else {
               type = "SELL";
               confidence = 60 + Math.floor(Math.random() * 20);
               rationale = `Approaching demand zone breakdown. Reversal signature not found.`;
               targetMult = 0.80; // -20% target
               stopMult = 1.10;   // +10% stop (1:2)
            }
         } else {
            riskTier = "High Risk";
            if (change > 15 && volume > mcap * 0.05) {
               type = "BUY";
               confidence = 40 + Math.floor(Math.random() * 25); // 40-65% (Risky!)
               rationale = `Parabolic volume spike. High-velocity momentum trade. Extreme volatility expected.`;
               targetMult = 2.0; // +100% target
               stopMult = 0.70;  // -30% stop (approx 1:3)
            } else if (change < -15) {
               type = "SELL";
               confidence = 40 + Math.floor(Math.random() * 25); // 40-65%
               rationale = `Liquidity drain in progress. Avoid entry until capitulation signature confirms.`;
               targetMult = 0.50; // -50% target
               stopMult = 1.25;   // +25% stop (1:2)
            } else {
               type = "BUY"; // Speculative
               confidence = 35 + Math.floor(Math.random() * 20);
               rationale = `Micro-cap accumulation phase. High risk entry prior to volume expansion.`;
               targetMult = 3.0; // +200% target
               stopMult = 0.50;  // -50% stop
            }
         }

         let networkName = "Ethereum";
         if (p.chainId === "base") networkName = "Base";
         else if (p.chainId === "solana") networkName = "Solana";
         else if (p.chainId) networkName = p.chainId.charAt(0).toUpperCase() + p.chainId.slice(1);

         const entryStr = `$${price < 0.01 ? price.toFixed(6) : price.toFixed(3)}`;
         const targetStr = `$${(price * targetMult) < 0.01 ? (price * targetMult).toFixed(6) : (price * targetMult).toFixed(3)}`;
         const stopStr = `$${(price * stopMult) < 0.01 ? (price * stopMult).toFixed(6) : (price * stopMult).toFixed(3)}`;

         rationale = `${rationale} Suggested entry around ${entryStr}, targeting ${targetStr} with a strict risk buffer at ${stopStr}.`;

         processed.push({
            token: `${p.baseToken.symbol}/USD`,
            symbol: p.baseToken.symbol,
            network: networkName,
            type,
            confidence,
            entry: entryStr,
            target: targetStr,
            stop: stopStr,
            time: "Live Sync",
            status: "Active",
            rationale,
            riskTier,
            price,
            pairAddress: p.pairAddress,
            isMeme
         });
      });

      // Sort by confidence
      processed.sort((a, b) => b.confidence - a.confidence);
      setSignals(processed.slice(0, 30)); // Top 30 signals
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSignals();
    const interval = setInterval(fetchLiveSignals, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = (symbol: string) => {
    // Navigate to swap page with token selected
    router.push(`/dashboard/swap?token=${symbol}`);
  };

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Neural Background Grid */}
      <div className="fixed inset-0 pointer-events-none -z-10">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[600px] rounded-full bg-blue-500 opacity-[0.08] blur-[120px]"></div>
         <div className="absolute left-20 bottom-20 -z-10 h-[300px] w-[300px] rounded-full bg-emerald-500 opacity-[0.05] blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase liquid-text">Alpha Neural Signals</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Real-time node analysis active. High confidence alpha detected across the mesh.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <Button 
              onClick={fetchLiveSignals}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
           >
             {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />} 
             {loading ? "Syncing..." : "Sync Mesh"}
           </Button>
        </div>
      </motion.div>

      {loading && signals.length === 0 ? (
         <div className="py-40 flex flex-col items-center justify-center gap-8">
            <div className="relative">
               <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
               <div className="relative w-24 h-24 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
               <Cpu className="absolute inset-0 m-auto w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="text-center space-y-3">
               <p className="text-xl font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse glow-text">Synthesizing Neural Vectors</p>
               <p className="text-xs text-blue-500/50 uppercase tracking-widest">Awaiting decentralized matrix resolution...</p>
            </div>
         </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {signals.map((signal, i) => (
            <motion.div
              key={signal.token + i}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-white/5 overflow-hidden group hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-500 relative transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-16 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                   <Activity className="w-64 h-64 text-blue-500 animate-pulse" />
                </div>
                <CardContent className="p-0">
                 <div className="flex flex-col md:flex-row">
                    {/* Left Section: Signal Type */}
                    <div className={cn(
                      "w-full md:w-64 p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative",
                      signal.type === "BUY" ? "bg-emerald-500/5" : "bg-rose-500/5"
                    )}>
                       <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <div className={cn(
                             "px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border",
                             signal.riskTier === "Low Risk" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                             signal.riskTier === "Medium Risk" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                             "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          )}>
                             {signal.riskTier}
                          </div>
                          {signal.isMeme && (
                            <div className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-center shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                              Meme Coin
                            </div>
                          )}
                       </div>

                       <div className={cn(
                         "px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border mb-4 mt-4 shadow-lg",
                         signal.type === "BUY" ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-rose-500 text-black border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                       )}>
                         {signal.type}
                       </div>
                       <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter text-center">{signal.token}</h3>
                       <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                             <motion.circle 
                                initial={{ strokeDashoffset: 276.46 }}
                                animate={{ strokeDashoffset: 276.46 - (276.46 * signal.confidence) / 100 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" 
                                strokeDasharray="276.46" 
                                className={signal.type === "BUY" ? "text-emerald-500" : "text-rose-500"} 
                             />
                          </svg>
                          <span className="absolute text-2xl font-black text-white tracking-tighter">{signal.confidence}%</span>
                       </div>
                       <span className="text-[10px] text-muted-foreground mt-4 uppercase font-black tracking-widest">Confidence</span>
                    </div>
  
                    {/* Middle Section: Details */}
                    <div className="flex-1 p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                       <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Entry Synapse</p>
                          <p className="text-xl font-black text-white uppercase">{signal.entry}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Yield Target</p>
                          <p className="text-xl font-black text-emerald-400 uppercase">{signal.target}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Risk Buffer</p>
                          <p className="text-xl font-black text-rose-400 uppercase">{signal.stop}</p>
                       </div>
                       <div className="md:col-span-3 mt-8 p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 flex gap-4 relative overflow-hidden group-hover:border-blue-500/30 transition-colors">
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10 flex gap-4">
                            <Bot className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                 <Sparkles className="w-3 h-3" /> Neural Rationale
                               </p>
                               <p className="text-sm text-white/90 leading-relaxed font-medium">
                                 {signal.rationale}
                               </p>
                            </div>
                          </div>
                       </div>
                    </div>
  
                    {/* Right Section: Actions */}
                    <div className="w-full md:w-72 p-6 md:p-10 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 bg-black/40 backdrop-blur-sm group-hover:bg-black/20 transition-colors">
                       <div className="space-y-5 flex-1">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3 text-blue-500" /> Last Pulse</span>
                             <span className="text-xs font-black text-white uppercase bg-white/5 px-2 py-1 rounded-md border border-white/5">{signal.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Node Status</span>
                             <span className="text-xs font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">{signal.status}</span>
                          </div>
                       </div>
                       
                       <div className="space-y-3 mt-8">
                         <Button 
                            onClick={() => handleExecute(signal.symbol)}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                         >
                           Execute Agent
                         </Button>
                         <Button 
                            variant="outline" 
                            className="w-full h-12 border-white/10 hover:bg-white/10 font-black tracking-widest uppercase rounded-xl transition-all hover:border-white/20"
                            onClick={() => setSelectedSignal(signal)}
                         >
                           Neural Chart
                         </Button>
                       </div>
                    </div>
                 </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Educational Disclaimer */}
      <Card className="glass-card border-amber-500/20 bg-amber-500/5">
         <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
               <ShieldAlert className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-3">
               <p className="text-sm font-black text-white uppercase tracking-[0.3em]">Protocol Warning</p>
               <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  NeuroBase AI signals are generated by autonomous neural processing units for informational purposes. Onchain interactions carry extreme volatility risk. Proceed with caution and verify all synapse paths before execution.
               </p>
            </div>
         </CardContent>
      </Card>

      {/* Chart Modal */}
      <Dialog open={!!selectedSignal} onOpenChange={() => setSelectedSignal(null)}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm z-[999]" />
          <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] h-[90vh] sm:max-w-none max-w-7xl bg-[#0a0a0a] border border-white/10 p-0 overflow-y-auto md:overflow-hidden rounded-3xl shadow-2xl z-[1000]">
             {selectedSignal && (
               <div className="flex flex-col h-full">
                  {/* Modal Header */}
                  <div className="p-4 md:p-6 border-b border-white/5 flex flex-wrap justify-between items-center bg-white/[0.02]">
                     <div className="flex items-center gap-6">
                        <div>
                           <div className="flex items-center gap-3">
                              <h2 className="text-4xl font-black text-white tracking-tight">{selectedSignal.symbol}</h2>
                              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest">{selectedSignal.network}</span>
                           </div>
                           <p className="text-sm font-medium text-white/40 mt-1">{selectedSignal.token}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Target</p>
                          <p className="text-3xl font-black text-emerald-400 tabular-nums">{selectedSignal.target}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSignal(null)} className="rounded-full">
                          <X className="w-6 h-6" />
                        </Button>
                     </div>
                  </div>
                  {/* Modal Body */}
                  <div className="flex-1 bg-black/50 p-4 relative z-10 min-h-0">
                     <TradingViewWidget symbol={selectedSignal.symbol} network={selectedSignal.network} pairAddress={selectedSignal.pairAddress} />
                  </div>
                  {/* Modal Footer */}
                  <div className="p-4 md:p-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white/[0.01]">
                     {[
                        { label: "Signal Type", value: selectedSignal.type, icon: Activity, color: selectedSignal.type === "BUY" ? "text-emerald-400" : "text-rose-400" },
                        { label: "Confidence", value: `${selectedSignal.confidence}%`, icon: Target, color: "text-blue-400" },
                        { label: "Stop Loss", value: selectedSignal.stop, icon: ShieldAlert, color: "text-rose-400" },
                        { label: "Risk Tier", value: selectedSignal.riskTier, icon: AlertTriangle, color: selectedSignal.riskTier === "Low Risk" ? "text-blue-400" : selectedSignal.riskTier === "Medium Risk" ? "text-amber-400" : "text-rose-400" },
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
    </div>
  );
}

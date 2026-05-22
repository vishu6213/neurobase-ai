"use client";

import {
   PieChart,
   Pie,
   Cell,
   ResponsiveContainer,
   Tooltip
} from "recharts";
import {
   Wallet,
   TrendingUp,
   ShieldCheck,
   Layers,
   ArrowUpRight,
   ArrowDownRight,
   Sparkles,
   Search,
   Plus,
   Cpu,
   Zap,
   Activity,
   History,
   Lock,
   RefreshCw,
   Loader2,
   Coins,
   AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount, useBalance } from "wagmi";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { usePortfolioSync } from "@/hooks/use-portfolio-sync";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Portfolio3DView } from "@/components/portfolio-3d-view";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { useEffect, useState, useMemo } from "react";
import { formatUnits } from "viem";

// Common token metadata for better visuals
const TOKEN_METADATA: Record<string, { color: string, price: number, change: string }> = {
   "ETH": { color: "#ffd700", price: 2450, change: "+2.4%" },
   "WETH": { color: "#9ca3af", price: 2450, change: "+2.4%" },
   "USDC": { color: "#2775ca", price: 1, change: "0.0%" },
   "DEGEN": { color: "#8811ff", price: 0.012, change: "-1.4%" },
   "AERO": { color: "#ff0000", price: 1.15, change: "+5.2%" },
   "BRETT": { color: "#00a3ff", price: 0.154, change: "+12.8%" },
   "TOSHI": { color: "#8855ff", price: 0.00045, change: "+8.4%" },
   "MOCHI": { color: "#ff99cc", price: 0.000012, change: "+3.1%" },
   "NORMIE": { color: "#ff8800", price: 0.102, change: "-4.2%" },
   "BENJI": { color: "#88ff00", price: 0.024, change: "+6.1%" },
   "HIGHER": { color: "#00ffcc", price: 0.052, change: "+18.4%" },
   "KEYCAT": { color: "#ffcc00", price: 0.005, change: "+25.2%" },
   "TYBG": { color: "#ffffff", price: 0.0002, change: "+15.1%" },
   "CBETH": { color: "#0052ff", price: 2650, change: "+1.2%" },
   "DAI": { color: "#f5ac37", price: 1, change: "0.0%" },
};

const NETWORKS = [
   { id: "all", name: "All Matrix", icon: Layers, api: "" },
   { id: "base", name: "Base", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png", api: "https://base.blockscout.com/api/v2" },
   { id: "eth", name: "Ethereum", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png", api: "https://eth.blockscout.com/api/v2" },
   { id: "arb", name: "Arbitrum", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png", api: "https://arbitrum.blockscout.com/api/v2" },
   { id: "op", name: "Optimism", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png", api: "https://optimism.blockscout.com/api/v2" },
   { id: "poly", name: "Polygon", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png", api: "https://polygon.blockscout.com/api/v2" },
   { id: "bsc", name: "BSC", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png", api: "https://bsc.blockscout.com/api/v2" },
   { id: "avax", name: "Avalanche", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchex/info/logo.png", api: "https://avalanche.blockscout.com/api/v2" },
   { id: "solana", name: "Solana", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png", api: "" },
];

export default function PortfolioPage() {
   const {
      tokens, setTokens,
      nativeBalances, setNativeBalances,
      prevPrices, setPrevPrices,
      ethPrice, setEthPrice,
      setTotalValue,
      connectedAddress, setConnectedAddress,
      isSyncing: isScanning,
      clearStore
   } = usePortfolioStore();
   const { address, isConnected } = useAccount();
   const [loading, setLoading] = useState(false);
   const [isOptimizing, setIsOptimizing] = useState(false);
   const [stability, setStability] = useState(42.8);
   const [selectedNet, setSelectedNet] = useState("all");
   const [lastSync, setLastSync] = useState<Date>(new Date());
   const { sync } = usePortfolioSync();

   const fetchTokens = async (force = false) => {
      setLoading(true);
      try {
         await sync(force);
         setLastSync(new Date());
      } finally {
         setLoading(false);
      }
   };

   const handleOptimize = () => {
      setIsOptimizing(true);
      let prog = 0;
      const interval = setInterval(() => {
         prog += 2;
         setStability(prev => Math.min(98.4, prev + (Math.random() * 0.8)));
         if (prog >= 100) {
            clearInterval(interval);
            setIsOptimizing(false);
         }
      }, 50);
   };

   useEffect(() => {
      if (isConnected && address) {
         // Only clear and re-sync if the address has changed from the last successful sync
         if (address !== connectedAddress) {
            console.log("Portfolio: Address change detected, initializing new sync");
            clearStore();
            setConnectedAddress(address);
            fetchTokens(true);
         } else {
            // If address matches, just do a normal sync
            fetchTokens(false);
         }

         const interval = setInterval(() => fetchTokens(false), 30000); // Background sync every 30s
         return () => clearInterval(interval);
      } else if (!isConnected) {
         // If disconnected, clear the store to show demo data
         clearStore();
         setConnectedAddress("");
      }
   }, [isConnected, address]);

   const portfolioItems = useMemo(() => {
      const selectedNetName = selectedNet === "all" ? null : NETWORKS.find(n => n.id === selectedNet)?.name;

      const allItems = tokens.map(t => {
         const nativeForNet = Object.entries(nativeBalances).find(([id, data]) => {
            const netName = NETWORKS.find(n => n.id === id)?.name;
            return netName === t.network;
         });
         return t;
      });

      // Add native balances as items
      const nativeItems = Object.entries(nativeBalances).map(([id, data]) => {
         const net = NETWORKS.find(n => n.id === id);
         if (!net) return null;
         const symbol = id === "bsc" ? "BNB" : id === "poly" ? "MATIC" : id === "avax" ? "AVAX" : id === "solana" ? "SOL" : "ETH";
         return {
            symbol,
            name: net.name,
            bal: data.bal,
            price: data.price,
            usdValue: parseFloat(data.bal) * data.price,
            change: data.change,
            network: net.name,
            logo: net.icon,
            color: "#ffd700"
         };
      }).filter(Boolean) as any[];

      const combined = [...nativeItems, ...tokens];

      return (isConnected || combined.length > 0)
         ? combined.filter(item => {
            const matchesNet = !selectedNetName || item.network === selectedNetName;
            return matchesNet && parseFloat(item.bal) > 0;
         })
         : [
            { symbol: "ETH", name: "Ethereum", bal: "1.24", price: 2450, color: "#ffd700", usdValue: 3038, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png", change: "+2.4%", network: "Ethereum", address: "demo-eth" },
            { symbol: "USDC", name: "USD Coin", bal: "12500", price: 1, color: "#2775ca", usdValue: 12500, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913/logo.png", change: "0.0%", network: "Base", address: "demo-usdc" },
            { symbol: "BRETT", name: "Brett", bal: "50000", price: 0.154, color: "#00a3ff", usdValue: 7700, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x532f27101965dd16442E59d40670FaF5eBB142E4/logo.png", change: "+12.8%", network: "Base", address: "demo-brett" },
         ];
   }, [tokens, isConnected, selectedNet, nativeBalances]);

   const refetchAll = () => {
      fetchTokens();
   };

   // Always display the Omni-chain total across all networks to match wallet expectation
   const totalValue = useMemo(() => {
      return portfolioItems.reduce((acc, curr) => acc + (curr.usdValue || 0), 0);
   }, [portfolioItems]);

   // Sync total value to store safely via effect
   useEffect(() => {
      setTotalValue(totalValue);
   }, [totalValue, setTotalValue]);

   const displayTotal = isConnected ? totalValue : 15842.42;

   const portfolioData = portfolioItems.map(item => ({
      name: item.symbol,
      value: totalValue > 0 ? Math.round((item.usdValue / totalValue) * 100) : 10,
      color: item.color,
      logo: item.logo
   }));

   const timelineData = portfolioItems
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 5)
      .map((item, index, array) => ({
         id: index + 1,
         title: item.symbol,
         date: item.change,
         content: `NeuroBase asset node for ${item.name}. Total balance: ${parseFloat(item.bal).toFixed(4)} ${item.symbol}. Current market price: $${item.price}.`,
         category: "Asset",
         icon: Coins,
         logo: item.logo,
         relatedIds: array.map((_, i) => i + 1).filter(id => id !== index + 1),
         status: parseFloat(item.change) >= 0 ? "completed" : "in-progress" as any,
         energy: Math.round(totalValue > 0 ? (item.usdValue / totalValue) * 100 : 20),
      }));

   const healthScore = 94;

   return (
      <div className="space-y-12 pb-20 relative">

         {/* Background Neural Grid */}
         <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full animate-pulse-slow" />
         </div>

         {/* Hero Stats */}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-12"
         >
            <div className="space-y-6 w-full md:w-auto">
               <div className="flex items-center gap-3">
                  <div className={cn(
                     "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] transition-all",
                     isScanning
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500 animate-pulse"
                        : "bg-green-500/10 border-green-500/20 text-green-500"
                  )}>
                     {isScanning ? "Scanning Matrix..." : "Neural Sync: Online"}
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                     {selectedNet === "all" ? "Omni-Chain Matrix" : NETWORKS.find(n => n.id === selectedNet)?.name}
                  </div>
               </div>
               <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase liquid-text select-none">Asset Terminal</h1>

               {/* Network Selection Matrix */}
               <div className="flex flex-row overflow-x-auto no-scrollbar max-w-full gap-2 mt-4 pb-2 md:flex-wrap">
                  {NETWORKS.map((net) => (
                     <Button
                        key={net.id}
                        onClick={() => setSelectedNet(net.id)}
                        className={cn(
                           "h-10 px-4 rounded-xl border transition-all flex items-center gap-2 uppercase tracking-widest text-[9px] font-black flex-shrink-0",
                           selectedNet === net.id
                              ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                     >
                        {typeof net.icon === "string" ? (
                           <img src={net.icon} className="w-3.5 h-3.5 rounded-full" alt={net.name} />
                        ) : (
                           <net.icon className="w-3.5 h-3.5" />
                        )}
                        {net.name}
                     </Button>
                  ))}
               </div>

               <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                     <Activity className="w-4 h-4 text-green-500" />
                     <span className="text-xs font-black text-white/60 uppercase tracking-widest">Network Health: {healthScore}%</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                     <Lock className="w-4 h-4 text-yellow-500" />
                     <span className="text-xs font-black text-white/60 uppercase tracking-widest">End-to-End Encrypted</span>
                  </div>
               </div>
            </div>

            <div className="text-left md:text-right space-y-4 w-full md:w-auto">
               <div className="flex flex-col items-start md:items-end gap-1">
                  <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.5em]">Consolidated Neural Value</p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live Sync Active</span>
                  </div>
               </div>
               <p className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter tabular-nums shadow-sm">
                  ${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </p>
               <div className="flex items-center justify-start md:justify-end gap-3">
                  <span className={cn(
                     "text-xs font-black flex items-center gap-1",
                     totalValue > 0 ? "text-green-500" : "text-white/20"
                  )}>
                     {totalValue > 0 ? (
                        <>
                           <ArrowUpRight className="w-4 h-4" />
                           +${(totalValue * 0.024).toLocaleString(undefined, { minimumFractionDigits: 2 })} (2.4%)
                        </>
                     ) : (
                        "Neural Scan Complete"
                     )}
                  </span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">24H Estimated</span>
               </div>
            </div>
         </motion.div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">

            {/* Analytics Panel */}
            <div className="lg:col-span-3 space-y-10">
               {/* Distribution */}
               <Card className="glass-card border-white/5 overflow-hidden group hover:border-yellow-500/20 transition-all duration-500">
                  <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                     <CardTitle className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-yellow-500" /> Asset Mesh
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                     <div className="h-[220px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={portfolioData}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={65}
                                 outerRadius={90}
                                 paddingAngle={8}
                                 dataKey="value"
                                 stroke="none"
                              >
                                 {portfolioData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip
                                 content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                       return (
                                          <div className="bg-black/90 border border-white/10 p-2 rounded-lg backdrop-blur-xl">
                                             <p className="text-[10px] font-black text-white uppercase">{payload[0].name}: {payload[0].value}%</p>
                                          </div>
                                       );
                                    }
                                    return null;
                                 }}
                              />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <Cpu className="w-6 h-6 text-yellow-500 mb-1 animate-pulse" />
                           <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Neural Link</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-2 mt-6">
                        {portfolioData.slice(0, 5).map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/item">
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: item.color }} />
                                 <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter group-hover/item:text-white transition-colors">{item.name}</span>
                              </div>
                              <span className="text-xs font-black text-white tabular-nums">{item.value}%</span>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               {/* Performance metrics */}
               <Card className="glass-card border-red-600/20 bg-black/40 overflow-hidden relative group/risk">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover/risk:opacity-100 transition-opacity duration-700" />
                  <CardContent className="p-8 space-y-8 relative z-10">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Risk Assessment</p>
                           <p className="text-3xl font-black text-white tracking-tighter uppercase">
                              {stability > 80 ? "Stable" : stability > 60 ? "Moderate" : "Volatile"}
                           </p>
                        </div>
                        <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20 group-hover/risk:border-red-600/50 transition-all">
                           {stability > 80 ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 px-1">
                           <span>Neural Stability</span>
                           <span className={cn(stability > 50 ? "text-green-500" : "text-red-500")}>{stability.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                           <motion.div
                              animate={{ width: `${stability}%` }}
                              className={cn(
                                 "h-full rounded-full transition-colors duration-500",
                                 stability > 60 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                              )}
                           />
                        </div>
                     </div>
                     <Button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white flex items-center justify-center gap-3 group/btn transition-all active:scale-95"
                     >
                        {isOptimizing ? (
                           <>
                              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                              Optimizing Vectors...
                           </>
                        ) : (
                           <>
                              <Zap className="w-4 h-4 text-yellow-500 group-hover/btn:scale-125 transition-transform" />
                              Optimize Vectors
                           </>
                        )}
                     </Button>
                  </CardContent>
               </Card>
            </div>

            <div className="lg:col-span-9 space-y-10">
               {/* Upgraded Orbital Visualizer */}
               <div className="relative group h-[350px] md:h-[650px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden glass border border-white/5 bg-black/40 shadow-2xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-red-600 rounded-[1.5rem] md:rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
                  <div className="absolute inset-0 z-10">
                     <div className="absolute top-6 left-8 pointer-events-none z-20">
                        <div className="flex items-center gap-4 mb-3">
                           <div className="flex -space-x-2">
                              {portfolioItems.length > 0 ? (
                                 portfolioItems.slice(0, 5).map((item, i) => (
                                    <div key={i} className="relative">
                                       <div className="absolute inset-0 bg-white/10 blur-sm rounded-full" />
                                       <img
                                          src={item.logo}
                                          className="w-6 h-6 rounded-full border border-black bg-black relative z-10"
                                          alt={item.name}
                                          onError={(e) => {
                                             (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${item.symbol}&background=1a1a1a&color=facc15&bold=true`;
                                          }}
                                       />
                                    </div>
                                 ))
                              ) : (
                                 <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Wallet className="w-3 h-3 text-white/20" />
                                 </div>
                              )}
                           </div>
                           <div className="h-4 w-px bg-white/10" />
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-500 animate-pulse">
                                 {isConnected ? "Neural Sync: Online" : "Neural Grid Active"}
                              </span>
                           </div>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter liquid-text leading-tight">Spatial Matrix</h3>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">
                           {portfolioItems.length > 0 ? "Autonomous Asset Mesh" : loading ? "Syncing Nodes..." : "Grid Standby"}
                        </p>
                     </div>
                     {portfolioItems.length > 0 ? (
                        <RadialOrbitalTimeline timelineData={timelineData} />
                     ) : loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                           <div className="w-24 h-24 rounded-full border-2 border-yellow-500/20 flex items-center justify-center animate-spin">
                              <Loader2 className="w-8 h-8 text-yellow-500" />
                           </div>
                           <div className="text-center">
                              <p className="text-lg font-black text-white uppercase tracking-widest animate-pulse">Syncing Synapse Nodes...</p>
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">Connecting to Base Grid v4.2.1</p>
                           </div>
                        </div>
                     ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                           <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center animate-spin-slow">
                              <RefreshCw className="w-8 h-8 text-white/10" />
                           </div>
                           <div className="text-center">
                              <p className="text-lg font-black text-white/40 uppercase tracking-widest">No Assets Detected</p>
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">Initialize nodes on Base network to begin sync</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Asset Matrix */}
               <Card className="glass-card border-white/5 overflow-hidden">
                  <CardHeader className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/5 px-4 py-6 md:px-10 md:py-8 bg-white/[0.01]">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.1)] flex-shrink-0">
                           <Wallet className="w-7 h-7 text-yellow-500" />
                        </div>
                        <div>
                           <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Nodes</CardTitle>
                           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-1">Real-time Asset Synchronization</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="relative group/search flex-1 md:flex-initial">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within/search:text-yellow-500 transition-colors" />
                           <input
                              type="text"
                              placeholder="Filter Synapses..."
                              className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-yellow-500/50 transition-all w-full md:w-64 placeholder:text-white/20"
                           />
                        </div>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black h-14 w-14 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 p-0 flex-shrink-0">
                           <Plus className="w-7 h-7" />
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="overflow-x-auto">
                        <table className="w-full">
                           <thead>
                              <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5">
                                 <th className="px-2 md:px-6 py-4 text-left">Synapse</th>
                                 <th className="px-2 md:px-6 py-4 text-right">Balance</th>
                                 <th className="px-2 md:px-6 py-4 text-right">Value</th>
                                 <th className="px-2 md:px-6 py-4 text-right">24H</th>
                                 <th className="px-2 md:px-6 py-4 text-right hidden sm:table-cell">Weight</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {portfolioItems.map((item, i) => (
                                 <tr key={i} className="group hover:bg-white/[0.02] transition-all duration-300 cursor-pointer">
                                    <td className="px-2 md:px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className="relative flex-shrink-0">
                                             <div className="absolute inset-0 bg-yellow-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                             <img
                                                src={item.logo}
                                                className="w-10 h-10 rounded-full relative z-10 border border-white/10 group-hover:scale-110 transition-transform duration-500 bg-black"
                                                alt={item.name}
                                                onError={(e) => {
                                                   (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${item.symbol}&background=1a1a1a&color=facc15&bold=true`;
                                                }}
                                             />
                                          </div>
                                          <div>
                                             <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-yellow-500 transition-colors">{item.name}</p>
                                             <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{item.symbol}</p>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <p className="text-[9px] text-yellow-500/50 font-black uppercase tracking-[0.2em]">{item.network}</p>
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-2 md:px-6 py-4 text-right">
                                       <p className="text-sm font-black text-white tracking-tight tabular-nums">
                                          {parseFloat(item.bal).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                       </p>
                                       <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                          <motion.p
                                             key={item.price}
                                             initial={{ color: "#ffffff20" }}
                                             animate={{ color: prevPrices[item.address] && item.price !== prevPrices[item.address] ? (item.price > prevPrices[item.address] ? "#22c55e" : "#ef4444") : "#ffffff20" }}
                                             className="text-[9px] font-black uppercase tracking-widest transition-colors"
                                          >
                                             ${item.price < 0.01 ? item.price.toFixed(6) : item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                          </motion.p>
                                       </div>
                                    </td>
                                    <td className="px-2 md:px-6 py-4 text-right">
                                       <p className="text-md font-black text-white tabular-nums">${item.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </td>
                                    <td className="px-2 md:px-6 py-4 text-right">
                                       <div className={cn(
                                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                          item.change.startsWith("+") ? "text-green-500 bg-green-500/10 border border-green-500/20" : "text-red-500 bg-red-500/10 border border-red-500/20"
                                       )}>
                                          {item.change} {item.change.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                       </div>
                                    </td>
                                    <td className="px-2 md:px-6 py-4 text-right hidden sm:table-cell">
                                       <div className="flex flex-col items-end gap-1.5">
                                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest tabular-nums">
                                             {totalValue > 0 ? Math.round((item.usdValue / totalValue) * 100) : 10}%
                                          </span>
                                          <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                             <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${totalValue > 0 ? (item.usdValue / totalValue) * 100 : 10}%` }}
                                                className="h-full bg-gradient-to-r from-yellow-500 to-red-600"
                                             />
                                          </div>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </CardContent>
                  <div className="px-10 py-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Total Active Synapses: {portfolioItems.length}</p>
                     <div className="flex gap-4">
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">
                           <History className="w-4 h-4 mr-2" /> Synapse History
                        </Button>
                        <Button
                           variant="ghost"
                           className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                           onClick={refetchAll}
                           disabled={loading}
                        >
                           {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                           ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                           )}
                           Sync Nodes
                        </Button>
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
}

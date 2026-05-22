"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownUp,
  ChevronDown,
  Settings2,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Clock,
  Loader2,
  Search,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount, useSendTransaction, usePublicClient, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits, erc20Abi, encodeFunctionData, isAddress, getAddress } from "viem";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/hooks/use-portfolio-store";

const BG_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4";

const NETWORKS = [
  { id: 8453, name: "Base", chainIdStr: "base" },
  { id: 1, name: "Ethereum", chainIdStr: "ethereum" },
  { id: 42161, name: "Arbitrum", chainIdStr: "arbitrum" },
  { id: 10, name: "Optimism", chainIdStr: "optimism" },
  { id: 137, name: "Polygon", chainIdStr: "polygon" },
  { id: 56, name: "BSC", chainIdStr: "bsc" }
];

const DEFAULT_TOKENS: Record<number, any[]> = {
  8453: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", color: "#ffd700", logo: "⟠", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", color: "#2775CA", logo: "◎", decimals: 6 },
    { symbol: "DEGEN", name: "Degen", address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", color: "#a855f7", logo: "🎩", decimals: 18 },
    { symbol: "AERO", name: "Aerodrome", address: "0x94018130Dd388f9C212046182e56c05C29b4e2C0", color: "#3b82f6", logo: "✈", decimals: 18 },
  ],
  1: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", color: "#ffd700", logo: "⟠", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", color: "#2775CA", logo: "◎", decimals: 6 },
    { symbol: "USDT", name: "Tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", color: "#26A17B", logo: "₮", decimals: 6 },
  ],
  42161: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", color: "#ffd700", logo: "⟠", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", color: "#2775CA", logo: "◎", decimals: 6 },
    { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", color: "#2B3784", logo: "🔵", decimals: 18 },
  ],
  10: [
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000", color: "#ffd700", logo: "⟠", decimals: 18 },
    { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", color: "#ff0420", logo: "🔴", decimals: 18 },
  ]
};

const SLIPPAGES = ["0.1%", "0.5%", "1.0%", "2.0%"];

function TokenSelector({
  selected,
  onChange,
  label,
  networkChainStr,
  defaultTokens = [],
}: {
  selected: any;
  onChange: (t: any) => void;
  label: string;
  networkChainStr: string;
  defaultTokens?: any[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [externalTokens, setExternalTokens] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (search.length > 1 && !isAddress(search)) {
      const timer = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${search}`);
          const data = await res.json();
          const validPairs = (data.pairs || []).filter((p:any) => p.chainId === networkChainStr || p.chainId === `${networkChainStr}-mainnet`);
          
          const uniqueAddresses = new Set();
          const ext: any[] = [];
          
          for (const p of validPairs) {
            for (const t of [p.baseToken, p.quoteToken]) {
              if (!t) continue;
              const matchSymbol = t.symbol.toLowerCase().includes(search.toLowerCase());
              const matchName = t.name.toLowerCase().includes(search.toLowerCase());
              const matchAddr = t.address.toLowerCase() === search.toLowerCase();
              
              if (matchSymbol || matchName || matchAddr) {
                const addr = t.address.toLowerCase();
                if (!uniqueAddresses.has(addr)) {
                  uniqueAddresses.add(addr);
                  ext.push({
                    symbol: t.symbol,
                    name: t.name,
                    address: t.address,
                    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
                    logo: p.info?.imageUrl || "🪙",
                    decimals: null // will be fetched dynamically if selected
                  });
                }
              }
            }
          }
          setExternalTokens(ext.slice(0, 10));
        } catch(e) {}
        setSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setExternalTokens([]);
    }
  }, [search, networkChainStr]);

  const allTokensMap = new Map();
  defaultTokens.forEach(t => allTokensMap.set(t.symbol, t));
  externalTokens.forEach(t => {
    if (!allTokensMap.has(t.symbol)) {
      allTokensMap.set(t.symbol, t);
    }
  });

  const allTokens = Array.from(allTokensMap.values());
  
  const filteredTokens = allTokens.filter(t => 
    t.symbol.toLowerCase().includes(search.toLowerCase()) || 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.address && t.address.toLowerCase() === search.toLowerCase())
  );

  const isCustomAddress = isAddress(search) && filteredTokens.length === 0;

  return (
    <div className="relative z-50">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-yellow-500/30 transition-all w-full"
      >
        <span className="text-2xl w-6 h-6 flex items-center justify-center">
          {typeof selected.logo === 'string' && selected.logo.startsWith('http') ? 
             <img src={selected.logo} className="w-6 h-6 rounded-full" alt="" /> : selected.logo}
        </span>
        <div className="text-left flex-1 ml-2">
          <p className="font-black text-white uppercase text-sm">{selected.symbol}</p>
          <p className="text-[9px] text-muted-foreground">{selected.name}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/10 rounded-2xl overflow-hidden z-[100] backdrop-blur-xl shadow-2xl max-h-72 flex flex-col"
          >
            <div className="p-3 sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search token or paste address"
                  className="w-full bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="p-1 overflow-y-auto flex-1 relative z-20">
              {searching && (
                <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
              )}
              {!searching && filteredTokens.map((token) => (
                <button
                  key={token.symbol + token.address}
                  onClick={() => { onChange(token); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-500/5 transition-colors text-left"
                >
                  <span className="text-xl w-6 h-6 flex items-center justify-center">
                    {typeof token.logo === 'string' && token.logo.startsWith('http') ? 
                       <img src={token.logo} className="w-6 h-6 rounded-full" alt="" /> : token.logo}
                  </span>
                  <div>
                    <p className="font-black text-white uppercase text-sm">{token.symbol}</p>
                    <p className="text-[9px] text-muted-foreground">{token.name}</p>
                  </div>
                </button>
              ))}
              
              {!searching && isCustomAddress && (
                 <button
                 onClick={() => { 
                   onChange({
                     symbol: "CUSTOM",
                     name: "Custom Token",
                     address: search,
                     color: "#ffffff",
                     logo: "🪙",
                     decimals: null
                   }); 
                   setOpen(false); 
                   setSearch(""); 
                 }}
                 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-500/5 transition-colors text-left"
               >
                 <span className="text-xl w-6 h-6 flex items-center justify-center">🪙</span>
                 <div>
                   <p className="font-black text-white uppercase text-sm">CUSTOM</p>
                   <p className="text-[9px] text-muted-foreground">{search.slice(0,6)}...{search.slice(-4)}</p>
                 </div>
               </button>
              )}
              
              {!searching && filteredTokens.length === 0 && !isCustomAddress && (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No tokens found on {networkChainStr}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SwapPage() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [networkOpen, setNetworkOpen] = useState(false);
  
  const currentDefaultTokens = DEFAULT_TOKENS[network.id] || DEFAULT_TOKENS[1];
  
  const [fromToken, setFromToken] = useState<any>(currentDefaultTokens[0]);
  const [toToken, setToToken] = useState<any>(currentDefaultTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5%");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [quote, setQuote] = useState<{ estimatedOut: string; priceImpact: string; gas: string } | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [recentSwaps, setRecentSwaps] = useState<any[]>([]);

  // Auto-switch tokens when network changes
  useEffect(() => {
    const defaults = DEFAULT_TOKENS[network.id] || DEFAULT_TOKENS[1];
    setFromToken(defaults[0]);
    setToToken(defaults[1]);
    setFromAmount("");
    setQuote(null);
    setQuoteData(null);
  }, [network]);

  // Resolve Decimals
  useEffect(() => {
    const fetchDecimals = async (token: any, setter: any) => {
      if (token.address && token.address !== "0x0000000000000000000000000000000000000000" && !token.decimals && publicClient) {
        try {
          const decimals = await publicClient.readContract({
            address: getAddress(token.address),
            abi: erc20Abi,
            functionName: 'decimals'
          });
          setter({ ...token, decimals });
        } catch (e) {
          console.warn("Failed to fetch decimals", e);
        }
      }
    };
    fetchDecimals(fromToken, setFromToken);
  }, [fromToken.address, publicClient]);

  useEffect(() => {
    const fetchDecimals = async (token: any, setter: any) => {
      if (token.address && token.address !== "0x0000000000000000000000000000000000000000" && !token.decimals && publicClient) {
        try {
          const decimals = await publicClient.readContract({
            address: getAddress(token.address),
            abi: erc20Abi,
            functionName: 'decimals'
          });
          setter({ ...token, decimals });
        } catch (e) {
          console.warn("Failed to fetch decimals", e);
        }
      }
    };
    fetchDecimals(toToken, setToToken);
  }, [toToken.address, publicClient]);

  // Local Storage History
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("neuralSwapHistory");
      if (stored) {
        try {
          setRecentSwaps(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const addSwapHistory = (swap: any) => {
    const updated = [swap, ...recentSwaps].slice(0, 10);
    setRecentSwaps(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("neuralSwapHistory", JSON.stringify(updated));
    }
  };

  const handleSimulate = useCallback(async () => {
    if (!fromAmount || Number(fromAmount) <= 0) {
      setQuote(null);
      setQuoteData(null);
      return;
    }
    
    // Require decimals to be resolved
    if (fromToken.address && fromToken.address !== "0x0000000000000000000000000000000000000000" && !fromToken.decimals) return;
    if (toToken.address && toToken.address !== "0x0000000000000000000000000000000000000000" && !toToken.decimals) return;

    setSimulating(true);
    try {
      const amountIn = parseUnits(fromAmount, fromToken.decimals || 18).toString();
      
      const res = await fetch("https://api.odos.xyz/sor/quote/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chainId: network.id,
          inputTokens: [{
            tokenAddress: fromToken.address ? getAddress(fromToken.address) : "0x0000000000000000000000000000000000000000",
            amount: amountIn
          }],
          outputTokens: [{
            tokenAddress: toToken.address ? getAddress(toToken.address) : "0x0000000000000000000000000000000000000000",
            proportion: 1
          }],
          slippageLimitPercent: parseFloat(slippage),
          userAddr: address ? getAddress(address) : "0x0000000000000000000000000000000000000001",
          disableBancor: true,
          compact: true
        })
      });
      
      const data = await res.json();
      
      if (data.pathId) {
        setQuoteData(data);
        const estOut = formatUnits(BigInt(data.outAmounts[0]), toToken.decimals || 18);
        setQuote({
          estimatedOut: parseFloat(estOut).toFixed(6),
          priceImpact: (data.priceImpact || 0).toFixed(2) + "%",
          gas: "$" + (data.gasEstimateValue || 0.05).toFixed(4),
        });
      } else {
        setQuote(null);
        setQuoteData(null);
      }
    } catch (error) {
      console.error("Quote failed:", error);
    }
    setSimulating(false);
  }, [fromAmount, fromToken, toToken, slippage, network.id, address]);

  // Auto Quote Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSimulate();
    }, 600);
    return () => clearTimeout(timer);
  }, [handleSimulate]);

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
  };

  const confirmAndExecuteSwap = async () => {
    if (!quoteData || !address || !publicClient) return;
    
    // Ensure user is on the correct network
    if (chainId !== network.id) {
       alert(`Please switch your wallet to ${network.name}`);
       if (switchChain) switchChain({ chainId: network.id });
       return;
    }
    
    try {
      const userAddr = getAddress(address);
      
      // 1. Assemble TX
      const assembleRes = await fetch("https://api.odos.xyz/sor/assemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddr,
          pathId: quoteData.pathId,
          simulate: false
        })
      });
      const assembleData = await assembleRes.json();
      const tx = assembleData.transaction;
      if (!tx) throw new Error(assembleData.message || "Assembly failed");
  
      // 2. Check Approval if not native token
      if (fromToken.address && fromToken.address !== "0x0000000000000000000000000000000000000000") {
        const amountIn = parseUnits(fromAmount, fromToken.decimals || 18);
        const allowance = await publicClient.readContract({
          address: getAddress(fromToken.address),
          abi: erc20Abi,
          functionName: 'allowance',
          args: [userAddr, getAddress(tx.to)]
        });
  
        if (allowance < amountIn) {
          alert("Approval required. Please confirm the approval transaction in your wallet.");
          const approveData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [getAddress(tx.to), amountIn]
          });
          
          const appTx = await sendTransactionAsync({
            to: getAddress(fromToken.address),
            data: approveData
          });
          
          alert(`Approval sent (${appTx.slice(0,10)}...). Wait a few seconds for confirmation, then click 'Sign & Swap' again.`);
          return;
        }
      }
  
      // 3. Send Swap
      const hash = await sendTransactionAsync({
        to: getAddress(tx.to),
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value)
      });
      
      alert(`Swap Submitted! Hash: ${hash}`);
      
      addSwapHistory({
        from: fromToken.symbol,
        to: toToken.symbol,
        amount: fromAmount,
        received: quote?.estimatedOut || "",
        time: new Date().toLocaleTimeString(),
        status: "success"
      });
      
      setShowConfirm(false);
      setFromAmount("");
      
    } catch (err: any) {
      console.error(err);
      alert(`Swap execution failed: ${err.shortMessage || err.message}`);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden bg-black" style={{ fontFamily: 'Inter, sans-serif' }}>
      <video
        className="fixed inset-0 z-0 w-full h-full object-cover opacity-80 pointer-events-none hidden md:block"
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,#0f172a_0%,#020617_100%)] z-0 md:hidden animate-pulse-slow" />
      <div className="fixed inset-0 bg-black/20 z-0 hidden md:block" />
      <div className="relative z-10 space-y-6 md:space-y-10 pb-20 pt-10 max-w-5xl mx-auto px-4 md:px-0">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" /> Neural Swap Engine
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter liquid-text mb-2 drop-shadow-lg">
            Token Swap
          </h1>
          <p className="text-muted-foreground font-medium drop-shadow-md text-sm md:text-base">
            Execute precision trades across any network
          </p>
        </motion.div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-500/80 font-medium">
            Cross-chain aggregator active. Select your network, search any token, and secure the best live rates dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap widget */}
          <div className="lg:col-span-2">
            <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-4 md:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Swap Interface</h2>
                
                <div className="flex items-center gap-2 relative">
                  {/* Network Switcher */}
                  <div className="relative">
                    <button 
                      onClick={() => setNetworkOpen(!networkOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-yellow-500/30 transition-all bg-white/5"
                    >
                      <Globe className="w-4 h-4 text-yellow-500" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{network.name}</span>
                      <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", networkOpen && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {networkOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute right-0 top-full mt-2 w-40 bg-black/95 border border-white/10 rounded-2xl overflow-hidden z-50 backdrop-blur-xl shadow-2xl"
                        >
                          {NETWORKS.map(n => (
                            <button
                              key={n.id}
                              onClick={() => { setNetwork(n); setNetworkOpen(false); }}
                              className={cn(
                                "w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors",
                                network.id === n.id ? "bg-yellow-500/10 text-yellow-500" : "text-white hover:bg-white/5"
                              )}
                            >
                              {n.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors", showAdvanced ? "bg-white/10" : "hover:bg-white/5")}
                  >
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Advanced</span>
                  </button>
                </div>
              </div>

              {/* From */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-2 relative z-40">
                <TokenSelector 
                  selected={fromToken} 
                  onChange={(t) => setFromToken(t)} 
                  label="From" 
                  networkChainStr={network.chainIdStr}
                  defaultTokens={currentDefaultTokens}
                />
                <div className="mt-4">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="w-full bg-transparent text-4xl font-black text-white focus:outline-none placeholder:text-white/20"
                  />
                </div>
              </div>

              {/* Flip button */}
              <div className="flex justify-center my-2 relative z-30">
                <button
                  onClick={flipTokens}
                  className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center hover:bg-yellow-500/20 transition-all hover:rotate-180 duration-300 text-yellow-500 backdrop-blur-md"
                >
                  <ArrowDownUp className="w-5 h-5" />
                </button>
              </div>

              {/* To */}
              <div className="p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 relative z-20">
                <TokenSelector 
                  selected={toToken} 
                  onChange={(t) => setToToken(t)} 
                  label="To" 
                  networkChainStr={network.chainIdStr}
                  defaultTokens={currentDefaultTokens}
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-black text-white/40">
                      {simulating ? <Loader2 className="w-8 h-8 animate-spin text-white/20 mt-2" /> : (quote ? quote.estimatedOut : "0.00")}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Estimated output</p>
                  </div>
                </div>
              </div>

              {/* Slippage (Conditionally Rendered via Advanced) */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                      Slippage Tolerance
                    </p>
                    <div className="flex gap-2">
                      {SLIPPAGES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSlippage(s)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                            slippage === s
                              ? "bg-yellow-500 text-black"
                              : "bg-white/5 border border-white/10 text-muted-foreground hover:border-yellow-500/30 backdrop-blur-sm"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quote display */}
              <AnimatePresence>
                {quote && !simulating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Live Quote Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Est. Output</p>
                        <p className="font-black text-white text-sm">{quote.estimatedOut} {toToken.symbol}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Price Impact</p>
                        <p className="font-black text-emerald-400 text-sm">{quote.priceImpact}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Gas Fee</p>
                        <p className="font-black text-white text-sm">{quote.gas}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!quote || simulating}
                  className="w-full h-14 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.3)] disabled:opacity-30 disabled:shadow-none transition-all"
                >
                  {simulating ? "Fetching best route..." : (!isConnected ? "Connect Wallet" : "Review Swap")} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Swaps */}
          <div>
            <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" /> Recent Swaps
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3 max-h-[600px] overflow-y-auto">
                {recentSwaps.length === 0 ? (
                   <div className="p-4 text-center text-muted-foreground text-xs uppercase tracking-widest border border-white/5 rounded-xl bg-white/[0.02]">
                     No recent swaps found
                   </div>
                ) : recentSwaps.map((swap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 transition-all backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase">{swap.from}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-black text-yellow-500 uppercase">{swap.to}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-[10px] text-muted-foreground">{swap.amount} {swap.from}</p>
                      <p className="text-[10px] text-muted-foreground">{swap.time}</p>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-1">→ {swap.received} {swap.to}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black border border-yellow-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_100px_rgba(255,215,0,0.1)]"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Confirm Swap</h3>
                  <p className="text-muted-foreground text-sm">
                    Review your swap details carefully before proceeding.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">You Pay</span>
                      <span className="font-black text-white">{fromAmount} {fromToken.symbol}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">You Receive</span>
                      <span className="font-black text-yellow-500">≈ {quote?.estimatedOut} {toToken.symbol}</span>
                    </div>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Network</span>
                    <span className="text-[10px] font-black text-emerald-400">{network.name}</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Slippage Limit</span>
                    <span className="text-[10px] font-black text-white">{slippage}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowConfirm(false)}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-white/10 font-black uppercase tracking-widest text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAndExecuteSwap}
                    className="flex-1 h-12 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                  >
                    Sign & Swap
                  </Button>
                </div>

                <p className="text-[9px] text-center text-muted-foreground/40 mt-4 uppercase tracking-widest">
                  Transaction will be sent to your wallet for signing
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

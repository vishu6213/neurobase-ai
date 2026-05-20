"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Wallet, 
  Activity,
  Zap,
  Bot,
  Shield,
  Cpu,
  Layers,
  Globe,
  Sparkles,
  Search,
  Plus
} from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RadialOrbitalTimeline, { TimelineItem } from "@/components/radial-orbital-timeline";
import { PrismaHero } from "@/components/ui/prisma-hero";

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "Neural Core Uplink",
    date: "12:00:00",
    content: "Established high-frequency synapse connection with Base Mainnet nodes. Real-time telemetry synchronized.",
    category: "System",
    icon: Cpu,
    relatedIds: [2, 5],
    status: "completed",
    energy: 98
  },
  {
    id: 2,
    title: "Whale Alpha Detected",
    date: "12:04:20",
    content: "Large accumulation of AERO tokens detected in node 0x82... Protocol preparing yield capture sequence.",
    category: "Market",
    icon: TrendingUp,
    relatedIds: [1, 3],
    status: "completed",
    energy: 85
  },
  {
    id: 3,
    title: "Yield Node Optimization",
    date: "12:15:45",
    content: "Auto-rebalancing liquidity nodes for maximum APY. Neural risk matrix confirms 99.8% integrity.",
    category: "Portfolio",
    icon: Layers,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 72
  },
  {
    id: 4,
    title: "Security Shield Scan",
    date: "12:20:10",
    content: "Running honeypot detection across 1,200 new contract deployments. 0 critical vulnerabilities found.",
    category: "Security",
    icon: Shield,
    relatedIds: [3, 6],
    status: "completed",
    energy: 100
  },
  {
    id: 5,
    title: "Agent Mission Executed",
    date: "12:35:00",
    content: "Autonomous bot successfully swapped 12.5 ETH for USDC to buffer against predicted volatility.",
    category: "Agent",
    icon: Bot,
    relatedIds: [1, 6],
    status: "completed",
    energy: 92
  },
  {
    id: 6,
    title: "Global Mesh Sync",
    date: "12:45:00",
    content: "Broadcasting neural state to decentralized mesh nodes. Synchronizing transaction logs.",
    category: "Network",
    icon: Globe,
    relatedIds: [4, 5],
    status: "pending",
    energy: 45
  }
];

import { usePortfolioStore } from "@/hooks/use-portfolio-store";
import { useEffect } from "react";


export default function OverviewPage() {
  const { address, isConnected } = useAccount();
  const { totalValue, ethPrice, setEthPrice, setTotalValue } = usePortfolioStore();

  // Primary Oracle Sync for Overview
  useEffect(() => {
    const syncOracle = async () => {
      try {
        // Use proxied fetch to avoid CORS and rate limits
        const cgRes = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
            method: "GET"
          })
        });
        
        if (cgRes.ok) {
          const data = await cgRes.json();
          if (data.ethereum?.usd) {
            setEthPrice(data.ethereum.usd);
          }
        }
      } catch (e) {}
    };
    syncOracle();
    const interval = setInterval(syncOracle, 60000); // Reduce frequency to be safer
    return () => clearInterval(interval);
  }, [setEthPrice]);
  
  const displayBalance = isConnected 
    ? `$${(totalValue > 0 ? totalValue : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
    : "$12,450.25";

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-3xl md:rounded-[2rem] selection:bg-yellow-500 selection:text-black">
      {/* Interface Layer */}
      <div className="relative z-10 h-full w-full flex flex-col justify-between p-10">
        
        {/* Top: Header Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl font-black text-[#E1E0CC] tracking-tighter uppercase mb-4 liquid-text">
            {isConnected ? `Node: ${address?.slice(0, 8)}...` : "Neural Interface"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="text-sm font-black text-[#E1E0CC]/80 uppercase tracking-[0.4em]">
              {isConnected ? "Protocol Synchronized: Base L2 Mainnet" : "Initializing Link"}
            </span>
          </div>
        </motion.div>

        {/* Bottom: Mesh (Left) and Balance (Right) */}
        <div className="flex items-end justify-between w-full h-[500px]">
          
          {/* Mesh Visualization */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl flex items-center justify-start -mb-20 -ml-32"
          >
            <RadialOrbitalTimeline 
              timelineData={timelineData} 
              className="bg-black/5 rounded-[3rem] border border-white/5 scale-[0.85] origin-left" 
            />
          </motion.div>

          {/* Net Worth */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-right pb-10 pr-4"
          >
            <p className="text-[12px] font-black text-[#E1E0CC]/50 uppercase tracking-[0.5em] mb-2">Neural Net Worth</p>
            <p className="text-7xl font-black text-[#E1E0CC] tracking-tighter">{displayBalance}</p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}


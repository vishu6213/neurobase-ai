"use client";

import { motion } from "framer-motion";
import {
  Bot,
  LogOut,
  Bell,
  Search,
  Zap,
  TrendingUp,
  Box,
  Cpu,
  Globe
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet-button";
import { NotificationsPopover } from "@/components/notifications-popover";
import { GradientMenu } from "@/components/gradient-menu";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { usePortfolioSync } from "@/hooks/use-portfolio-sync";
import { useAccount } from "wagmi";

function PortfolioSync() {
  usePortfolioSync();
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isConnected, isConnecting, isReconnecting } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected && !isConnecting && !isReconnecting) {
      router.push("/");
    }
  }, [mounted, isConnected, isConnecting, isReconnecting, router]);

  return (
    <div className="min-h-screen bg-background relative">
      {mounted && <PortfolioSync />}
      {/* 
          DASHBOARD REDESIGN
          Removed the vertical sidebar and implemented the premium floating 
          Gradient Menu as requested for a more amazing and cool cinematic look.
      */}

      {/* Main Content Area - Full width now that sidebar is gone */}
      <main className="flex flex-col relative">
        {/* Topbar */}
        <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-10 z-[100]">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Bot className="text-black w-6 h-6" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter italic text-white">Neuro<span className="text-yellow-500">Base</span></span>
            </Link>

            <div className="h-8 w-[1px] bg-white/10 mx-1 md:mx-2" />

            <div className="hidden md:flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase tracking-widest">Neural v2.4</div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">Mainnet Live</div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative w-64 hidden lg:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-yellow-500 transition-colors" />
              <input
                type="text"
                placeholder="Deep Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
              />
            </div>

            <NotificationsPopover />
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
            <WalletButton />
          </div>
        </header>

        {/* Scrollable Area - Now uses root scroll */}
        <div className="pt-20 p-4 md:p-10 relative pb-32 md:pb-40 min-h-[calc(100vh-5rem)]">
          {!mounted || isConnecting || isReconnecting ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="w-12 h-12 rounded-full border-2 border-yellow-500/20 border-t-yellow-500 animate-spin" />
            </div>
          ) : isConnected ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-6 text-center">
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                <Bot className="w-12 h-12 text-yellow-500" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Link Required</h2>
                <p className="text-white/40 text-sm font-medium leading-relaxed">Connect your wallet to access the secure terminal and synchronize your assets across the Matrix.</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Gradient Menu - The new amazing navigation */}
        <GradientMenu />
      </main>
    </div>
  );
}

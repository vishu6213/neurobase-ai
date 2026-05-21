"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Zap, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import { WalletButton } from "@/components/wallet-button";
import { Magnetic } from "@/components/ui/magnetic";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

const statsData = [
  { value: "12,400+", label: "Active Agents",       icon: Bot },
  { value: "$2.8B+",  label: "TVL Analyzed",        icon: TrendingUp },
  { value: "840K+",   label: "Signals Generated",   icon: Zap },
  { value: "99.8%",   label: "Uptime SLA",          icon: Shield },
];

const taglines = [
  "Trade Smarter on Base",
  "Analyze Onchain Alpha",
  "Manage Your Portfolio",
  "Discover DeFi Signals",
];

export function HeroSection() {
  const [count, setCount] = useState(0);
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const handleLaunchTerminal = (e: React.MouseEvent) => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">

      {/* Ambient radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-yellow-500/5 rounded-full blur-[160px]" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-orange-600/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-[100px]" />
      </div>

      {/* "Now Live" badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8"
      >
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.3)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 0 30px rgba(255,215,0,0.1)',
          }}
        >
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <span className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.3em]">
            Now Live on Base Mainnet
          </span>
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
        </div>
      </motion.div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center px-6 max-w-6xl"
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
          <span className="block text-white">Autonomous</span>
          <span className="block hero-gradient-text">Onchain</span>
          <span className="block text-white">Intelligence</span>
        </h1>

        {/* Rotating tagline */}
        <div className="h-12 overflow-hidden relative mb-8">
          {taglines.map((t, i) => (
            <motion.p
              key={t}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: i === count ? 1 : 0, y: i === count ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl text-neutral-400 font-semibold"
            >
              {t}
            </motion.p>
          ))}
        </div>

        <p className="text-base md:text-lg text-neutral-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          NeuroBase AI is an autonomous AI agent platform built on Base L2.
          Connect your wallet, analyze markets, and discover alpha — all powered by Gemini AI and Coinbase AgentKit.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
          <Magnetic>
            <motion.button
              onClick={handleLaunchTerminal}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 text-black"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FF8800)',
                boxShadow: '0 0 60px rgba(255,215,0,0.45), 0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              Launch Terminal <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Magnetic>
          <Magnetic>
            <WalletButton />
          </Magnetic>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-24 max-w-4xl w-full mx-6 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {statsData.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="group flex flex-col items-center justify-center py-8 px-6 relative overflow-hidden cursor-default"
            style={{ background: 'rgba(0,0,0,0.5)', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            {/* Hover gold wash */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,215,0,0.07) 0%, transparent 70%)' }}
            />
            <stat.icon className="w-4 h-4 text-yellow-500/50 mb-2 group-hover:text-yellow-400 transition-colors" />
            <p className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors relative z-10">
              {stat.value}
            </p>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest relative z-10">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-16 bg-gradient-to-b from-yellow-500/50 to-transparent" />
        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Scroll</p>
      </motion.div>
    </section>
  );
}

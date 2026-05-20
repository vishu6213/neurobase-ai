"use client";

import { motion } from "framer-motion";
import { Bot, TrendingUp, Shield, Zap, BarChart2, Search, Layers, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agent Copilot",
    description:
      "Chat with a Gemini-powered AI agent that understands Base ecosystem, answers DeFi questions, and suggests trading strategies.",
    color: "gold",
    badge: "Core",
    glow: "rgba(255,215,0,0.15)",
  },
  {
    icon: TrendingUp,
    title: "AI Trading Signals",
    description:
      "Get AI-generated buy/sell signals with confidence scores, entry/exit levels, and technical analysis summaries.",
    color: "red",
    badge: "Alpha",
    glow: "rgba(255,60,60,0.15)",
  },
  {
    icon: Shield,
    title: "Risk Analyzer",
    description:
      "Detect rug pulls, honeypots, and suspicious contracts before you interact. AI-powered safety scoring for any token on Base.",
    color: "gold",
    badge: "Safety",
    glow: "rgba(255,215,0,0.15)",
  },
  {
    icon: BarChart2,
    title: "Portfolio Analytics",
    description:
      "3D portfolio visualization with real-time balance tracking, P&L analysis, allocation charts, and AI diversification suggestions.",
    color: "cyan",
    badge: "Analytics",
    glow: "rgba(0,220,255,0.12)",
  },
  {
    icon: Zap,
    title: "Token Swap",
    description:
      "Safe token swapping on Base with price simulation, slippage controls, and mandatory confirmation step before any execution.",
    color: "gold",
    badge: "DeFi",
    glow: "rgba(255,215,0,0.15)",
  },
  {
    icon: Search,
    title: "Alpha Hunter",
    description:
      "Discover trending Base projects, track smart money wallets, and get AI-curated alpha feeds from the Base ecosystem.",
    color: "red",
    badge: "Intel",
    glow: "rgba(255,60,60,0.15)",
  },
];

const colorMap = {
  gold: { text: "text-yellow-400", border: "border-yellow-400/25", bg: "bg-yellow-400/10", badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30" },
  red:  { text: "text-red-400",    border: "border-red-400/25",    bg: "bg-red-400/10",    badge: "bg-red-400/15 text-red-300 border-red-400/30" },
  cyan: { text: "text-cyan-400",   border: "border-cyan-400/25",   bg: "bg-cyan-400/10",   badge: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30" },
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function FeaturesSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[700px] h-[700px] bg-yellow-500/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/4 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-1/3 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Layers className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-black text-yellow-400/80 uppercase tracking-[0.25em]">Platform Features</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-6">
            Everything You Need{" "}
            <span className="hero-gradient-text">Onchain</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
            A complete AI-powered crypto copilot platform built specifically for the Base ecosystem.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, i) => {
            const c = colorMap[feature.color as keyof typeof colorMap];
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="group relative rounded-3xl overflow-hidden cursor-default"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                  style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${feature.glow} 0%, transparent 70%)` }}
                />
                {/* Top border highlight */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${feature.glow.replace('0.15', '0.8').replace('0.12', '0.8')}, transparent)` }}
                />

                <div className="relative z-10 p-8">
                  {/* Icon + Badge */}
                  <div className="flex items-start justify-between mb-7">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.bg} ${c.border} border group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 ${c.text}`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.badge}`}>
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className={`text-lg font-black uppercase tracking-tight mb-3 transition-colors duration-300 text-white group-hover:${c.text}`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{feature.description}</p>

                  {/* Animated bottom line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                    style={{ background: `linear-gradient(90deg, transparent, ${feature.glow.replace('0.15', '0.6').replace('0.12', '0.6')}, transparent)` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

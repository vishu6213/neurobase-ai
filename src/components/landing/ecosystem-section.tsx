"use client";

import { motion } from "framer-motion";
import { Globe, ExternalLink, TrendingUp } from "lucide-react";

const ecosystems = [
  { name: "Aerodrome", category: "DEX", tvl: "$450M", emoji: "🔵", color: "blue", desc: "The primary DEX and liquidity hub on Base.", change: "+12.4%" },
  { name: "Moonwell",  category: "Lending", tvl: "$210M", emoji: "🌙", color: "purple", desc: "Decentralized lending and borrowing protocol.", change: "+8.2%" },
  { name: "BaseSwap",  category: "DEX", tvl: "$85M", emoji: "⚡", color: "gold", desc: "AMM built natively for the Base ecosystem.", change: "+5.6%" },
  { name: "Extra Finance", category: "Yield", tvl: "$120M", emoji: "📈", color: "green", desc: "Leveraged yield farming and liquidity vaults.", change: "+3.1%" },
  { name: "Seamless",  category: "Lending", tvl: "$95M", emoji: "🌊", color: "cyan", desc: "Native Base lending protocol with seamless UX.", change: "+6.8%" },
  { name: "Morpho Blue", category: "DeFi", tvl: "$310M", emoji: "🔮", color: "violet", desc: "Efficient lending with isolated risk markets.", change: "+9.3%" },
];

const colorBorder: Record<string, string> = {
  blue:   "rgba(59,130,246,0.3)",
  purple: "rgba(168,85,247,0.3)",
  gold:   "rgba(255,215,0,0.3)",
  green:  "rgba(34,197,94,0.3)",
  cyan:   "rgba(6,182,212,0.3)",
  violet: "rgba(139,92,246,0.3)",
};
const colorText: Record<string, string> = {
  blue:   "text-blue-400",
  purple: "text-purple-400",
  gold:   "text-yellow-400",
  green:  "text-emerald-400",
  cyan:   "text-cyan-400",
  violet: "text-violet-400",
};
const colorGlow: Record<string, string> = {
  blue:   "rgba(59,130,246,0.12)",
  purple: "rgba(168,85,247,0.12)",
  gold:   "rgba(255,215,0,0.12)",
  green:  "rgba(34,197,94,0.12)",
  cyan:   "rgba(6,182,212,0.12)",
  violet: "rgba(139,92,246,0.12)",
};

export function EcosystemSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-600/3 rounded-full blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto">
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
            <Globe className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-black text-yellow-400/80 uppercase tracking-[0.25em]">Base Ecosystem</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-6">
            Explore The <span className="hero-gradient-text">Base</span> Universe
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-lg leading-relaxed">
            NeuroBase AI integrates deeply with the leading protocols on Base,
            giving you AI-powered insights across the entire ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ecosystems.map((eco, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl overflow-hidden cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(ellipse 80% 70% at 50% 0%, ${colorGlow[eco.color]} 0%, transparent 70%)` }}
              />
              {/* Hover border */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ boxShadow: `inset 0 0 0 1px ${colorBorder[eco.color]}` }}
              />

              <div className="relative z-10 p-6">
                <div className="flex items-start gap-4">
                  {/* Logo circle */}
                  <div
                    className="w-13 h-13 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `${colorGlow[eco.color].replace('0.12', '0.2')}`,
                      border: `1px solid ${colorBorder[eco.color]}`,
                      width: '52px', height: '52px',
                    }}
                  >
                    {eco.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className={`font-black text-white uppercase tracking-tight group-hover:${colorText[eco.color]} transition-colors duration-300`}>
                        {eco.name}
                      </h3>
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                        style={{
                          background: colorGlow[eco.color],
                          borderColor: colorBorder[eco.color],
                          color: colorBorder[eco.color].replace('rgba(', '').replace(',0.3)', '').replace(',', ',') ,
                        }}
                      >
                        {eco.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">{eco.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-neutral-500">
                        TVL: <span className="text-white">{eco.tvl}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400">
                        <TrendingUp className="w-3 h-3" />{eco.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Base branding pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]">B</div>
            <span className="text-sm font-black text-neutral-400 uppercase tracking-widest">Built on Base — Powered by Coinbase</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

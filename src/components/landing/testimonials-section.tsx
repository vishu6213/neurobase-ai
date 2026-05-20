"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "DeFi Trader",
    avatar: "AR",
    content:
      "NeuroBase AI is hands down the best crypto copilot I've used. The AI signals and risk analyzer saved me from two rug pulls last month. 100% worth it.",
    stars: 5,
    color: "gold",
  },
  {
    name: "Sarah Chen",
    role: "Base Ecosystem Dev",
    avatar: "SC",
    content:
      "As a developer building on Base, having an AI that understands the ecosystem deeply is invaluable. The alpha feed surfaces projects I would've missed.",
    stars: 5,
    color: "cyan",
  },
  {
    name: "Marcus Webb",
    role: "Portfolio Manager",
    avatar: "MW",
    content:
      "The portfolio analytics with 3D visualization is stunning. Finally a tool that makes onchain data actually beautiful and actionable.",
    stars: 5,
    color: "violet",
  },
  {
    name: "Elena Kowalski",
    role: "NFT Collector",
    avatar: "EK",
    content:
      "Love the NFT explorer — the AI rarity insights are spot on. Found three undervalued collections through the alpha feed that mooned weeks later.",
    stars: 5,
    color: "gold",
  },
  {
    name: "Jordan Park",
    role: "Crypto Analyst",
    avatar: "JP",
    content:
      "The streaming AI chat is incredibly fast. I use it to analyze token contracts, understand protocol risks, and generate trade thesis. This is the future.",
    stars: 5,
    color: "red",
  },
  {
    name: "Priya Sharma",
    role: "Web3 Founder",
    avatar: "PS",
    content:
      "Built our community's analytics dashboard using NeuroBase AI. The API is clean, the data is fresh, and the UX is premium. Highly recommend.",
    stars: 5,
    color: "cyan",
  },
];

const avatarGrad: Record<string, string> = {
  gold:   'linear-gradient(135deg, #FFD700, #FF8800)',
  cyan:   'linear-gradient(135deg, #06b6d4, #3b82f6)',
  violet: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  red:    'linear-gradient(135deg, #ef4444, #f97316)',
};

export function TestimonialsSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-red-600/3 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black text-yellow-400/80 uppercase tracking-[0.25em]">Testimonials</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-6">
            Loved by <span className="hero-gradient-text">Onchain</span> Operators
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-lg">
            Join thousands of traders, developers, and collectors already using NeuroBase AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl overflow-hidden cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.015) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              {/* Hover top glow */}
              <div
                className="absolute top-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `linear-gradient(to bottom, ${avatarGrad[t.color].replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0]}18 0%, transparent 100%)` }}
              />

              <div className="relative z-10 p-7">
                {/* Quote icon */}
                <Quote className="w-7 h-7 text-yellow-500/30 mb-5" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-sm text-neutral-300 leading-relaxed mb-6">{t.content}</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black text-black flex-shrink-0"
                    style={{ background: avatarGrad[t.color] }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{t.name}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

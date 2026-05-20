"use client";

import { motion } from "framer-motion";
import { Check, Zap, Crown, X } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to get started on Base.",
    icon: Zap,
    color: "white",
    features: [
      "AI Chat (20 messages/day)",
      "Portfolio Analytics",
      "Live Token Prices",
      "Basic Risk Analyzer",
      "NFT Explorer",
      "Base Ecosystem Discovery",
      "Wallet Connection",
    ],
    limitations: ["No AI Trading Signals", "No Alpha Hunter", "No Swap Simulation"],
    cta: "Get Started Free",
    href: "/dashboard",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Full AI power for serious onchain operators.",
    icon: Crown,
    color: "gold",
    features: [
      "Unlimited AI Chat",
      "AI Trading Signals",
      "Alpha Hunter (Full Access)",
      "Advanced Risk Analyzer",
      "Swap Simulation & Execution",
      "Whale Wallet Tracking",
      "Smart Money Alerts",
      "AI Market Intelligence",
      "Priority Support",
      "API Access",
    ],
    limitations: [],
    cta: "Start Pro — Coming Soon",
    href: "/dashboard",
    featured: true,
  },
];

export function PricingSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden" id="pricing">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-yellow-500/4 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">
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
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-black text-yellow-400/80 uppercase tracking-[0.25em]">Pricing</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-6">
            Simple, <span className="hero-gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-lg">
            Start free. Upgrade when you need more power. No hidden fees, no lock-in.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: plan.featured
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,100,0,0.04) 50%, rgba(255,255,255,0.03) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: plan.featured
                  ? '1px solid rgba(255,215,0,0.25)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: plan.featured
                  ? '0 0 60px rgba(255,215,0,0.08), 0 8px 32px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {/* Top shine line for featured */}
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.7), transparent)' }}
                />
              )}

              {/* Most popular badge */}
              {plan.featured && (
                <div className="absolute top-6 right-6">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FF8800)', boxShadow: '0 0 20px rgba(255,215,0,0.4)' }}
                  >
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${plan.featured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/8 text-white'}`}
                    style={{ border: plan.featured ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-2">{plan.name}</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-6xl font-black text-white">{plan.price}</span>
                    <span className="text-sm text-neutral-500 mb-2">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-neutral-400">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.featured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-white font-medium">{feat}</span>
                    </div>
                  ))}
                  {plan.limitations.map((lim, j) => (
                    <div key={j} className="flex items-center gap-3 opacity-35">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/5 text-neutral-600">
                        <X className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-neutral-600 line-through">{lim}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href={plan.href}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
                    style={plan.featured ? {
                      background: 'linear-gradient(135deg, #FFD700, #FF8800)',
                      color: '#000',
                      boxShadow: '0 0 40px rgba(255,215,0,0.35)',
                    } : {
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[11px] text-neutral-600 mt-10 uppercase tracking-widest font-black"
        >
          No credit card required for Free plan • Payment integration coming soon
        </motion.p>
      </div>
    </section>
  );
}

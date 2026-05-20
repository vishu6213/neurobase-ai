"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Bot, Shield } from "lucide-react";
import Link from "next/link";
import { WalletButton } from "@/components/wallet-button";

const pillars = [
  { icon: Bot,    label: "AI Copilot",       color: "rgba(255,215,0,0.8)" },
  { icon: Shield, label: "Secure by Design",  color: "rgba(0,220,255,0.8)" },
  { icon: Zap,    label: "Base Native",        color: "rgba(255,100,0,0.8)" },
];

export function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Wide ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/3 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-yellow-500/4 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(255,100,0,0.04) 40%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,215,0,0.2)',
            boxShadow: '0 0 80px rgba(255,215,0,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.7), rgba(255,100,0,0.5), transparent)' }}
          />
          {/* Bottom shine */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,60,60,0.4), transparent)' }}
          />
          {/* Corner ambient */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[90px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,100,0,0.1))',
                border: '1px solid rgba(255,215,0,0.35)',
                boxShadow: '0 0 40px rgba(255,215,0,0.25)',
              }}
            >
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none mb-6">
              Ready to Trade <br />
              <span className="hero-gradient-text">Smarter?</span>
            </h2>

            <p className="text-neutral-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              Join thousands of onchain operators using NeuroBase AI to navigate the Base ecosystem
              with confidence. Start free, no credit card required.
            </p>

            {/* Feature pills */}
            <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
              {pillars.map((p, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                  <span className="text-[11px] font-black text-neutral-300 uppercase tracking-widest">{p.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 text-black"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FF8800)',
                    boxShadow: '0 0 50px rgba(255,215,0,0.45)',
                  }}
                >
                  Launch Terminal <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <WalletButton />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

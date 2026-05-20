"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What is NeuroBase AI?",
    a: "NeuroBase AI is an autonomous AI-powered crypto copilot platform built on Base L2. It combines Gemini AI, Coinbase AgentKit, and real-time blockchain data to give you intelligent onchain assistance — from portfolio analytics to trading signals and risk analysis.",
  },
  {
    q: "Do I need to connect my wallet?",
    a: "Wallet connection is optional but recommended. Without a wallet, you can still use the AI chat, explore market data, and view the platform. Connecting your wallet unlocks live portfolio tracking, balance display, and token swap functionality.",
  },
  {
    q: "Is my wallet safe?",
    a: "Absolutely. NeuroBase AI never requests private keys and never executes transactions without your explicit confirmation. Swap and transfer actions always show a confirmation modal before anything happens. We prioritize non-custodial, safe interactions.",
  },
  {
    q: "What blockchain does NeuroBase AI support?",
    a: "NeuroBase AI is built specifically for Base (Chain ID: 8453), Coinbase's L2 network. Base offers fast finality (~1s), very low fees (~$0.01/tx), and a growing ecosystem of DeFi protocols, NFTs, and dApps.",
  },
  {
    q: "Are the trading signals financial advice?",
    a: "No. All AI-generated signals, market summaries, and trading ideas are educational and informational only. They do not constitute financial advice. Always do your own research before making investment decisions.",
  },
  {
    q: "What AI model powers the assistant?",
    a: "The AI assistant is powered by Google Gemini (gemini-1.5-flash), integrated with Coinbase AgentKit for onchain context. The AI has specific knowledge of Base ecosystem protocols, DeFi strategies, and blockchain concepts.",
  },
  {
    q: "How is the Pro plan different from Free?",
    a: "The Free plan gives you access to AI chat (20 messages/day), portfolio analytics, and basic tools. Pro unlocks unlimited AI chat, AI trading signals, the Alpha Hunter, advanced risk analysis, swap simulation, and whale tracking. Pro payment integration is coming soon.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 relative overflow-hidden" id="faq">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-yellow-500/3 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto">
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
            <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-black text-yellow-400/80 uppercase tracking-[0.25em]">FAQ</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-6">
            Common <span className="hero-gradient-text">Questions</span>
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-lg">
            Everything you need to know about NeuroBase AI.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-2xl transition-all duration-300"
              style={{
                background: open === i
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(255,100,0,0.03) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: open === i
                  ? '1px solid rgba(255,215,0,0.2)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: open === i
                  ? '0 0 30px rgba(255,215,0,0.05), 0 4px 24px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left group"
                id={`faq-${i}`}
              >
                <span className={`font-black text-sm uppercase tracking-tight transition-colors duration-200 ${open === i ? 'text-yellow-400' : 'text-white group-hover:text-yellow-400/80'}`}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className={`ml-4 flex-shrink-0 transition-colors duration-200 ${open === i ? 'text-yellow-400' : 'text-neutral-500'}`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="px-6 pb-6">
                      <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.3), transparent)' }} />
                      <p className="text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

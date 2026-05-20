"use client";

import { Bot, GitBranch, ExternalLink, Globe } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Chat", href: "/dashboard/chat" },
    { label: "Portfolio", href: "/dashboard/portfolio" },
    { label: "Signals", href: "/dashboard/signals" },
    { label: "Swap", href: "/dashboard/swap" },
    { label: "NFTs", href: "/dashboard/nfts" },
  ],
  Tools: [
    { label: "Risk Analyzer", href: "/dashboard/risk" },
    { label: "Alpha Hunter", href: "/dashboard/alpha" },
    { label: "Market Intel", href: "/dashboard/market" },
    { label: "Settings", href: "/dashboard/settings" },
  ],
  Ecosystem: [
    { label: "Base Network", href: "https://base.org" },
    { label: "Coinbase AgentKit", href: "https://docs.cdp.coinbase.com/agentkit" },
    { label: "Aerodrome", href: "https://aerodrome.finance" },
    { label: "BaseScan", href: "https://basescan.org" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Risk Disclaimer", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="pt-16 pb-8 px-6 relative"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,215,0,0.1)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Bot className="text-black w-6 h-6" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter italic text-white">
                Neuro<span className="text-yellow-500">Base</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Autonomous AI-powered onchain intelligence for the Base ecosystem.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"
              >
                <GitBranch className="w-4 h-4 text-muted-foreground hover:text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-white" />
              </a>
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"
              >
                <Globe className="w-4 h-4 text-muted-foreground hover:text-white" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                {category}
              </p>
              <div className="space-y-2.5">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-black">
            © 2025 NeuroBase AI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">B</div>
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-black">
              Built on Base — Powered by Coinbase AgentKit + Gemini AI
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/30 uppercase tracking-widest font-black text-center">
            ⚠️ Not Financial Advice — Educational Platform Only
          </p>
        </div>
      </div>
    </footer>
  );
}

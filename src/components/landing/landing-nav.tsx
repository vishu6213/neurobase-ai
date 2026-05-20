"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Menu, X } from "lucide-react";
import Link from "next/link";
import { WalletButton } from "@/components/wallet-button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Bot className="text-black w-5 h-5" />
          </div>
          <span className="text-lg font-black uppercase tracking-tighter italic text-white">
            Neuro<span className="text-yellow-500">Base</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-black text-muted-foreground hover:text-white uppercase tracking-widest transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard">
            <button className="h-9 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/30 text-[11px] font-black text-white uppercase tracking-widest transition-all">
              Dashboard
            </button>
          </Link>
          <WalletButton />
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-black/95 border-b border-white/5 p-6 space-y-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-black text-muted-foreground hover:text-white uppercase tracking-widest transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <Link href="/dashboard">
              <button className="w-full h-12 rounded-xl bg-yellow-500 text-black font-black uppercase tracking-widest text-sm">
                Launch Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

const tickerData = [
  { symbol: "ETH",   price: "$2,481.20",  change: "+3.24%", up: true },
  { symbol: "BTC",   price: "$67,450.80", change: "+1.89%", up: true },
  { symbol: "BASE",  price: "$0.412",     change: "+8.14%", up: true },
  { symbol: "USDC",  price: "$1.000",     change: "+0.01%", up: true },
  { symbol: "AERO",  price: "$1.148",     change: "+5.62%", up: true },
  { symbol: "DEGEN", price: "$0.0124",    change: "-2.31%", up: false },
  { symbol: "TOSHI", price: "$0.000451",  change: "+12.4%", up: true },
  { symbol: "CBETH", price: "$2,510.40",  change: "+2.98%", up: true },
  { symbol: "BRETT", price: "$0.0834",    change: "-1.14%", up: false },
  { symbol: "MOCHI", price: "$0.00312",   change: "+7.89%", up: true },
  { symbol: "SOL",   price: "$168.30",    change: "+4.21%", up: true },
  { symbol: "LINK",  price: "$13.45",     change: "+2.76%", up: true },
];

export function TickerBar() {
  return (
    <div className="w-full overflow-hidden py-3 relative"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,215,0,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)',
      }}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9), transparent)' }}
      />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent)' }}
      />

      <div className="ticker-scroll-wrapper">
        <div className="ticker-scroll-track flex items-center gap-10">
          {[...tickerData, ...tickerData].map((item, i) => (
            <div key={i} className="flex items-center gap-3 flex-shrink-0">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">
                {item.symbol}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">{item.price}</span>
              <span className={`flex items-center gap-1 text-[11px] font-black ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                {item.up
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {item.change}
              </span>
              <div className="w-px h-4 bg-white/8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

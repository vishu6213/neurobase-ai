'use client';

import React from 'react';
import {
  IoGridOutline,
  IoChatbubbleEllipsesOutline,
  IoWalletOutline,
  IoStatsChartOutline,
  IoSettingsOutline,
  IoPulseOutline,
  IoRepeatOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoImageOutline
} from 'react-icons/io5';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Overview', href: '/dashboard', icon: <IoGridOutline />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'AI Agent', href: '/dashboard/chat', icon: <IoChatbubbleEllipsesOutline />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Portfolio', href: '/dashboard/portfolio', icon: <IoWalletOutline />, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Market', href: '/dashboard/market', icon: <IoStatsChartOutline />, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Signals', href: '/dashboard/signals', icon: <IoPulseOutline />, gradientFrom: '#F7971E', gradientTo: '#FFD200' },
  { title: 'Swap', href: '/dashboard/swap', icon: <IoRepeatOutline />, gradientFrom: '#11998e', gradientTo: '#38ef7d' },
  { title: 'NFTs', href: '/dashboard/nfts', icon: <IoImageOutline />, gradientFrom: '#8E2DE2', gradientTo: '#4A00E0' },
  { title: 'Risk', href: '/dashboard/risk', icon: <IoShieldCheckmarkOutline />, gradientFrom: '#FF416C', gradientTo: '#FF4B2B' },
  { title: 'Alpha', href: '/dashboard/alpha', icon: <IoSparklesOutline />, gradientFrom: '#c0392b', gradientTo: '#8e44ad' },
  { title: 'Settings', href: '/dashboard/settings', icon: <IoSettingsOutline />, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' }
];

export function GradientMenu() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex justify-center items-center">
      <ul className="flex gap-4 p-4 glass-card rounded-[40px] border-white/10 shadow-2xl">
        {menuItems.map(({ title, href, icon, gradientFrom, gradientTo }, idx) => {
          const isActive = pathname === href;

          return (
            <Link key={idx} href={href}>
              <li
                style={{
                  '--gradient-from': gradientFrom,
                  '--gradient-to': gradientTo
                } as React.CSSProperties}
                className={cn(
                  "relative w-[60px] h-[60px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center transition-all duration-500 hover:w-[160px] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group cursor-pointer overflow-hidden",
                  isActive && "w-[160px] bg-white shadow-xl"
                )}
              >
                {/* Gradient background on hover/active */}
                <span className={cn(
                  "absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100",
                  isActive && "opacity-100"
                )}></span>

                {/* Blur glow */}
                <span className={cn(
                  "absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50",
                  isActive && "opacity-50"
                )}></span>

                {/* Icon */}
                <span className={cn(
                  "relative z-10 transition-all duration-500 group-hover:scale-0 delay-0",
                  isActive && "scale-0"
                )}>
                  <span className={cn(
                    "text-2xl text-muted-foreground group-hover:text-white transition-colors",
                    isActive && "text-white"
                  )}>{icon}</span>
                </span>

                {/* Title */}
                <span className={cn(
                  "absolute text-white uppercase font-black tracking-widest text-[10px] transition-all duration-500 scale-0 group-hover:scale-100 delay-150",
                  isActive && "scale-100"
                )}>
                  {title}
                </span>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}

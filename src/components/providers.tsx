"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { VFXBackground } from "@/components/vfx-background";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { usePathname } from "next/navigation";

function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isOverview = pathname === "/dashboard";

  return (
    <SmoothScroll>
      {/* Global Background Engine */}
      <div className="fixed inset-0 -z-20 bg-black" />
      {isOverview && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <PrismaHero isBackgroundOnly />
        </div>
      )}

      {/* App Content Layer */}
      <div className="min-h-screen bg-transparent text-white relative z-10">
        {children}
      </div>
    </SmoothScroll>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <Web3Provider>
        <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
          <ContentWrapper>{children}</ContentWrapper>
        </React.Suspense>
      </Web3Provider>
    </ThemeProvider>
  );
}

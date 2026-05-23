"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { base, mainnet, polygon, arbitrum, optimism, bsc } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "85a8501069f7ed6f38b14e661642116d";

const config = getDefaultConfig({
  appName: "NeuroBase AI",
  projectId,
  chains: [base, mainnet, polygon, arbitrum, optimism, bsc],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
  },
});

// Appends the ERC-8021 standard dataSuffix for transaction attribution on Base
// Setting directly to preserve prototype chain and Wagmi config methods
(config as any).dataSuffix = "0x62635f786d3661613677730b0080218021802180218021802180218021";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Improved React 19 compatibility patch
    // Only apply if we're in a browser and not already patched
    if (typeof window !== 'undefined' && !(window as any).__NBAI_PATCHED__) {
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = (tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === 'iframe') {
          const originalSetAttribute = element.setAttribute.bind(element);
          element.setAttribute = (name: string, value: string) => {
            // Fix for libraries passing numeric border=0 which React 19 dislikes on iframes
            if (name === 'border' && value === '0') return;
            originalSetAttribute(name, value);
          };
        }
        return element;
      };
      (window as any).__NBAI_PATCHED__ = true;
    }
  }, []);

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#facc15", // NeuroBase Yellow
            accentColorForeground: "black",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

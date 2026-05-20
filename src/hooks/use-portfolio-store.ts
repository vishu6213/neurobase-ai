import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortfolioState {
   totalValue: number;
   tokens: any[];
   nativeBalances: Record<string, any>;
   prevPrices: Record<string, number>;
   ethPrice: number;
   lastUpdated: number;
   connectedAddress: string | null;
   isSyncing: boolean;
   setTotalValue: (val: number) => void;
   setTokens: (tokens: any[]) => void;
   setNativeBalances: (balances: Record<string, any>) => void;
   setPrevPrices: (prices: Record<string, number>) => void;
   setEthPrice: (price: number) => void;
   setConnectedAddress: (addr: string | null) => void;
   setIsSyncing: (syncing: boolean) => void;
   clearStore: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
   persist(
      (set) => ({
         totalValue: 0,
         tokens: [],
         nativeBalances: {},
         prevPrices: {},
         ethPrice: 2450,
         lastUpdated: Date.now(),
         connectedAddress: null,
         isSyncing: false,
         setTotalValue: (totalValue) => set({ totalValue, lastUpdated: Date.now() }),
         setTokens: (tokens) => set({ tokens, lastUpdated: Date.now() }),
         setNativeBalances: (nativeBalances) => set({ nativeBalances, lastUpdated: Date.now() }),
         setPrevPrices: (prevPrices) => set({ prevPrices, lastUpdated: Date.now() }),
         setEthPrice: (ethPrice) => set({ ethPrice, lastUpdated: Date.now() }),
         setConnectedAddress: (connectedAddress) => set({ connectedAddress }),
         setIsSyncing: (isSyncing) => set({ isSyncing }),
         clearStore: () => set({ 
            totalValue: 0, 
            tokens: [], 
            nativeBalances: {}, 
            prevPrices: {}, 
            connectedAddress: null,
            isSyncing: false,
            lastUpdated: Date.now() 
         }),
      }),
      {
         name: "neurobase-portfolio-storage",
      }
   )
);

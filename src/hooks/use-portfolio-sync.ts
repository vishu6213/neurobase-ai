"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { usePortfolioStore } from "./use-portfolio-store";

const NETWORKS = [
   { id: "eth", name: "Ethereum", api: "https://eth.blockscout.com/api/v2" },
   { id: "base", name: "Base", api: "https://base.blockscout.com/api/v2" },
   { id: "bsc", name: "BSC", api: "https://bsc.blockscout.com/api/v2" },
   { id: "poly", name: "Polygon", api: "https://polygon.blockscout.com/api/v2" },
   { id: "arb", name: "Arbitrum", api: "https://arbitrum.blockscout.com/api/v2" },
   { id: "op", name: "Optimism", api: "https://optimism.blockscout.com/api/v2" },
   { id: "avax", name: "Avalanche", api: "https://avalanche.blockscout.com/api/v2" },
   { id: "solana", name: "Solana", api: "" }
];

const NATIVE_WRAPPED_ADDRESSES: Record<string, string> = {
   "eth": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
   "bnb": "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
   "matic": "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
   "avax": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
   "sol": "So11111111111111111111111111111111111111112" // Wrapped SOL
};

const PRIORITY_TOKENS: Record<string, any[]> = {
   "base": [
      { addr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6 },
      { addr: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18 },
      { addr: "0x94018130d51403b3068868d9e2c7b4bb00078213", symbol: "AERO", decimals: 18 },
      { addr: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", symbol: "DEGEN", decimals: 18 }
   ],
   "eth": [
      { addr: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", decimals: 6 },
      { addr: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT", decimals: 6 },
      { addr: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", symbol: "WBTC", decimals: 8 }
   ],
   "bsc": [{ addr: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", symbol: "USDC", decimals: 18 }], // USDC is 18 decimals on BSC
   "poly": [{ addr: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", symbol: "USDC", decimals: 6 }],
   "arb": [{ addr: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6 }],
   "op": [{ addr: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC", decimals: 6 }]
};

async function proxiedFetch(url: string, options: any = {}) {
   try {
      const res = await fetch("/api/proxy", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            url,
            method: options.method || "GET",
            body: options.body,
            headers: options.headers
         })
      });

      if (res.status === 429) {
         console.warn(`[Neural Sync] Rate limited by proxy: ${url}`);
         return null;
      }

      if (!res.ok) {
         const errText = await res.text().catch(() => "Unknown error");
         console.warn(`[Neural Sync] Proxy error (${res.status}) for ${url}:`, errText);
         return null;
      }

      return await res.json();
   } catch (e) {
      console.error(`[Neural Sync] Proxied fetch failed for ${url}:`, e instanceof Error ? e.message : String(e));
      return null;
   }
}

export function usePortfolioSync() {
   const { address, isConnected } = useAccount();
   const { data: ethBalance } = useBalance({ address });
   const {
      setTokens, setNativeBalances, setEthPrice, setTotalValue,
      tokens, nativeBalances, ethPrice, prevPrices, setPrevPrices,
      setIsSyncing
   } = usePortfolioStore();

   const syncInProgress = useRef(false);
   const lastSyncTime = useRef(0);

   const sync = useCallback(async (force = false) => {
      if (typeof window === "undefined") return;

      const rawAddr = address;
      if (!rawAddr || syncInProgress.current) return;

      const targetAddr = rawAddr.toLowerCase();

      const now = Date.now();
      if (!force && now - lastSyncTime.current < 15000) return;

      syncInProgress.current = true;
      setIsSyncing(true);
      lastSyncTime.current = now;
      console.log(`[Neural Sync] Starting high-depth scan for ${targetAddr}`);

      try {
         const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
         // Adjusted Alchemy key check: user provided a 21-char key ending in '-'
         const isAlchemyValid = ALCHEMY_KEY && ALCHEMY_KEY.length >= 20;

         if (!isAlchemyValid) {
            console.warn("[Neural Sync] Alchemy API key is missing. Falling back to Blockscout/RPC.");
         }

         // 1. Setup Prices
         let tokenPrices: Record<string, { price: number, change: string }> = {};

         // Fill default prices for common assets
         const defaultPrices: Record<string, number> = {
            "eth": 2450, "bnb": 590, "matic": 0.70, "avax": 35,
            "usdc": 1.0, "usdt": 1.0, "dai": 1.0, "wbtc": 65000, "sol": 145
         };
         Object.entries(defaultPrices).forEach(([sym, price]) => {
            tokenPrices[sym] = { price, change: "+0.0%" };
         });

         // 2. Multi-Chain Discovery
         const tokenMap = new Map<string, any>();
         const localNativeBalances: Record<string, any> = {};

         await Promise.all(NETWORKS.map(async (net) => {
            try {
               let netTokens: any[] = [];
               console.log(`[Neural Sync] Scanning ${net.name}...`);

               // Tier 1: Alchemy
               if (isAlchemyValid) {
                  const alchemySubdomain = net.id === "eth" ? "eth-mainnet" : net.id === "base" ? "base-mainnet" : net.id === "poly" ? "polygon-mainnet" : net.id === "arb" ? "arb-mainnet" : net.id === "op" ? "opt-mainnet" : null;
                  if (alchemySubdomain) {
                     const alcData = await proxiedFetch(`https://${alchemySubdomain}.g.alchemy.com/v2/${ALCHEMY_KEY}`, {
                        method: "POST",
                        body: JSON.stringify({ jsonrpc: "2.0", method: "alchemy_getTokenBalances", params: [targetAddr], id: 1 })
                     });
                     if (alcData?.result?.tokenBalances) {
                        alcData.result.tokenBalances.forEach((b: any) => {
                           if (b.tokenBalance !== "0x0" && b.tokenBalance !== "0x") {
                              netTokens.push({ symbol: "...", name: "Indexed Asset", bal: "0", rawBal: b.tokenBalance, address: b.contractAddress, network: net.name, decimals: 18 });
                           }
                        });
                     }
                  }
               }

               // Tier 2: Blockscout
               if (net.api) {
                  const bsData = await proxiedFetch(`${net.api}/addresses/${targetAddr}/tokens?type=ERC-20`);
                  if (bsData?.items) {
                     bsData.items.forEach((item: any) => {
                        try {
                           const decimals = parseInt(item.token.decimals) || 18;
                           const addr = item.token.address.toLowerCase();
                           const key = `${addr}_${net.id}`;
                           const bal = formatUnits(BigInt(item.value || "0"), decimals);

                           const existing = tokenMap.get(key);
                           if (!existing || parseFloat(bal) > parseFloat(existing.bal)) {
                              tokenMap.set(key, {
                                 symbol: item.token.symbol,
                                 name: item.token.name,
                                 bal: bal,
                                 address: item.token.address,
                                 network: net.name,
                                 logo: item.token.icon_url,
                                 decimals
                              });
                           }
                        } catch (e) { }
                     });
                  }
               }

               // Tier 3: Priority Scanning
               const priorityList = PRIORITY_TOKENS[net.id] || [];
               const rpcMap: Record<string, string> = {
                  "eth": "https://rpc.ankr.com/eth",
                  "base": "https://mainnet.base.org",
                  "bsc": "https://bsc-dataseed.binance.org",
                  "poly": "https://polygon-rpc.com",
                  "arb": "https://arb1.arbitrum.io/rpc",
                  "op": "https://mainnet.optimism.io",
                  "avax": "https://api.avax.network/ext/bc/C/rpc"
               };
               const rpcUrl = rpcMap[net.id];

               if (rpcUrl && priorityList.length > 0) {
                  await Promise.all(priorityList.map(async (token) => {
                     const key = `${token.addr.toLowerCase()}_${net.id}`;
                     if (tokenMap.has(key) && parseFloat(tokenMap.get(key).bal) > 0) return;

                     try {
                        const tokenBalData = await proxiedFetch(rpcUrl, {
                           method: "POST",
                           body: JSON.stringify({
                              jsonrpc: "2.0",
                              method: "eth_call",
                              params: [{ to: token.addr, data: "0x70a08231" + targetAddr.slice(2).padStart(64, '0') }, "latest"],
                              id: 1
                           })
                        });
                        if (tokenBalData?.result && tokenBalData.result !== "0x" && tokenBalData.result.length > 10) {
                           const bal = formatUnits(BigInt(tokenBalData.result), token.decimals);
                           if (parseFloat(bal) > 0) {
                              tokenMap.set(key, {
                                 symbol: token.symbol,
                                 name: token.symbol === "USDC" ? "USD Coin" : token.symbol,
                                 bal: bal,
                                 address: token.addr,
                                 network: net.name,
                                 decimals: token.decimals
                              });
                           }
                        }
                     } catch (e) { }
                  }));
               }

               // Tier 4: Native Balance
               if (rpcUrl) {
                  const rpcData = await proxiedFetch(rpcUrl, {
                     method: "POST",
                     body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBalance", params: [targetAddr, "latest"], id: 1 })
                  });
                  if (rpcData?.result) {
                     const bal = formatUnits(BigInt(rpcData.result), 18);
                     const sym = net.id === "bsc" ? "bnb" : net.id === "poly" ? "matic" : net.id === "avax" ? "avax" : net.id === "solana" ? "sol" : "eth";
                     const price = tokenPrices[sym]?.price || (sym === "bnb" ? 590 : sym === "matic" ? 0.70 : sym === "avax" ? 35 : sym === "sol" ? 145 : 2450);
                     const change = tokenPrices[sym]?.change || "+0.0%";
                     localNativeBalances[net.id] = { bal, price, change };
                     console.log(`[Neural Sync] Found ${bal} ${sym.toUpperCase()} on ${net.name}`);
                  }
               }

            } catch (chainErr) {
               console.warn(`[Neural Sync] ${net.name} scan partially failed:`, chainErr instanceof Error ? chainErr.message : String(chainErr));
            }
         }));

         // 3. Metadata & Logos (DexScreener)
         const allDiscovered = Array.from(tokenMap.values());
         const allAddresses = Array.from(new Set([
            ...allDiscovered.map(t => t.address),
            ...Object.values(NATIVE_WRAPPED_ADDRESSES)
         ])).filter(a => a && a !== "0x0000000000000000000000000000000000000000");

         if (allAddresses.length > 0) {
            const chunks = [];
            for (let i = 0; i < allAddresses.length; i += 30) chunks.push(allAddresses.slice(i, i + 30));
            await Promise.all(chunks.map(async (chunk) => {
               try {
                  const dsData = await proxiedFetch(`https://api.dexscreener.com/latest/dex/tokens/${chunk.join(",")}`);
                  if (dsData?.pairs) {
                     dsData.pairs.forEach((pair: any) => {
                        const addr = pair.baseToken.address.toLowerCase();
                        if (!tokenPrices[addr] || (pair.liquidity?.usd > 5000)) {
                           tokenPrices[addr] = {
                              price: parseFloat(pair.priceUsd),
                              change: (pair.priceChange?.h24 >= 0 ? "+" : "") + (pair.priceChange?.h24?.toFixed(2) || "0.00") + "%"
                           };

                           Object.entries(NATIVE_WRAPPED_ADDRESSES).forEach(([sym, wrappedAddr]) => {
                              if (wrappedAddr.toLowerCase() === addr) {
                                 tokenPrices[sym] = tokenPrices[addr];
                                 Object.keys(localNativeBalances).forEach(netId => {
                                    const nativeSym = netId === "bsc" ? "bnb" : netId === "poly" ? "matic" : netId === "avax" ? "avax" : netId === "solana" ? "sol" : "eth";
                                    if (nativeSym === sym) {
                                       localNativeBalances[netId].price = tokenPrices[addr].price;
                                       localNativeBalances[netId].change = tokenPrices[addr].change;
                                    }
                                 });
                              }
                           });

                           const tIdx = allDiscovered.findIndex(t => t.address?.toLowerCase() === addr);
                           if (tIdx > -1) {
                              if (!allDiscovered[tIdx].symbol || allDiscovered[tIdx].symbol === "...") {
                                 allDiscovered[tIdx].symbol = pair.baseToken.symbol;
                                 allDiscovered[tIdx].name = pair.baseToken.name;
                              }
                              // Capture logo from DexScreener info if available
                              if (pair.info?.imageUrl && !allDiscovered[tIdx].logo) {
                                 allDiscovered[tIdx].logo = pair.info.imageUrl;
                              }
                           }
                        }
                     });
                  }
               } catch (e) { }
            }));
         }

         // 4. Final Asset Mapping
         const finalTokens = allDiscovered.map(t => {
            const addr = t.address?.toLowerCase();
            const symbol = t.symbol?.toLowerCase();
            const marketData = tokenPrices[addr] || tokenPrices[symbol];
            let price = marketData?.price || 0;

            if (["USDC", "USDT", "DAI", "PYUSD"].includes(t.symbol.toUpperCase())) {
               if (price === 0 || Math.abs(price - 1) < 0.1) price = 1.00;
            }

            let bal = t.bal;
            if (t.rawBal && (bal === "0" || !bal)) {
               try {
                  bal = formatUnits(BigInt(t.rawBal), t.decimals || 18);
               } catch (e) {
                  bal = "0";
               }
            }

            // Enhanced Logo Discovery
            let logo = t.logo;
            if (!logo || logo.includes("placeholder") || logo.includes("missing")) {
               const netId = t.network?.toLowerCase();
               const twNetwork = netId === "base" ? "base" : netId === "ethereum" ? "ethereum" : netId === "binance smart chain" ? "binance" : netId === "polygon" ? "polygon" : netId === "arbitrum" ? "arbitrum" : netId === "optimism" ? "optimism" : netId === "avalanche" ? "avalanchex" : "ethereum";
               logo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${twNetwork}/assets/${t.address}/logo.png`;
            }

            return {
               ...t,
               bal,
               price,
               logo,
               usdValue: Math.round(parseFloat(bal) * price * 100) / 100,
               change: marketData?.change || "+0.0%",
               color: "#" + Math.floor(Math.random() * 16777215).toString(16)
            };
         }).filter(t => parseFloat(t.bal) > 0);

         setNativeBalances(localNativeBalances);
         setTokens(finalTokens);

         const tokenTotal = finalTokens.reduce((acc, curr) => acc + (curr.usdValue || 0), 0);
         const nativeTotal = Object.values(localNativeBalances).reduce((acc, curr) => acc + ((parseFloat(curr.bal) || 0) * (curr.price || 0)), 0);
         const grandTotal = Math.round((tokenTotal + nativeTotal) * 100) / 100;

         console.log(`[Neural Sync] Calculation Complete`, { tokenTotal, nativeTotal, grandTotal, tokenCount: finalTokens.length });
         setTotalValue(grandTotal);
         if (localNativeBalances["eth"]) setEthPrice(localNativeBalances["eth"].price);

         usePortfolioStore.getState().setConnectedAddress(targetAddr);

      } catch (error) {
         console.error("[Neural Sync] Critical Error:", error);
      } finally {
         syncInProgress.current = false;
      }
   }, [address, isConnected, setTokens, setTotalValue, setNativeBalances, setEthPrice]);

   useEffect(() => {
      sync();
      const interval = setInterval(sync, 60000); // More frequent background sync
      return () => clearInterval(interval);
   }, [sync]);

   return { sync };
}

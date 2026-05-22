"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccount, useChainId } from "wagmi";

const BG_VIDEO_RISK = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4";

interface SecurityCheck {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

interface RiskReport {
  name: string;
  symbol: string;
  address: string;
  score: number;
  level: "SAFE" | "CAUTION" | "DANGER" | "CRITICAL";
  checks: SecurityCheck[];
  summary: string;
  buyTax: string;
  sellTax: string;
  owner: string;
}

interface RecentScan {
  address: string;
  name: string;
  score: number;
  level: string;
  timestamp: number;
}

const levelColors: Record<string, string> = {
  SAFE: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  CAUTION: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
  DANGER: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  CRITICAL: "text-red-400 border-red-400/30 bg-red-400/5",
};

export default function RiskPage() {
  const [address, setAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const { isConnected } = useAccount();
  const currentChainId = useChainId();

  useEffect(() => {
    const saved = localStorage.getItem("recent_scans");
    if (saved) {
      try {
        setRecentScans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent scans", e);
      }
    }
  }, []);

  const saveToRecent = (newScan: RecentScan) => {
    setRecentScans(prev => {
      const filtered = prev.filter(s => s.address.toLowerCase() !== newScan.address.toLowerCase());
      const updated = [newScan, ...filtered].slice(0, 10);
      localStorage.setItem("recent_scans", JSON.stringify(updated));
      return updated;
    });
  };

  const handleScan = async (scanAddr?: string) => {
    const targetAddr = scanAddr || address;
    if (!targetAddr.trim() || !targetAddr.startsWith("0x")) return;
    
    setScanning(true);
    setReport(null);
    if (!scanAddr) setAddress(targetAddr);

    try {
      const chainId = currentChainId || 8453;
      const response = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${targetAddr}`);
      const json = await response.json();
      
      if (json.code !== 1 || !json.result || !json.result[targetAddr.toLowerCase()]) {
        throw new Error("Invalid response from security provider");
      }

      const data = json.result[targetAddr.toLowerCase()];
      let score = 0;
      const checks: SecurityCheck[] = [];

      const isHoneypot = data.is_honeypot === "1";
      if (isHoneypot) {
        score += 50;
        checks.push({ label: "Honeypot Detected", status: "fail", detail: "This token is a honeypot. You cannot sell it." });
      } else {
        checks.push({ label: "Honeypot Check", status: "pass", detail: "No honeypot patterns detected. Selling is enabled." });
      }

      const bTax = parseFloat(data.buy_tax || "0") * 100;
      const sTax = parseFloat(data.sell_tax || "0") * 100;
      if (bTax > 10 || sTax > 10) {
        score += 20;
        checks.push({ label: "High Taxes", status: "fail", detail: `Buy tax: ${bTax}% | Sell tax: ${sTax}%. Extremely high fees detected.` });
      } else if (bTax > 5 || sTax > 5) {
        score += 10;
        checks.push({ label: "Elevated Taxes", status: "warn", detail: `Buy tax: ${bTax}% | Sell tax: ${sTax}%. Moderate fees detected.` });
      } else {
        checks.push({ label: "Tax Analysis", status: "pass", detail: `Fees are low: ${bTax}% buy / ${sTax}% sell.` });
      }

      const isMintable = data.is_mintable === "1";
      const canTakeBack = data.can_take_back_ownership === "1";
      if (isMintable) {
        score += 15;
        checks.push({ label: "Mintable Supply", status: "fail", detail: "The owner can mint new tokens, potentially diluting holders." });
      }
      if (canTakeBack) {
        score += 15;
        checks.push({ label: "Ownership Risk", status: "fail", detail: "The owner can reclaim contract control even after renouncing." });
      }
      if (!isMintable && !canTakeBack) {
        checks.push({ label: "Ownership Status", status: "pass", detail: "No malicious ownership privileges or minting functions found." });
      }

      const isVerified = data.is_open_source === "1";
      if (!isVerified) {
        score += 20;
        checks.push({ label: "Unverified Code", status: "fail", detail: "The contract source code is not verified. Proceed with extreme caution." });
      } else {
        checks.push({ label: "Source Code", status: "pass", detail: "Contract source code is verified and publicly accessible." });
      }

      const isProxy = data.is_proxy === "1";
      if (isProxy) {
        score += 10;
        checks.push({ label: "Proxy Contract", status: "warn", detail: "Contract is a proxy; logic can be changed by the developer." });
      }

      const finalScore = Math.min(100, score);
      const level = finalScore < 20 ? "SAFE" : finalScore < 45 ? "CAUTION" : finalScore < 75 ? "DANGER" : "CRITICAL";

      const finalReport: RiskReport = {
        name: data.token_name || "Unknown Token",
        symbol: data.token_symbol || "???",
        address: targetAddr,
        score: finalScore,
        level,
        checks,
        summary: data.trust_list === "1" ? "This is a verified blue-chip token." : 
                 finalScore < 20 ? "Token appears safe based on contract analysis." : 
                 finalScore < 45 ? "Use caution. Some minor risk factors detected." : 
                 "Warning: Significant security vulnerabilities found in the contract.",
        buyTax: `${bTax}%`,
        sellTax: `${sTax}%`,
        owner: data.owner_address || "None",
      };

      setReport(finalReport);
      saveToRecent({
        address: targetAddr,
        name: finalReport.name,
        score: finalScore,
        level,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setScanning(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "pass") return <Icons.CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    if (status === "warn") return <Icons.AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    return <Icons.XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
  };

  return (
    <main className="relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white">
      {/* Immersive Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-80 hidden md:block"
      >
        <source src={BG_VIDEO_RISK} type="video/mp4" />
      </video>
      {/* Glowing Mobile Crimson Fallback */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,#220505_0%,#000000_100%)] z-0 md:hidden" />
      <div className="fixed inset-0 bg-black/20 z-0" />

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 py-10 flex flex-col items-center">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">
            <Icons.Shield className="w-3 h-3" /> Security Module
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter liquid-text mb-2">
            Risk Analyzer
          </h1>
          <p className="text-muted-foreground font-medium">
            Real-time on-chain security audits — powered by GoPlus Security & AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Scanner */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <Card className="bg-white/[0.02] backdrop-blur-md border-white/10 p-4 sm:p-6 md:p-8">
              <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6">Scan Token Contract</h2>
              <div className="relative group mb-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-yellow-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                <div className="relative flex gap-3">
                  <div className="relative flex-1">
                    <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                      placeholder="Paste token contract address (0x...)"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-yellow-500/50 transition-all text-white placeholder:text-muted-foreground font-mono"
                    />
                  </div>
                  <Button
                    onClick={() => handleScan()}
                    disabled={!address.trim() || scanning}
                    className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all disabled:opacity-30"
                  >
                    {scanning ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Shield className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Quick scan buttons */}
              <div className="flex flex-wrap gap-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-full mb-1">Common Tokens:</p>
                {[
                  { label: "USDC", addr: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
                  { label: "DEGEN", addr: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" },
                  { label: "AERO", addr: "0x94018130Dd388f9C212046182e56c05C29b4e2C0" },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleScan(t.addr)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground hover:text-white hover:border-yellow-500/30 transition-all uppercase tracking-widest"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Report */}
            <AnimatePresence mode="wait">
              {scanning ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="scanning">
                  <Card className="bg-white/[0.02] backdrop-blur-md border-white/10 p-4 sm:p-6 md:p-8 text-center py-12">
                      <div className="relative mb-4 mx-auto w-fit">
                        <div className="w-20 h-20 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                        <Icons.Shield className="absolute inset-0 m-auto w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-widest">Scanning Contract...</p>
                      <p className="text-xs text-muted-foreground">Pulling live security data from multiple providers</p>
                  </Card>
                </motion.div>
              ) : report ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key="report" className="space-y-4">
                  {/* Score card */}
                  <Card className={cn("bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 md:p-8 border transition-colors", levelColors[report.level])}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-2xl font-black text-white">{report.name}</p>
                          <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded bg-white/5">{report.symbol}</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1">
                          {report.address.substring(0, 12)}...{report.address.substring(38)}
                          <button onClick={() => navigator.clipboard.writeText(report.address)} className="hover:text-white"><Icons.Copy className="w-3 h-3" /></button>
                        </p>
                        
                        <div className="flex items-end gap-3">
                          <p className="text-6xl font-black text-white">{report.score}</p>
                          <p className="text-muted-foreground text-lg mb-1">/100 Risk Score</p>
                        </div>
                      </div>
                      <div className={cn("px-8 py-4 rounded-3xl border text-3xl font-black uppercase tracking-widest flex items-center justify-center", levelColors[report.level])}>
                        {report.level}
                      </div>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${report.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          report.score < 20 ? "bg-emerald-400" :
                          report.score < 45 ? "bg-yellow-500" :
                          report.score < 75 ? "bg-orange-400" : "bg-red-500"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Buy Tax</p>
                        <p className="text-sm font-black text-white">{report.buyTax}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Sell Tax</p>
                        <p className="text-sm font-black text-white">{report.sellTax}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 md:col-span-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Contract Owner</p>
                        <p className="text-[11px] font-mono text-white truncate">{report.owner}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
                  </Card>

                  {/* Audit Results */}
                  <Card className="bg-white/[0.02] backdrop-blur-xl border-white/10 p-6 space-y-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Security Audit Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {report.checks.map((check, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border",
                            check.status === "pass" ? "bg-emerald-400/3 border-emerald-400/10" :
                            check.status === "warn" ? "bg-yellow-500/3 border-yellow-500/10" :
                            "bg-red-400/5 border-red-400/20"
                          )}
                        >
                          {statusIcon(check.status)}
                          <div>
                            <p className="text-sm font-black text-white mb-1">{check.label}</p>
                            <p className="text-xs text-muted-foreground leading-tight">{check.detail}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/[0.02] backdrop-blur-md border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Icons.History className="w-4 h-4 text-yellow-500" /> Recent Scans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentScans.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No recent scans found</p>
                ) : (
                  recentScans.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleScan(s.address)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 transition-all text-left group"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm font-black text-white group-hover:text-yellow-500 transition-colors truncate">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground font-mono truncate">{s.address}</p>
                      </div>
                      <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase border shrink-0", levelColors[s.level])}>
                        {s.score}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] backdrop-blur-md border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Info className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-black text-white uppercase">GoPlus Intelligence</span>
              </div>
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="flex gap-3">
                  <Icons.Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                  <p><strong className="text-white">Real-time Scanning</strong> — Logic scans current contract state directly from the node.</p>
                </div>
                <div className="flex gap-3">
                  <Icons.AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                  <p><strong className="text-white">Tax Evasion</strong> — Detects malicious tax modifications and hidden fees.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

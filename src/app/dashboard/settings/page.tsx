"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Crown,
  Wallet,
  Eye,
  EyeOff,
  Check,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/wallet-button";

const BG_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

const sections = ["Profile", "Notifications", "Subscription", "Security", "Watchlist"];

const watchlistItems = [
  { symbol: "AERO", name: "Aerodrome", price: "$1.148", change: "+5.62%", up: true },
  { symbol: "DEGEN", name: "Degen", price: "$0.0124", change: "-2.31%", up: false },
  { symbol: "BRETT", name: "Brett", price: "$0.0834", change: "+4.10%", up: true },
];

const notificationPrefs = [
  { id: "whale_alerts", label: "Whale Wallet Alerts", description: "Get notified when tracked wallets make large moves", enabled: true },
  { id: "price_alerts", label: "Price Alerts", description: "Notifications when watchlist tokens hit your targets", enabled: true },
  { id: "ai_insights", label: "AI Daily Digest", description: "Receive a daily AI-generated market summary", enabled: false },
  { id: "risk_alerts", label: "Risk Alerts", description: "Instant alerts when watchlist tokens show risk signals", enabled: true },
  { id: "protocol_updates", label: "Protocol Updates", description: "News and updates from Base ecosystem protocols", enabled: false },
];

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const [activeSection, setActiveSection] = useState("Profile");
  const [showKey, setShowKey] = useState(false);
  const [notifications, setNotifications] = useState(notificationPrefs);
  const [watchlist, setWatchlist] = useState(watchlistItems);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-60"
        >
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 space-y-8 pb-20 max-w-5xl mx-auto pt-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
            <Settings className="w-3 h-3" /> Configuration
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter liquid-text mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground font-medium">Manage your account, notifications, and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-2 h-fit">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all text-left",
                  activeSection === section
                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {section}
                <ChevronRight className={cn("w-4 h-4 transition-transform", activeSection === section ? "rotate-90" : "")} />
              </button>
            ))}
          </Card>

          {/* Content */}
          <div className="md:col-span-3">
            {/* Profile */}
            {activeSection === "Profile" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <User className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Profile</h2>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-red-600 flex items-center justify-center text-2xl font-black text-black">
                      {isConnected ? address?.slice(2, 4).toUpperCase() : "NB"}
                    </div>
                    <div>
                      <p className="text-xl font-black text-white uppercase">
                        {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Anonymous User"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isConnected ? "Connected via RainbowKit" : "No wallet connected"}
                      </p>
                      <div className="mt-3">
                        <WalletButton />
                      </div>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    {[
                      { label: "Display Name", value: "Anon Trader", placeholder: "Enter display name" },
                      { label: "Email (Optional)", value: "", placeholder: "For notifications" },
                    ].map((field, i) => (
                      <div key={i}>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{field.label}</label>
                        <input
                          defaultValue={field.value}
                          placeholder={field.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleSave}
                    className={cn(
                      "mt-6 h-12 px-8 rounded-2xl font-black uppercase tracking-widest transition-all",
                      saved
                        ? "bg-emerald-500 text-white"
                        : "bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_30px_rgba(255,215,0,0.2)]"
                    )}
                  >
                    {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Changes"}
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Notifications */}
            {activeSection === "Notifications" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Notifications</h2>
                  </div>
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="flex items-start justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex-1 pr-4">
                          <p className="font-black text-white text-sm mb-1">{notif.label}</p>
                          <p className="text-xs text-muted-foreground">{notif.description}</p>
                        </div>
                        <button
                          onClick={() => toggleNotification(notif.id)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all flex-shrink-0 relative",
                            notif.enabled ? "bg-yellow-500" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                            notif.enabled ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleSave}
                    className="mt-6 h-12 px-8 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest"
                  >
                    {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Preferences"}
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Subscription */}
            {activeSection === "Subscription" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Subscription</h2>
                  </div>

                  {/* Current plan */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-yellow-500/10 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Plan</p>
                        <p className="text-2xl font-black text-white">Free Plan</p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                        Active
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        "AI Chat (20/day)", "Portfolio Analytics", "Basic Risk Analyzer", "NFT Explorer"
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-3 h-3 text-emerald-400" /> {feat}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro upgrade */}
                  <div className="p-6 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-red-600/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Upgrade to</p>
                        <p className="text-2xl font-black text-white">Pro Plan — $29/mo</p>
                      </div>
                      <Crown className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-6">
                      {[
                        "Unlimited AI Chat", "AI Trading Signals", "Alpha Hunter", "Swap Simulation",
                        "Whale Tracking", "Advanced Risk AI", "Market Intelligence", "API Access"
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-yellow-500/80">
                          <Check className="w-3 h-3 text-yellow-500" /> {feat}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full h-12 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                      <Crown className="w-4 h-4 mr-2" /> Upgrade to Pro — Coming Soon
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Security */}
            {activeSection === "Security" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-8">
                  <div className="flex items-center gap-2 mb-8">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Security</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Wallet */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Wallet className="w-4 h-4 text-yellow-500" />
                        <p className="font-black text-white text-sm uppercase tracking-tight">Connected Wallet</p>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {isConnected ? address : "No wallet connected"}
                      </p>
                      {isConnected && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Base Mainnet</span>
                        </div>
                      )}
                    </div>

                    {/* API Key */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-black text-white text-sm uppercase tracking-tight">API Key (Read Only)</p>
                        <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground hover:text-white transition-colors">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {showKey ? "nb_api_demo_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" : "nb_api_demo_key_••••••••••••••••••••••••••••••"}
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase tracking-widest">
                        Never share your API key. Pro plan required for API access.
                      </p>
                    </div>

                    {/* Safety notices */}
                    <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 space-y-2">
                      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-3">Safety Reminders</p>
                      {[
                        "NeuroBase AI never requests your private key or seed phrase",
                        "All swaps require explicit wallet signature confirmation",
                        "No automatic transactions are ever executed",
                        "Review all transaction details before signing",
                      ].map((note, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Shield className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-500/70">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Watchlist */}
            {activeSection === "Watchlist" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="bg-white/[0.01] backdrop-blur-sm border-white/10 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Watchlist</h2>
                    </div>
                    <Button className="h-9 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-[11px] uppercase tracking-widest hover:bg-yellow-500/20">
                      <Plus className="w-3 h-3 mr-2" /> Add Token
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {watchlist.map((token, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-black text-yellow-500 text-sm">
                            {token.symbol.slice(0, 1)}
                          </div>
                          <div>
                            <p className="font-black text-white uppercase">{token.symbol}</p>
                            <p className="text-[10px] text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-black text-white text-sm">{token.price}</p>
                            <p className={cn("text-xs font-black", token.up ? "text-emerald-400" : "text-red-400")}>{token.change}</p>
                          </div>
                          <button
                            onClick={() => setWatchlist((w) => w.filter((_, j) => j !== i))}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-400 hover:bg-red-600/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {watchlist.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="font-black uppercase tracking-widest text-sm">Watchlist Empty</p>
                      <p className="text-xs mt-2">Add tokens to track them here</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

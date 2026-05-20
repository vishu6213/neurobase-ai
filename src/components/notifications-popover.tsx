"use client";

import { Bell, Check, Trash2, Zap, AlertCircle, TrendingUp, Sparkles, Activity } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const initialNotifications = [
  {
    id: 1,
    title: "NEURAL BUY SIGNAL",
    description: "Aerodrome (AERO) node accumulation detected. Target: $1.35.",
    time: "2m ago",
    type: "signal",
    read: false,
  },
  {
    id: 2,
    title: "RISK EXPOSURE ALERT",
    description: "Neural Matrix suggests rebalancing volatile memecoin nodes.",
    time: "1h ago",
    type: "alert",
    read: false,
  },
  {
    id: 3,
    title: "UPLINK SUCCESS",
    description: "Transaction 0x82...f92a confirmed on Base L2 Mainnet.",
    time: "3h ago",
    type: "success",
    read: true,
  },
];

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-muted-foreground hover:text-yellow-500 transition-colors p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-black animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="absolute right-0 mt-6 w-96 glass-card border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[100] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-yellow-500" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Feed</h3>
                </div>
                <div className="flex gap-4">
                  <button onClick={markAllRead} className="text-[10px] font-black text-yellow-500 hover:text-white uppercase tracking-widest transition-colors">Mark Read</button>
                  <button onClick={clearAll} className="text-[10px] font-black text-red-600 hover:text-white uppercase tracking-widest transition-colors">Clear</button>
                </div>
              </div>

              <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-black/40">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Activity className="w-12 h-12 text-white/5 mx-auto mb-4 animate-pulse" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">No Neural Synapses Detected</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-5 border-b border-white/5 hover:bg-yellow-500/[0.03] transition-all relative group cursor-pointer ${!n.read ? "bg-red-600/[0.02]" : ""}`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:scale-110 transition-transform ${
                          n.type === "signal" ? "bg-yellow-500/10 text-yellow-500" :
                          n.type === "alert" ? "bg-red-600/10 text-red-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {n.type === "signal" ? <Zap className="w-5 h-5" /> :
                           n.type === "alert" ? <AlertCircle className="w-5 h-5" /> :
                           <Check className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1.5 group-hover:text-yellow-500 transition-colors truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground leading-normal font-medium break-words">{n.description}</p>
                          <p className="text-[9px] font-black text-muted-foreground/40 mt-3 uppercase tracking-[0.2em]">{n.time} • NEURAL NODE</p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 shadow-[0_0_10px_#ffd700] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white/[0.03] border-t border-white/5">
                <Button variant="ghost" className="w-full h-10 text-[10px] font-black text-muted-foreground hover:text-white uppercase tracking-[0.3em]">
                   Open Terminal Logs
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

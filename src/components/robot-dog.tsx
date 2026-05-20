"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dog, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

const emotes = ["⚡", "🤖", "🦴", "🔥", "🚀", "💎", "🎯", "✨"];

export function RobotDog() {
  const [emote, setEmote] = useState("");
  const [showEmote, setShowEmote] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmote(emotes[Math.floor(Math.random() * emotes.length)]);
      setShowEmote(true);
      setTimeout(() => setShowEmote(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none group">
      <div className="relative">
        {/* Emote Bubble */}
        <AnimatePresence>
          {showEmote && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-3 py-1 rounded-full font-black text-xs shadow-xl flex items-center gap-2 border-2 border-black"
            >
              <MessageCircle className="w-3 h-3 fill-current" />
              {emote}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Robot Dog */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            rotate: [0, -2, 2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-gradient-to-br from-yellow-500 via-red-600 to-black p-4 rounded-3xl border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(255,215,0,0.3)] pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
        >
          <div className="relative">
             <div className="absolute inset-0 bg-yellow-500/20 blur-xl animate-pulse" />
             <Dog className="text-white w-10 h-10 relative z-10" />
             {/* Glowing Eyes */}
             <div className="absolute top-3 left-2 flex gap-4 z-20">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
             </div>
          </div>
        </motion.div>
        
        <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest bg-black/80 px-2 py-1 rounded border border-yellow-500/20">Neural Pup v1.0</span>
        </div>
      </div>
    </div>
  );
}

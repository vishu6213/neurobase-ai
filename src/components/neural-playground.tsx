"use client";

import { motion } from "framer-motion";
import { Bot, Dog } from "lucide-react";

export function NeuralPlayground() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden opacity-10">
      {/* Bot */}
      <motion.div
        animate={{
          x: ["10%", "20%", "15%", "10%"],
          y: ["60%", "70%", "65%", "60%"],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute"
      >
        <div className="relative">
          <div className="w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl absolute inset-0" />
          <Bot className="w-24 h-24 text-yellow-500" />
          {/* Ball */}
          <motion.div
            animate={{
              x: [0, 200, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-full w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_#ff0000]"
          />
        </div>
      </motion.div>

      {/* Dog */}
      <motion.div
        animate={{
          x: ["25%", "35%", "30%", "25%"],
          y: ["65%", "75%", "70%", "65%"],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute"
      >
        <div className="relative">
          <div className="w-32 h-32 bg-white/10 rounded-full blur-2xl absolute inset-0" />
          <Dog className="w-20 h-20 text-white" />
        </div>
      </motion.div>

      {/* Another pair in the bottom right */}
      <motion.div
        animate={{
          x: ["80%", "70%", "75%", "80%"],
          y: ["20%", "30%", "25%", "20%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute"
      >
        <div className="relative opacity-50">
          <Bot className="w-16 h-16 text-red-500" />
          <Dog className="w-12 h-12 text-white ml-10" />
        </div>
      </motion.div>
    </div>
  );
}

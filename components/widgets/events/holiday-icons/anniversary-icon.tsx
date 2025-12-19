"use client";

import { motion } from "framer-motion";

export function AnniversaryIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Heart - animated pulse */}
        <motion.path
          d="M12 21c-1-1-8-5-8-10a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 5-7 9-8 10z"
          fill="currentColor"
          className="text-red-500"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "50%", originY: "50%" }}
        />
        
        {/* Sparkles around heart */}
        <motion.circle
          cx="4"
          cy="8"
          r="1"
          fill="currentColor"
          className="text-pink-400"
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.circle
          cx="20"
          cy="8"
          r="1"
          fill="currentColor"
          className="text-pink-400"
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.circle
          cx="12"
          cy="2"
          r="1"
          fill="currentColor"
          className="text-pink-300"
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 1,
          }}
        />
        
        {/* Small hearts floating up */}
        <motion.path
          d="M6 16c-0.3-0.3-1.5-0.8-1.5-1.8a0.7 0.7 0 0 1 1.5 0 0.7 0.7 0 0 1 1.5 0c0 1-1.2 1.5-1.5 1.8z"
          fill="currentColor"
          className="text-pink-400"
          animate={{
            y: [0, -5, -10],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.2,
          }}
        />
        <motion.path
          d="M18 14c-0.3-0.3-1.5-0.8-1.5-1.8a0.7 0.7 0 0 1 1.5 0 0.7 0.7 0 0 1 1.5 0c0 1-1.2 1.5-1.5 1.8z"
          fill="currentColor"
          className="text-pink-300"
          animate={{
            y: [0, -6, -12],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 0.8,
          }}
        />
      </motion.svg>
    </div>
  );
}

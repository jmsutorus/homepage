"use client";

import { motion } from "framer-motion";

export function FireworkIcon({ className }: { className?: string }) {
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
        {/* Center burst */}
        <motion.circle
          cx="12"
          cy="12"
          r="2"
          fill="currentColor"
          className="text-yellow-400"
          animate={{
            scale: [0.5, 1.2, 0.5],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        
        {/* Explosion rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={angle}
            x1="12"
            y1="12"
            x2={12 + Math.cos((angle * Math.PI) / 180) * 8}
            y2={12 + Math.sin((angle * Math.PI) / 180) * 8}
            stroke="currentColor"
            className={i % 2 === 0 ? "text-red-500" : "text-blue-400"}
            strokeWidth="2"
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
        
        {/* Sparkle dots */}
        <motion.circle
          cx="5"
          cy="5"
          r="1"
          fill="currentColor"
          className="text-yellow-300"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.3,
          }}
        />
        <motion.circle
          cx="19"
          cy="7"
          r="1"
          fill="currentColor"
          className="text-red-400"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.6,
          }}
        />
        <motion.circle
          cx="6"
          cy="18"
          r="1"
          fill="currentColor"
          className="text-blue-300"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.9,
          }}
        />
      </motion.svg>
    </div>
  );
}

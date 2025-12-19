"use client";

import { motion } from "framer-motion";

export function BirthdayIcon({ className }: { className?: string }) {
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
        {/* Cake base */}
        <rect x="3" y="14" width="18" height="7" rx="1" fill="currentColor" className="text-pink-300" />
        
        {/* Cake middle layer */}
        <rect x="5" y="10" width="14" height="4" rx="0.5" fill="currentColor" className="text-pink-400" />
        
        {/* Frosting decoration */}
        <path d="M4 14c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" stroke="currentColor" className="text-white" strokeWidth="1.5" fill="none" />
        
        {/* Candles */}
        <rect x="8" y="6" width="1.5" height="4" fill="currentColor" className="text-blue-400" />
        <rect x="11.25" y="6" width="1.5" height="4" fill="currentColor" className="text-green-400" />
        <rect x="14.5" y="6" width="1.5" height="4" fill="currentColor" className="text-purple-400" />
        
        {/* Flames - animated */}
        <motion.ellipse
          cx="8.75"
          cy="4.5"
          rx="1"
          ry="1.5"
          fill="currentColor"
          className="text-orange-400"
          animate={{
            scaleY: [1, 1.3, 1],
            scaleX: [1, 0.8, 1],
            y: [0, -1, 0],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.ellipse
          cx="12"
          cy="4.5"
          rx="1"
          ry="1.5"
          fill="currentColor"
          className="text-yellow-400"
          animate={{
            scaleY: [1.2, 1, 1.2],
            scaleX: [0.9, 1, 0.9],
            y: [-0.5, 0.5, -0.5],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
          }}
        />
        <motion.ellipse
          cx="15.25"
          cy="4.5"
          rx="1"
          ry="1.5"
          fill="currentColor"
          className="text-orange-400"
          animate={{
            scaleY: [1, 1.2, 1],
            scaleX: [1, 0.85, 1],
            y: [0, -0.8, 0],
          }}
          transition={{
            duration: 0.45,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </motion.svg>
    </div>
  );
}

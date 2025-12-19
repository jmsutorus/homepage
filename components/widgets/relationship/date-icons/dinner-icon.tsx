"use client";

import { motion } from "framer-motion";

export function DinnerIcon({ className }: { className?: string }) {
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
        {/* Candle Body */}
        <path d="M7 21h10" />
        <rect width="10" height="12" x="7" y="9" rx="1" />
        {/* Wick */}
        <path d="M12 9v-2" />
        {/* Flame */}
        <motion.path
          d="M12 2c0 0-2.5 3-2.5 5 0 1.5 1.1 2.5 2.5 2.5S14.5 8.5 14.5 7c0-2-2.5-5-2.5-5Z"
          fill="currentColor"
          className="text-orange-500"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -1, 0],
            rotate: [-2, 2, -2],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
    </div>
  );
}

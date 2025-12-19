"use client";

import { motion } from "framer-motion";

export function WeddingIcon({ className }: { className?: string }) {
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
        {/* Interlinked rings */}
        <motion.circle
          cx="9"
          cy="12"
          r="5"
          stroke="currentColor"
          className="text-yellow-500"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "37.5%", originY: "50%" }}
        />
        <motion.circle
          cx="15"
          cy="12"
          r="5"
          stroke="currentColor"
          className="text-yellow-400"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [0, -5, 0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "62.5%", originY: "50%" }}
        />
        
        {/* Diamond on left ring */}
        <motion.path
          d="M9 7l-1.5 2 1.5 2 1.5-2z"
          fill="currentColor"
          className="text-white"
          stroke="currentColor"
          strokeWidth="0.5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Sparkles */}
        <motion.circle
          cx="4"
          cy="8"
          r="0.5"
          fill="currentColor"
          className="text-pink-300"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.circle
          cx="20"
          cy="10"
          r="0.5"
          fill="currentColor"
          className="text-pink-300"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.7,
          }}
        />
        <motion.circle
          cx="12"
          cy="4"
          r="0.5"
          fill="currentColor"
          className="text-pink-300"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1.4,
          }}
        />
      </motion.svg>
    </div>
  );
}

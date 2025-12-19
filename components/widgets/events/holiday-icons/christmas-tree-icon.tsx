"use client";

import { motion } from "framer-motion";

export function ChristmasTreeIcon({ className }: { className?: string }) {
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
        {/* Tree trunk */}
        <rect x="10" y="20" width="4" height="3" fill="currentColor" className="text-amber-800" />
        
        {/* Tree body */}
        <polygon points="12,2 4,12 8,12 4,20 20,20 16,12 20,12" fill="currentColor" className="text-green-600" />
        
        {/* Star on top - animated */}
        <motion.path
          d="M12 1l1 2 2 0.5-1.5 1.5 0.5 2-2-1-2 1 0.5-2-1.5-1.5 2-0.5z"
          fill="currentColor"
          className="text-yellow-400"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "50%", originY: "50%" }}
        />
        
        {/* Ornaments - animated */}
        <motion.circle
          cx="9"
          cy="10"
          r="1"
          fill="currentColor"
          className="text-red-500"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.circle
          cx="14"
          cy="12"
          r="1"
          fill="currentColor"
          className="text-blue-400"
          animate={{
            opacity: [1, 0.7, 1],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.circle
          cx="10"
          cy="16"
          r="1"
          fill="currentColor"
          className="text-yellow-400"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 1,
          }}
        />
        <motion.circle
          cx="15"
          cy="17"
          r="1"
          fill="currentColor"
          className="text-purple-400"
          animate={{
            opacity: [1, 0.7, 1],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.3,
          }}
        />
      </motion.svg>
    </div>
  );
}

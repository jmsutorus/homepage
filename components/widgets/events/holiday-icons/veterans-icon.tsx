"use client";

import { motion } from "framer-motion";

export function VeteransIcon({ className }: { className?: string }) {
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
        {/* Flag pole */}
        <line x1="4" y1="2" x2="4" y2="22" stroke="currentColor" className="text-gray-600" strokeWidth="2" />
        
        {/* Flag - animated wave */}
        <motion.g
          animate={{
            x: [0, 1, 0, -0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Red stripes */}
          <motion.rect x="4" y="2" width="16" height="2" fill="currentColor" className="text-red-600" />
          <motion.rect x="4" y="6" width="16" height="2" fill="currentColor" className="text-red-600" />
          <motion.rect x="4" y="10" width="16" height="2" fill="currentColor" className="text-red-600" />
          
          {/* White stripes */}
          <rect x="4" y="4" width="16" height="2" fill="currentColor" className="text-white" />
          <rect x="4" y="8" width="16" height="2" fill="currentColor" className="text-white" />
          
          {/* Blue canton */}
          <rect x="4" y="2" width="7" height="6" fill="currentColor" className="text-blue-700" />
          
          {/* Stars - animated twinkle */}
          <motion.circle
            cx="6"
            cy="4"
            r="0.5"
            fill="currentColor"
            className="text-white"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="8.5"
            cy="4"
            r="0.5"
            fill="currentColor"
            className="text-white"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle
            cx="6"
            cy="6"
            r="0.5"
            fill="currentColor"
            className="text-white"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          />
          <motion.circle
            cx="8.5"
            cy="6"
            r="0.5"
            fill="currentColor"
            className="text-white"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.9 }}
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}

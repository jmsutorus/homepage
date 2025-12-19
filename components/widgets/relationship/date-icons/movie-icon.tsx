"use client";

import { motion } from "framer-motion";

export function MovieIcon({ className }: { className?: string }) {
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
        {/* Popcorn Bucket */}
        <path d="M18 8l-2-6" />
        <path d="M6 8l2-6" />
        <path d="M3 22h18" />
        <path d="M4 22l2-14h12l2 14" />
        
        {/* Popping Kernels */}
        <motion.circle
          cx="10"
          cy="7"
          r="1"
          fill="currentColor"
          className="text-yellow-400"
          animate={{ y: [0, -4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="12"
          cy="5"
          r="1"
          fill="currentColor"
          className="text-yellow-400"
          animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
        <motion.circle
          cx="14"
          cy="7"
          r="1"
          fill="currentColor"
          className="text-yellow-400"
          animate={{ y: [0, -3, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
        />
      </motion.svg>
    </div>
  );
}

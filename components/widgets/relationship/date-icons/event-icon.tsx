"use client";

import { motion } from "framer-motion";

export function EventIcon({ className }: { className?: string }) {
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
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
        
        {/* Animated Star */}
        <motion.path
          d="M8 12l1-3 3-1-3-1-1-3-1 3-3 1 3 1 1 3Z"
          fill="currentColor"
          className="text-yellow-500"
          animate={{
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 45, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}

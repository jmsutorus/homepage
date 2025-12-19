"use client";

import { motion } from "framer-motion";

export function TurkeyIcon({ className }: { className?: string }) {
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
        {/* Turkey body */}
        <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" className="text-amber-700" />
        
        {/* Turkey head */}
        <circle cx="17" cy="12" r="2" fill="currentColor" className="text-amber-600" />
        
        {/* Snood (wattle) */}
        <motion.path
          d="M18 13c0.5 0.5 0.5 2 0 2.5"
          stroke="currentColor"
          className="text-red-500"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Tail feathers - animated */}
        <motion.path
          d="M6 12c-1-2 0-5 2-6"
          stroke="currentColor"
          className="text-orange-500"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [-3, 3, -3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "70%", originY: "80%" }}
        />
        <motion.path
          d="M7 10c-2-1 -1-5 1-6"
          stroke="currentColor"
          className="text-red-600"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [3, -3, 3],
            scale: [1.05, 1, 1.05],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          style={{ originX: "70%", originY: "80%" }}
        />
        <motion.path
          d="M8 8c-2 0 -2-4 0-5"
          stroke="currentColor"
          className="text-amber-500"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [-2, 4, -2],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          style={{ originX: "70%", originY: "80%" }}
        />
        
        {/* Legs */}
        <path d="M10 19v2M14 19v2" stroke="currentColor" className="text-amber-800" />
      </motion.svg>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export function LaborDayIcon({ className }: { className?: string }) {
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
        {/* Hammer head */}
        <motion.rect
          x="4"
          y="3"
          width="8"
          height="5"
          rx="1"
          fill="currentColor"
          className="text-gray-500"
          animate={{
            rotate: [0, -20, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "50%", originY: "100%" }}
        />
        
        {/* Hammer handle */}
        <motion.rect
          x="7"
          y="8"
          width="2"
          height="10"
          fill="currentColor"
          className="text-amber-700"
          animate={{
            rotate: [0, -20, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: "50%", originY: "0%" }}
        />
        
        {/* Wrench */}
        <motion.g
          animate={{
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          style={{ originX: "75%", originY: "50%" }}
        >
          {/* Wrench head */}
          <path
            d="M18 6c2 0 3 1 3 3s-1 3-3 3c-1 0-2-0.5-2.5-1.5h-2v-3h2c0.5-1 1.5-1.5 2.5-1.5z"
            fill="currentColor"
            className="text-gray-400"
          />
          {/* Wrench handle */}
          <rect
            x="12"
            y="9.5"
            width="6"
            height="2"
            fill="currentColor"
            className="text-gray-500"
          />
        </motion.g>
        
        {/* Sparks */}
        <motion.circle
          cx="3"
          cy="5"
          r="0.8"
          fill="currentColor"
          className="text-yellow-400"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: 0.1,
          }}
        />
        <motion.circle
          cx="12"
          cy="4"
          r="0.8"
          fill="currentColor"
          className="text-orange-400"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
      </motion.svg>
    </div>
  );
}

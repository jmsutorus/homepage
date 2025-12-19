"use client";

import { motion } from "framer-motion";

export function OutingIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
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
        {/* Road */}
        <path d="M2 20h20" />
        
        {/* Car Body */}
        <motion.g
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <path d="M14 16H9m-5 0h1m14 0h1" />
          <motion.circle 
             cx="6.5" cy="16.5" r="2.5" 
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle 
             cx="16.5" cy="16.5" r="2.5" 
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <path d="M19 14l-1.5-6h-11l-1.5 6" />
        </motion.g>
        
        {/* Sun/Background element */}
        <motion.circle
           cx="18" cy="6" r="3"
           className="text-yellow-500 fill-current opacity-50"
           animate={{ y: [0, 2, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

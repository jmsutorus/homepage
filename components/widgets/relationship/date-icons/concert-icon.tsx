"use client";

import { motion } from "framer-motion";

export function ConcertIcon({ className }: { className?: string }) {
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
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
        
        {/* Floating Notes */}
        <motion.path
          d="M12 8l3-2"
          animate={{ 
            y: [0, -3, 0],
            opacity: [0.5, 1, 0.5],
            rotate: [-10, 10, -10] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-pink-500"
        />
         <motion.text
            x="2" y="10" fontSize="8" fill="currentColor" className="text-pink-400"
            animate={{ y: [10, 5, 10], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
         >
           ♪
         </motion.text>
      </motion.svg>
    </div>
  );
}

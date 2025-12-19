"use client";

import { motion } from "framer-motion";

export function OtherIcon({ className }: { className?: string }) {
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
        <motion.path
           d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"
           className="text-gray-400"
           animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
           cx="18" cy="6" r="2" fill="currentColor" className="text-gray-300"
           animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
           transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle
           cx="5" cy="18" r="1.5" fill="currentColor" className="text-gray-300"
           animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
           transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        />
      </motion.svg>
    </div>
  );
}

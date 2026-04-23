"use client";

import { motion } from "framer-motion";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";

interface CircleSuccessProps {
  size?: number;
  className?: string;
  onComplete?: () => void;
}

export function CircleSuccess({
  size = 256,
  className,
  onComplete,
}: CircleSuccessProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Center Seed */}
      <motion.div
        className="w-4 h-4 bg-media-primary rounded-full absolute opacity-20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.8, 1.5, 0.8],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="w-2 h-2 bg-media-primary rounded-full absolute"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Growth Rings */}
      <svg
        className="absolute w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        {/* Ring 1 */}
        <motion.circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-media-primary opacity-40"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
        {/* Ring 2 */}
        <motion.circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-media-primary opacity-30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
        {/* Ring 3 */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-media-primary opacity-20"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
        />
        {/* Final Completion Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-media-secondary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.8 }}
          onAnimationComplete={onComplete}
        />
      </svg>

      {/* Success Icon */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 2 }}
      >
        <MaterialSymbol
          icon="check_circle"
          className="text-media-secondary"
          size={48}
        />
        <p className="font-lexend text-media-primary mt-4 tracking-[0.2em] uppercase text-[10px] font-bold">
          Success
        </p>
      </motion.div>

    </div>
  );
}

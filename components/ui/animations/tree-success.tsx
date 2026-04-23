"use client";

import { motion } from "framer-motion";

interface TreeSuccessProps {
  size?: number;
  className?: string;
  onComplete?: () => void;
}

export function TreeSuccess({
  size = 256,
  className,
  onComplete,
}: TreeSuccessProps) {
  const treePath = "M50 10 L80 40 L65 40 L90 80 L60 80 L60 110 L40 110 L40 80 L10 80 L35 40 L20 40 Z";

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: size }}
    >
      <div className="relative w-48 h-64 mb-8 flex items-center justify-center">
        {/* Outline Base */}
        <svg
          className="absolute inset-0 w-full h-full text-stone-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 100 120"
        >
          <path d={treePath} strokeLinejoin="round" />
        </svg>

        {/* Terracotta Line Progress */}
        <svg
          className="absolute inset-0 w-full h-full text-media-secondary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 100 120"
        >
          <motion.path
            d={treePath}
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* Final Fill */}
        <svg
          className="absolute inset-0 w-full h-full text-media-primary"
          viewBox="0 0 100 120"
        >
          <motion.path
            d={treePath}
            strokeLinejoin="round"
            className="fill-current"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
            onAnimationComplete={onComplete}
          />
        </svg>
      </div>

      {/* Typography Context */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
      >
        <h1 className="font-lexend text-2xl font-bold tracking-tight text-media-primary">
          Success
        </h1>
        <p className="text-media-primary/60 max-w-[200px] mx-auto text-sm leading-relaxed">
          Your action has been completed successfully. The forest continues to grow.
        </p>
      </motion.div>

    </div>
  );
}

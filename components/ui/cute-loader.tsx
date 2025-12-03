"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CuteLoaderProps {
  className?: string;
  size?: number;
  color?: string;
}

export function CuteLoader({ 
  className, 
  size = 12, 
  color = "bg-primary" 
}: CuteLoaderProps) {
  const circleVariants: any = {
    initial: {
      y: 0,
    },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const containerVariants: any = {
    initial: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex items-center justify-center gap-1", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={circleVariants}
          className={cn("rounded-full", color)}
          style={{
            width: size,
            height: size,
          }}
        />
      ))}
    </motion.div>
  );
}

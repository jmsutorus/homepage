"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  labelPosition?: "inside" | "outside" | "tooltip";
  size?: "sm" | "md" | "lg";
  color?: "default" | "success" | "warning" | "danger" | "primary";
  animate?: boolean;
  delay?: number;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const colorClasses = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  primary: "bg-blue-500",
};

export function AnimatedProgress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  labelPosition = "outside",
  size = "md",
  color = "default",
  animate = true,
  delay = 0,
}: AnimatedProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  const shouldAnimate = animate && hasAnimated;

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {showLabel && labelPosition === "outside" && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <motion.span
            className="font-medium"
            initial={animate ? { opacity: 0 } : undefined}
            animate={shouldAnimate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: delay + 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      )}

      <div
        className={cn(
          "w-full bg-secondary rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full relative",
            colorClasses[color],
            barClassName
          )}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={shouldAnimate ? { width: `${percentage}%` } : undefined}
          transition={{
            duration: 0.8,
            delay,
            ease: [0.16, 1, 0.3, 1], // easeOutExpo for smooth deceleration
          }}
        >
          {showLabel && labelPosition === "inside" && size === "lg" && (
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white"
              initial={{ opacity: 0 }}
              animate={shouldAnimate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.3, delay: delay + 0.5 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface AnimatedProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: "default" | "success" | "warning" | "danger" | "primary";
  showLabel?: boolean;
  animate?: boolean;
  delay?: number;
}

const ringColorClasses = {
  default: "stroke-primary",
  success: "stroke-green-500",
  warning: "stroke-yellow-500",
  danger: "stroke-red-500",
  primary: "stroke-blue-500",
};

export function AnimatedProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  className,
  color = "default",
  showLabel = true,
  animate = true,
  delay = 0,
}: AnimatedProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  const shouldAnimate = animate && hasAnimated;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        ref={ref}
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={ringColorClasses[color]}
          style={{
            strokeDasharray: circumference,
          }}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={shouldAnimate ? { strokeDashoffset } : undefined}
          transition={{
            duration: 1,
            delay,
            ease: [0.16, 1, 0.3, 1], // easeOutExpo
          }}
        />
      </svg>
      {showLabel && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.3, delay: delay + 0.5 }}
        >
          <span className="text-lg font-bold">{Math.round(percentage)}%</span>
        </motion.div>
      )}
    </div>
  );
}

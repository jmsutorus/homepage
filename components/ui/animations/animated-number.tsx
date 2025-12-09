"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatThousands?: boolean;
}

/**
 * Animated Number Component
 * Smoothly counts up (or down) to a target number using framer-motion
 *
 * @param value - Target number to count to
 * @param duration - Animation duration in seconds (default: 2)
 * @param delay - Delay before animation starts in seconds (default: 0)
 * @param decimals - Number of decimal places to display (default: 0)
 * @param prefix - Text to display before the number (e.g., "$")
 * @param suffix - Text to display after the number (e.g., "%")
 * @param formatThousands - Whether to add comma separators for thousands (default: true)
 */
export function AnimatedNumber({
  value,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  formatThousands = true,
}: AnimatedNumberProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Use spring animation for smooth counting
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  // Transform the spring value to the formatted string
  const display = useTransform(spring, (latest) => {
    const num = latest.toFixed(decimals);
    if (formatThousands) {
      const parts = num.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${prefix}${parts.join(".")}${suffix}`;
    }
    return `${prefix}${num}${suffix}`;
  });

  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        spring.set(value);
        setHasAnimated(true);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [value, delay, spring, hasAnimated]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {display}
    </motion.span>
  );
}

/**
 * Simple Animated Number (without framer-motion transforms)
 * Lighter weight alternative using requestAnimationFrame
 */
export function SimpleAnimatedNumber({
  value,
  duration = 2000,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  formatThousands = true,
}: Omit<AnimatedNumberProps, "duration"> & { duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const totalChange = endValue - startValue;

    function easeOutExpo(t: number): number {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animate() {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = startValue + totalChange * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration, hasStarted, displayValue]);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    if (formatThousands) {
      const parts = fixed.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    return fixed;
  };

  return (
    <span className={className}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

/**
 * Animated Stat Display
 * Combines animated number with label and icon
 */
interface AnimatedStatProps extends AnimatedNumberProps {
  label: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

export function AnimatedStat({
  label,
  icon,
  iconColor = "text-primary",
  ...numberProps
}: AnimatedStatProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: numberProps.delay }}
    >
      {icon && (
        <motion.div
          className={iconColor}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: (numberProps.delay || 0) + 0.2,
          }}
        >
          {icon}
        </motion.div>
      )}
      <div className="text-4xl font-bold">
        <AnimatedNumber {...numberProps} />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

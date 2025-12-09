import { Variants } from "framer-motion";

/**
 * Reusable Framer Motion Animation Variants
 * Provides consistent animation patterns across the Year in Review experience
 */

/**
 * Fade in from below
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Fade in from above
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Fade in with scale
 */
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Stagger container - animates children with delay
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fast stagger container - quicker animations
 */
export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

/**
 * Slow stagger container - more dramatic
 */
export const slowStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Card entrance animation - combines multiple effects
 */
export const cardEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Card hover animation
 */
export const cardHover = {
  scale: 1.05,
  y: -5,
  transition: {
    duration: 0.2,
    ease: "easeInOut",
  },
};

/**
 * Stat number reveal - for big numbers
 */
export const statReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: 30,
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Custom spring easing
    },
  },
};

/**
 * Badge unlock animation
 */
export const badgeUnlock: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -180,
  },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
      delay: 0.2,
    },
  },
};

/**
 * Progress bar fill animation
 */
export const progressFill: Variants = {
  hidden: {
    width: 0,
  },
  show: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: 0.3,
    },
  }),
};

/**
 * Slide transition for story mode
 */
export const slideTransition: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  }),
};

/**
 * Fade transition for story mode (alternative)
 */
export const fadeTransition: Variants = {
  enter: {
    opacity: 0,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

/**
 * Text reveal animation - letter by letter effect
 */
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const letterReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Pulse animation for emphasis
 */
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.5,
    repeat: Infinity,
    repeatDelay: 1,
  },
};

/**
 * Shake animation for notifications
 */
export const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: 0.5,
  },
};

/**
 * Bounce animation for celebration
 */
export const bounce = {
  y: [0, -20, 0, -10, 0],
  transition: {
    duration: 0.6,
    ease: "easeOut",
  },
};

/**
 * Rotate in animation for icons
 */
export const rotateIn: Variants = {
  hidden: {
    opacity: 0,
    rotate: -90,
    scale: 0.5,
  },
  show: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Glow effect for highlights
 */
export const glow = {
  boxShadow: [
    "0 0 0 0 rgba(168, 85, 247, 0)",
    "0 0 20px 10px rgba(168, 85, 247, 0.4)",
    "0 0 0 0 rgba(168, 85, 247, 0)",
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};

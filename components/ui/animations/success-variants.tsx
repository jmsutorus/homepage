"use client";

import { motion } from "framer-motion";

type SuccessVariant = "check" | "star" | "confetti" | "ripple";

interface SuccessAnimationProps {
  variant?: SuccessVariant;
  size?: number;
  className?: string;
}

export function SuccessAnimation({
  variant = "check",
  size = 100,
  className,
}: SuccessAnimationProps) {
  const variants = {
    check: <SuccessCheck size={size} />,
    star: <SuccessStar size={size} />,
    confetti: <SuccessConfetti size={size} />,
    ripple: <SuccessRipple size={size} />,
  };

  return <div className={className}>{variants[variant]}</div>;
}

// Original checkmark animation
function SuccessCheck({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="5"
        className="text-green-500"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  );
}

// Star animation with shine effect
function SuccessStar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M50 10L61 39H91L67 57L77 86L50 68L23 86L33 57L9 39H39L50 10Z"
        fill="currentColor"
        className="text-yellow-400"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="2"
        className="text-yellow-300"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

// Confetti burst animation
function SuccessConfetti({ size }: { size: number }) {
  const confettiPieces = [
    { x: 50, y: 50, color: "text-red-500", delay: 0 },
    { x: 50, y: 50, color: "text-blue-500", delay: 0.05 },
    { x: 50, y: 50, color: "text-green-500", delay: 0.1 },
    { x: 50, y: 50, color: "text-yellow-500", delay: 0.15 },
    { x: 50, y: 50, color: "text-purple-500", delay: 0.2 },
    { x: 50, y: 50, color: "text-pink-500", delay: 0.25 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {confettiPieces.map((piece, i) => {
        const angle = (i / confettiPieces.length) * Math.PI * 2;
        const distance = 35;
        const endX = 50 + Math.cos(angle) * distance;
        const endY = 50 + Math.sin(angle) * distance;

        return (
          <motion.circle
            key={i}
            cx={piece.x}
            cy={piece.y}
            r="3"
            fill="currentColor"
            className={piece.color}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: endX - piece.x,
              y: endY - piece.y,
              scale: [0, 1.5, 1],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: piece.delay,
              ease: "easeOut",
            }}
          />
        );
      })}
      <motion.circle
        cx="50"
        cy="50"
        r="8"
        fill="currentColor"
        className="text-green-500"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.4, ease: "backOut" }}
      />
    </svg>
  );
}

// Ripple effect animation
function SuccessRipple({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.circle
          key={i}
          cx="50"
          cy="50"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          className="text-blue-500"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2 + i * 0.2, opacity: 0 }}
          transition={{
            duration: 1.5,
            delay,
            ease: "easeOut",
            repeat: Infinity,
          }}
        />
      ))}
      <motion.circle
        cx="50"
        cy="50"
        r="15"
        fill="currentColor"
        className="text-blue-500"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
      />
    </svg>
  );
}

// Re-export the original SuccessCheck for backward compatibility
export { SuccessCheck };

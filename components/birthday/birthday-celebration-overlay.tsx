"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BirthdayCelebrationOverlayProps {
  onComplete?: () => void;
}

const CONFETTI_COLORS = ["#ec4899", "#a855f7", "#eab308", "#3b82f6", "#f43f5e"];
const BALLOON_EMOJIS = ["🎈", "🎂", "🧁", "🎉"];

export function BirthdayCelebrationOverlay({ onComplete }: BirthdayCelebrationOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Wait for fade-out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    angle: (i / 25) * Math.PI * 2,
    distance: Math.random() * 200 + 200,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 720 - 360,
  }));

  // Generate balloons
  const balloons = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    emoji: BALLOON_EMOJIS[i % BALLOON_EMOJIS.length],
    left: `${(i * 12) + 10}%`,
    delay: i * 0.3,
    duration: 2.5 + Math.random(),
    drift: (Math.random() - 0.5) * 60,
  }));

  // Generate fireworks
  const fireworks = [
    { id: 0, top: "20%", left: "50%", delay: 1 },
    { id: 1, top: "80%", left: "30%", delay: 1.5 },
    { id: 2, top: "40%", left: "70%", delay: 2 },
    { id: 3, top: "70%", left: "60%", delay: 2.5 },
  ];

  // Generate sparkles
  const sparkles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    delay: Math.random() * 2,
    duration: 2 + Math.random(),
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[60] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Confetti Burst */}
          {confettiPieces.map((piece) => (
            <motion.div
              key={`confetti-${piece.id}`}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm"
              style={{
                backgroundColor: piece.color,
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: Math.cos(piece.angle) * piece.distance,
                y: Math.sin(piece.angle) * piece.distance,
                scale: [0, 1.5, 1],
                opacity: [1, 1, 0],
                rotate: piece.rotation,
              }}
              transition={{
                duration: 1.5,
                delay: piece.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Balloons Rising */}
          {balloons.map((balloon) => (
            <motion.div
              key={`balloon-${balloon.id}`}
              className="absolute text-2xl sm:text-3xl md:text-4xl"
              style={{
                left: balloon.left,
                bottom: "-10%",
              }}
              initial={{ y: 0, x: 0, opacity: 0.7 }}
              animate={{
                y: "-110vh",
                x: balloon.drift,
                opacity: [0.7, 0.9, 0.3],
                rotate: [0, 10, -5, 0],
              }}
              transition={{
                duration: balloon.duration,
                delay: balloon.delay,
                ease: "easeInOut",
              }}
            >
              {balloon.emoji}
            </motion.div>
          ))}

          {/* Fireworks */}
          {fireworks.map((firework) => (
            <motion.div
              key={`firework-${firework.id}`}
              className="absolute"
              style={{
                top: firework.top,
                left: firework.left,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: firework.delay,
                ease: "easeOut",
              }}
            >
              <div className="relative">
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  return (
                    <div
                      key={i}
                      className="absolute w-1 h-8 bg-gradient-to-t from-yellow-400 to-transparent"
                      style={{
                        transformOrigin: "bottom",
                        transform: `rotate(${angle}rad) translateY(-20px)`,
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Sparkles */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={`sparkle-${sparkle.id}`}
              className="absolute text-yellow-400 text-lg"
              style={{
                top: sparkle.top,
                left: sparkle.left,
              }}
              initial={{ scale: 0.5, opacity: 0.3 }}
              animate={{
                scale: [0.5, 1.2, 0.5],
                opacity: [0.3, 1, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: sparkle.duration,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Birthday Text */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 1,
              delay: 1.5,
              times: [0, 0.3, 0.5, 0.8, 1],
            }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center whitespace-nowrap bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              Happy Birthday!
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

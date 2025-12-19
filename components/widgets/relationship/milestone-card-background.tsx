"use client";

import { motion } from "framer-motion";

interface MilestoneCardBackgroundProps {
  category: string;
}

export function MilestoneCardBackground({ category }: MilestoneCardBackgroundProps) {
  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "anniversary":
        return {
          gradient: "from-pink-500/10 via-rose-500/5 to-transparent",
          animation: "heart-float",
        };
      case "first":
        return {
          gradient: "from-blue-500/10 via-sky-500/5 to-transparent",
          animation: "sunrise-sparkle",
        };
      case "achievement":
        return {
          gradient: "from-green-500/10 via-emerald-500/5 to-transparent",
          animation: "confetti-rise",
        };
      case "special":
        return {
          gradient: "from-purple-500/10 via-indigo-500/5 to-transparent",
          animation: "star-twinkle",
        };
      case "other":
      default:
        return {
          gradient: "from-gray-500/5 via-slate-500/5 to-transparent",
          animation: "gentle-pulse",
        };
    }
  };

  const theme = getCategoryTheme(category);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
      {/* Base Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* Anniversary: Floating Hearts */}
      {theme.animation === "heart-float" && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-400/20 text-lg"
              initial={{ 
                bottom: "-10%", 
                left: `${Math.random() * 100}%`,
                scale: 0.5,
                opacity: 0
              }}
              animate={{ 
                bottom: "120%", 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "linear",
              }}
            >
              ♥
            </motion.div>
          ))}
        </div>
      )}

      {/* First: Sunrise Sparkles */}
      {theme.animation === "sunrise-sparkle" && (
        <>
           <motion.div
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-400/10 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0">
             {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-sky-300/40 rounded-full"
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0] 
                }}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Special: Twinkling Stars */}
      {theme.animation === "star-twinkle" && (
        <div className="absolute inset-0">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-300/30 text-xs"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
              animate={{ 
                scale: [1, 1.5, 1], 
                opacity: [0.2, 0.6, 0.2],
                rotate: [0, 45, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              ✦
            </motion.div>
          ))}
        </div>
      )}

      {/* Other: Gentle Pulse */}
      {theme.animation === "gentle-pulse" && (
        <motion.div
          className="absolute inset-0 bg-slate-500/5"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

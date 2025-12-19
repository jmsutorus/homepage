"use client";

import { motion } from "framer-motion";

interface DateCardBackgroundProps {
  type: string;
}

export function DateCardBackground({ type }: DateCardBackgroundProps) {
  const getTypeTheme = (type: string) => {
    switch (type.toLowerCase()) {
      case "dinner":
        return {
          gradient: "from-orange-500/10 via-red-500/5 to-transparent",
          animation: "candle-glow",
        };
      case "movie":
        return {
          gradient: "from-purple-900/20 via-blue-900/10 to-transparent",
          animation: "projector-flicker",
        };
      case "activity":
        return {
          gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
          animation: "energetic-pulse",
        };
      case "outing":
        return {
          gradient: "from-green-500/10 via-emerald-500/5 to-transparent",
          animation: "nature-drift",
        };
      case "concert":
        return {
          gradient: "from-pink-500/10 via-purple-500/5 to-transparent",
          animation: "equalizer",
        };
      case "event":
        return {
          gradient: "from-yellow-500/10 via-amber-500/5 to-transparent",
          animation: "confetti",
        };
      case "other":
      default:
        return {
          gradient: "from-gray-500/5 via-slate-500/5 to-transparent",
          animation: "subtle-pulse",
        };
    }
  };

  const theme = getTypeTheme(type);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
      {/* Base Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* Dinner: Warm Candle Glow/Bokeh */}
      {theme.animation === "candle-glow" && (
        <motion.div
          className="absolute inset-0 bg-orange-500/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}

      {/* Movie: Projector Light Beam */}
      {theme.animation === "projector-flicker" && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
             className="absolute inset-0 bg-black/10"
             animate={{ opacity: [0, 0.1, 0] }}
             transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
          />
        </>
      )}

      {/* Activity: Rising Particles */}
      {theme.animation === "energetic-pulse" && (
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              initial={{ y: "100%", x: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ y: "-20%", opacity: [0, 1, 0] }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Outing: Clouds/Nature Drift */}
      {theme.animation === "nature-drift" && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-4 w-20 h-8 bg-white/5 rounded-full blur-xl"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
           <motion.div
            className="absolute bottom-4 w-32 h-12 bg-emerald-400/5 rounded-full blur-2xl"
            animate={{ x: ["400%", "-100%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Concert: Equalizer Bars */}
      {theme.animation === "equalizer" && (
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-around px-4 opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 bg-pink-500/30 rounded-t-sm"
              animate={{ height: ["10%", "80%", "30%", "60%", "20%"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}

       {/* Event: Twinkling Stars / Confetti */}
      {theme.animation === "confetti" && (
         <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400/40 rounded-full"
              initial={{
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                scale: 0
              }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Other: Simple Pulse */}
      {theme.animation === "subtle-pulse" && (
         <motion.div
            className="absolute inset-0 bg-slate-500/5"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         />
      )}
    </div>
  );
}

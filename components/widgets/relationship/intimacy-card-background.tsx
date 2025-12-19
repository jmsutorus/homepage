"use client";

import { motion } from "framer-motion";

interface IntimacyCardBackgroundProps {
  rating?: number | null;
  type?: string | null;
  location?: string | null;
}

export function IntimacyCardBackground({ rating, location }: IntimacyCardBackgroundProps) {
  
  // Prioritize Location-based themes
  const getLocationTheme = (loc: string) => {
    switch (loc.toLowerCase()) {
      case "shower": return "water-steam";
      case "bath": return "bubbles";
      case "pool": return "pool-ripples";
      case "car": return "streaking-lights";
      case "bed": return "silk-sheets"; // Explicit bed theme
      case "outdoor": return "fireflies";
      case "kitchen": return "warm-glow";
      case "vacation": return "tropical";
      default: return null;
    }
  };

  const locationTheme = location ? getLocationTheme(location) : null;

  // Fallback to Rating-based themes
  const getRatingTheme = () => {
    if (rating === 5) return "passion";
    if (rating === 4) return "steam";
    if (rating === 3) return "silk";
    return "glow"; 
  };

  const theme = locationTheme || getRatingTheme();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
      
      {/* --- Gradients --- */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 ${
        // Location Gradients
        theme === "water-steam" ? "from-cyan-100/10 via-slate-200/5 to-transparent dark:from-cyan-900/20 dark:via-slate-800/20" :
        theme === "bubbles" ? "from-pink-200/10 via-rose-200/5 to-transparent dark:from-pink-900/20 dark:via-rose-900/10" :
        theme === "pool-ripples" ? "from-blue-400/10 via-cyan-400/5 to-transparent" :
        theme === "streaking-lights" ? "from-slate-900/30 via-slate-800/20 to-transparent" :
        theme === "fireflies" ? "from-emerald-900/20 via-slate-900/10 to-transparent" :
        theme === "warm-glow" ? "from-amber-200/10 via-orange-100/5 to-transparent" :
        theme === "tropical" ? "from-teal-500/10 via-yellow-500/5 to-transparent" :
        theme === "silk-sheets" ? "from-purple-200/10 via-indigo-200/5 to-transparent dark:from-purple-900/20" : 

        // Rating Gradients
        theme === "passion" ? "from-red-600/10 via-pink-600/5 to-transparent" :
        theme === "steam" ? "from-pink-500/10 via-purple-500/5 to-transparent" :
        theme === "silk" ? "from-purple-500/10 via-indigo-500/5 to-transparent" :
        "from-rose-400/10 via-orange-300/5 to-transparent"
      }`} />

      {/* --- Animations --- */}

      {/* Passion: Intense Pulse (Background only) */}
      {theme === "passion" && (
        <motion.div
          className="absolute inset-0 bg-red-500/5"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Steam / Shower: Rising Misty Effect */}
      {(theme === "steam" || theme === "water-steam") && (
        <>
           <motion.div
            className="absolute -bottom-1/2 left-0 right-0 h-full bg-gradient-to-t from-white/20 to-transparent blur-2xl"
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
           {theme === "water-steam" && (
             // Rain/Droplets for shower
             <div className="absolute inset-0">
               {[...Array(10)].map((_, i) => (
                 <motion.div
                   key={i}
                   className="absolute w-0.5 h-4 bg-sky-300/30 rounded-full"
                   initial={{ top: "-10%", left: `${Math.random() * 100}%`, opacity: 0 }}
                   animate={{ top: "110%", opacity: [0, 1, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 1.5, ease: "linear" }}
                 />
               ))}
             </div>
           )}
        </>
      )}

      {/* Silk / Silk Sheets: Waving Gradient */}
      {(theme === "silk" || theme === "silk-sheets") && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-400/10 to-transparent opacity-30"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

       {/* Bubbles (Bath) */}
       {theme === "bubbles" && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-pink-300/30 rounded-full bg-white/5 backdrop-blur-[1px]"
              style={{
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
              }}
              initial={{ bottom: "-20%", left: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ bottom: "110%", opacity: [0, 1, 0], x: [0, Math.random() * 20 - 10, 0] }}
              transition={{ duration: Math.random() * 4 + 4, repeat: Infinity, delay: Math.random() * 3, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* Pool Ripples */}
      {theme === "pool-ripples" && (
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at center, transparent 0%, rgba(6, 182, 212, 0.1) 100%)",
            backgroundSize: "20px 20px"
          }}
          animate={{ backgroundPosition: ["0px 0px", "20px 20px"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      )}

       {/* Car Lights */}
       {theme === "streaking-lights" && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
             <motion.div
               key={i}
               className={`absolute top-0 bottom-0 bg-gradient-to-r from-transparent ${i % 2 === 0 ? "via-yellow-100/5" : "via-white/5"} to-transparent skew-x-12`}
               style={{ width: Math.random() * 150 + 100 + "px" }}
               initial={{ left: "-50%", opacity: 0 }}
               animate={{ left: "150%", opacity: [0, 1, 0] }}
               transition={{ 
                 duration: 10000, // Very slow movement (10-15s)
                 repeat: Infinity, 
                 ease: "easeInOut", 
                 delay: Math.random() * 2, // Initial scatter
                 repeatDelay: Math.random() * 5 + 5 // 5-10s wait between passes
               }}
            />
          ))}
        </div>
      )}

      {/* Fireflies (Outdoor) */}
      {theme === "fireflies" && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
              animate={{ 
                x: [0, Math.random() * 40 - 20, 0],
                y: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: Math.random() * 3 + 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      )}

      {/* Warm Glow / Kitchen */}
      {(theme === "glow" || theme === "warm-glow") && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      {/* Tropical / Vacation - Swaying Palm Trees */}
      {theme === "tropical" && (
        <>
           {/* Warm Sun Glow */}
           <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           />
           
           {/* Tropical Gradient Base */}
           <motion.div
              className="absolute inset-0 bg-gradient-to-t from-teal-500/10 via-transparent to-orange-400/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           />

           {/* Swaying Palm Leaf 1 (Bottom Left) */}
           <motion.svg
            viewBox="0 0 100 100"
            className="absolute -bottom-10 -left-10 w-48 h-48 text-emerald-600/10 dark:text-emerald-400/10 pointer-events-none"
            style={{ originX: 0, originY: 1 }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
           >
             <path 
               d="M0 100 Q 50 20 100 0" 
               stroke="currentColor" 
               strokeWidth="20" 
               fill="none" 
               strokeLinecap="round"
               className="opacity-50"
             />
             <path d="M0 100 Q 45 25 90 5" stroke="currentColor" strokeWidth="2" fill="none" />
             {/* Leaf blades */}
             {[...Array(8)].map((_, i) => (
                <path 
                  key={i} 
                  d={`M${20 + i * 10} ${80 - i * 8} L${15 + i * 12} ${90 - i * 5}`} 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
             ))}
              <path 
                d="M0 100 C 20 80, 50 30, 90 10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="15"
                strokeLinecap="round"
                className="opacity-20"
              />
           </motion.svg>
            
            {/* More detailed Palm Leaf SVG */}
            <motion.div
              className="absolute -bottom-4 -left-4 w-40 h-40 text-emerald-700/10 dark:text-emerald-300/10"
              style={{ originX: 0, originY: 1 }}
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                 <path d="M10,21C10,21 11.5,14 18,10C18,10 14,12 12,16C12,16 13,9 19,5C19,5 14,8 11,13C11,13 10,2 15,0C15,0 9,4 9,12C9,12 5,4 4,0C4,0 4,8 8,14C8,14 2,11 0,8C0,8 3,16 9,18L10,21Z" />
               </svg>
            </motion.div>

           {/* Swaying Palm Leaf 2 (Bottom Right - smaller) */}
           <motion.div
              className="absolute -bottom-8 -right-8 w-32 h-32 text-teal-700/10 dark:text-teal-300/10"
              style={{ originX: 1, originY: 1 }}
              animate={{ rotate: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full transform scale-x-[-1]">
                 <path d="M10,21C10,21 11.5,14 18,10C18,10 14,12 12,16C12,16 13,9 19,5C19,5 14,8 11,13C11,13 10,2 15,0C15,0 9,4 9,12C9,12 5,4 4,0C4,0 4,8 8,14C8,14 2,11 0,8C0,8 3,16 9,18L10,21Z" />
               </svg>
           </motion.div>
        </>
      )}
      {/* 5-Star Overlay: Floating Hearts (Always visible if rating is 5) */}
      {rating === 5 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-red-400/30 text-xl"
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
                duration: Math.random() * 4 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear",
              }}
            >
              ♥
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

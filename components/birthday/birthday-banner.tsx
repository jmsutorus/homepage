"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Cake, X } from "lucide-react";
import { BirthdayCelebrationOverlay } from "./birthday-celebration-overlay";

interface BirthdayBannerProps {
  userName?: string | null;
}

export function BirthdayBanner({ userName }: BirthdayBannerProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if overlay was already shown this session
    const overlayShown = sessionStorage.getItem("birthday-overlay-shown");
    if (!overlayShown) {
      setShowOverlay(true);
      sessionStorage.setItem("birthday-overlay-shown", "true");
    }

    // Check if banner was dismissed this year
    const year = new Date().getFullYear();
    const bannerDismissed = localStorage.getItem(`birthday-banner-dismissed-${year}`);
    if (bannerDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    const year = new Date().getFullYear();
    localStorage.setItem(`birthday-banner-dismissed-${year}`, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Full-page celebration overlay (one-time) */}
      {showOverlay && (
        <BirthdayCelebrationOverlay onComplete={() => setShowOverlay(false)} />
      )}

      {/* Persistent birthday banner */}
      <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 border-none text-white shadow-xl relative overflow-hidden">
        {/* Background sparkle decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-4 left-8 text-2xl opacity-80"
            animate={{
              y: [-5, -10, -5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute top-6 right-16 text-2xl opacity-80"
            animate={{
              y: [-8, -13, -8],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 3,
              delay: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🎉
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-1/4 text-2xl opacity-80"
            animate={{
              y: [-6, -11, -6],
              scale: [1, 1.12, 1],
            }}
            transition={{
              duration: 3,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute top-1/2 right-8 text-2xl opacity-80"
            animate={{
              y: [-7, -12, -7],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              delay: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🎊
          </motion.div>
        </div>

        <CardContent className="p-4 sm:p-6 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Animated cake icon */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Cake className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              </motion.div>

              {/* Birthday message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
                  Happy Birthday{userName ? ` ${userName}` : ""}!
                </p>
                <p className="text-xs sm:text-sm opacity-90 hidden sm:block">
                  Have a wonderful day filled with joy and celebration! 🎂
                </p>
              </div>
            </div>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="hover:bg-white/20 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
              aria-label="Dismiss birthday banner"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

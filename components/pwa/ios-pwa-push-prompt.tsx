"use client";

import { useEffect, useState, useRef } from "react";
import { useFCMToken } from "@/hooks/use-fcm-token";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Bell } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "ios-pwa-push-prompt-dismissed";
const SNOOZE_KEY = "ios-pwa-push-prompt-snoozed-until";

export function IOSPwaPushPrompt() {
  const { permission, requestPermission, isSupported } = useFCMToken();
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || shownRef.current) return;

    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check storage keys
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
    const isSnoozed = snoozedUntil && Date.now() < parseInt(snoozedUntil, 10);

    console.log("🍏 iOS PWA Push Prompt Check:", {
      isIOS,
      isStandalone,
      permission,
      isSupported,
      isDismissed,
      isSnoozed,
    });

    if (isIOS && isStandalone && isSupported && permission === "default" && !isDismissed && !isSnoozed) {
      // Delay showing the prompt slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        shownRef.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [permission, isSupported]);

  const dismissForever = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const snooze = () => {
    // Snooze for 3 days
    localStorage.setItem(
      SNOOZE_KEY,
      (Date.now() + 3 * 24 * 60 * 60 * 1000).toString()
    );
    setIsVisible(false);
  };

  const handleAllow = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      toast.success("Notifications enabled!");
      setIsVisible(false);
    } else if (result === "denied") {
      toast.error("Notifications blocked. You can enable them in iOS Settings.");
      dismissForever();
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 400) {
      snooze();
    }
    setIsDragging(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={snooze}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[61]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ touchAction: "none" }}
          >
            <div
              className="rounded-t-[28px] border-t border-x overflow-hidden px-6 pt-2 pb-10"
              style={{
                background: "var(--media-surface)",
                borderColor: "var(--media-outline-variant)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-5">
                <div
                  className="h-1 w-10 rounded-full"
                  style={{ background: "var(--media-outline-variant)" }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isDragging ? 0.5 : 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon */}
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                  style={{ background: "var(--media-primary-container)" }}
                >
                  <Bell 
                    className="h-8 w-8 animate-bounce" 
                    style={{ color: "var(--media-primary)" }}
                  />
                </div>

                {/* Text */}
                <h3
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--media-on-surface)" }}
                >
                  Enable Notifications
                </h3>
                <p
                  className="text-sm mt-2 max-w-xs leading-relaxed"
                  style={{ color: "var(--media-on-surface-variant)" }}
                >
                  Stay updated with real-time alerts and reminders. Tap Allow to authorize notifications on this device.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 w-full mt-6">
                  <button
                    onClick={handleAllow}
                    className="cursor-pointer w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                    style={{
                      background: "var(--media-primary)",
                      color: "var(--media-on-primary)",
                    }}
                    id="ios-pwa-allow-button"
                  >
                    Allow Notifications
                  </button>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={snooze}
                      className="cursor-pointer flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 hover:opacity-80 border"
                      style={{
                        background: "var(--media-surface-container)",
                        color: "var(--media-on-surface-variant)",
                        borderColor: "var(--media-outline-variant)",
                      }}
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={dismissForever}
                      className="cursor-pointer flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 hover:opacity-80 border"
                      style={{
                        background: "var(--media-surface-container)",
                        color: "var(--media-on-surface-variant)",
                        borderColor: "var(--media-outline-variant)",
                      }}
                    >
                      Don&apos;t Ask Again
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Share, Plus } from "lucide-react";

const STORAGE_KEY = "pwa-install-prompt-dismissed";
const SNOOZE_KEY = "pwa-install-prompt-snoozed-until";
const PAGE_VIEWS_KEY = "pwa-page-views";
const MIN_PAGE_VIEWS = 2;

type View = "prompt" | "ios-instructions";

function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isSafari: false,
    isAndroidChrome: false,
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isAndroidChrome = /android/i.test(ua) && /chrome/i.test(ua);

    // Defer the state update to avoid the "synchronous setState in effect" warning
    // and batch the updates into a single re-render.
    const timer = setTimeout(() => {
      setDeviceInfo({ isIOS, isSafari, isAndroidChrome });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return deviceInfo;
}

export function InstallPrompt() {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();
  const { isIOS, isSafari, isAndroidChrome } = useDeviceDetection();
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<View>("prompt");
  const [isDragging, setIsDragging] = useState(false);
  const shownRef = useRef(false);

  const shouldShow = () => {
    if (isInstalled) return false;
    if (typeof window === "undefined") return false;
    if (localStorage.getItem(STORAGE_KEY) === "true") return false;
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) return false;
    return true;
  };

  useEffect(() => {
    if (isInstalled || shownRef.current) return;

    const pageViews = parseInt(localStorage.getItem(PAGE_VIEWS_KEY) || "0", 10);
    const newPageViews = pageViews + 1;
    localStorage.setItem(PAGE_VIEWS_KEY, newPageViews.toString());

    if (newPageViews < MIN_PAGE_VIEWS) return;

    // Chrome/Android: show when beforeinstallprompt fires
    if (canInstall && isAndroidChrome) {
      if (!shouldShow()) return;
      const timer = setTimeout(() => {
        setIsVisible(true);
        shownRef.current = true;
      }, 2500);
      return () => clearTimeout(timer);
    }

    // iOS Safari: show manual instructions
    if (isIOS && isSafari && !canInstall) {
      if (!shouldShow()) return;
      const timer = setTimeout(() => {
        setIsVisible(true);
        shownRef.current = true;
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Desktop Chrome/Edge: show if installable
    if (canInstall && !isIOS && !isAndroidChrome) {
      if (!shouldShow()) return;
      const timer = setTimeout(() => {
        setIsVisible(true);
        shownRef.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canInstall, isInstalled, isIOS, isSafari, isAndroidChrome]);

  const dismiss = () => setIsVisible(false);
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

  const handleInstall = async () => {
    if (isIOS) {
      setView("ios-instructions");
      return;
    }
    const installed = await promptInstall();
    if (installed) {
      setIsVisible(false);
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
          {/* Backdrop (mobile only) */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={snooze}
          />

          {/* Mobile: Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[61] md:hidden"
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
              className="rounded-t-[28px] border-t border-x overflow-hidden"
              style={{
                background: "var(--media-surface)",
                borderColor: "var(--media-outline-variant)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="h-1 w-10 rounded-full"
                  style={{ background: "var(--media-outline-variant)" }}
                />
              </div>

              <AnimatePresence mode="wait">
                {view === "prompt" ? (
                  <PromptView
                    key="prompt"
                    onInstall={handleInstall}
                    onSnooze={snooze}
                    onDismissForever={dismissForever}
                    onDismiss={dismiss}
                    isIOS={isIOS}
                    isDragging={isDragging}
                  />
                ) : (
                  <IOSInstructionsView
                    key="ios"
                    onBack={() => setView("prompt")}
                    onDone={dismissForever}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Desktop: Floating Banner */}
          <motion.div
            className="hidden md:block fixed bottom-6 right-6 z-[61] w-[360px]"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div
              className="rounded-2xl border shadow-xl overflow-hidden"
              style={{
                background: "var(--media-surface)",
                borderColor: "var(--media-outline-variant)",
              }}
            >
              <PromptView
                onInstall={handleInstall}
                onSnooze={snooze}
                onDismissForever={dismissForever}
                onDismiss={dismiss}
                isIOS={isIOS}
                isDragging={false}
                compact
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Prompt View ─────────────────────────────────────────────────────────── */

function PromptView({
  onInstall,
  onSnooze,
  onDismissForever,
  onDismiss,
  isIOS,
  isDragging,
  compact = false,
}: {
  onInstall: () => void;
  onSnooze: () => void;
  onDismissForever: () => void;
  onDismiss: () => void;
  isIOS: boolean;
  isDragging: boolean;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isDragging ? 0.5 : 1 }}
      exit={{ opacity: 0 }}
      className={compact ? "p-5" : "px-6 pt-2 pb-8"}
    >
      <div className="flex items-start gap-4">
        {/* App Icon */}
        <div className="shrink-0">
          <div
            className="h-14 w-14 rounded-2xl overflow-hidden shadow-md"
            style={{ background: "var(--media-primary-container)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt="Homepage app icon"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className="text-base font-semibold leading-tight"
            style={{ color: "var(--media-on-surface)" }}
          >
            Install Homepage
          </p>
          <p
            className="text-sm mt-0.5 leading-snug"
            style={{ color: "var(--media-on-surface-variant)" }}
          >
            {isIOS
              ? "Add to your Home Screen for the full app experience."
              : "Install for quick access, offline support, and a native feel."}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onDismiss}
          className="cursor-pointer shrink-0 -mt-1 -mr-1 rounded-full p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--media-on-surface-variant)" }}
          aria-label="Close install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Feature pills */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {["Offline access", "Fast & native", "Home screen icon"].map((f) => (
          <span
            key={f}
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: "var(--media-primary-container)",
              color: "var(--media-on-primary-container)",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-5">
        <button
          onClick={onInstall}
          className="cursor-pointer flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:opacity-90"
          style={{
            background: "var(--media-primary)",
            color: "var(--media-on-primary)",
          }}
          id="pwa-install-button"
        >
          {isIOS ? "Show me how" : "Install app"}
        </button>
        <button
          onClick={onSnooze}
          className="cursor-pointer px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 hover:opacity-80"
          style={{
            background: "var(--media-surface-container)",
            color: "var(--media-on-surface-variant)",
          }}
          id="pwa-install-snooze"
        >
          Not now
        </button>

      </div>
    </motion.div>
  );
}

/* ─── iOS Instructions View ─────────────────────────────────────────────── */

function IOSInstructionsView({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const steps = [
    {
      icon: <Share className="h-5 w-5" />,
      text: (
        <>
          Tap the{" "}
          <span
            className="font-semibold"
            style={{ color: "var(--media-primary)" }}
          >
            Share
          </span>{" "}
          button in your browser&apos;s toolbar
        </>
      ),
    },
    {
      icon: <Plus className="h-5 w-5" />,
      text: (
        <>
          Scroll down and tap{" "}
          <span
            className="font-semibold"
            style={{ color: "var(--media-primary)" }}
          >
            &ldquo;Add to Home Screen&rdquo;
          </span>
        </>
      ),
    },
    {
      icon: (
        <div
          className="h-5 w-5 rounded-md overflow-hidden"
          style={{ background: "var(--media-primary-container)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ),
      text: (
        <>
          Tap{" "}
          <span
            className="font-semibold"
            style={{ color: "var(--media-primary)" }}
          >
            &ldquo;Add&rdquo;
          </span>{" "}
          to add Homepage to your Home Screen
        </>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-2 pb-8"
    >
      <div className="flex items-center mb-5">
        <button
          onClick={onBack}
          className="cursor-pointer text-sm font-medium"
          style={{ color: "var(--media-primary)" }}
          id="pwa-ios-back"
        >
          ← Back
        </button>
        <h3
          className="text-base font-semibold flex-1 text-center pr-10"
          style={{ color: "var(--media-on-surface)" }}
        >
          Add to Home Screen
        </h3>
      </div>

      {/* Safari hint bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5"
        style={{ background: "var(--media-surface-container)" }}
      >
        <Share
          className="h-4 w-4 shrink-0"
          style={{ color: "var(--media-secondary)" }}
        />
        <span
          className="text-xs truncate flex-1"
          style={{ color: "var(--media-on-surface-variant)" }}
        >
          Tap the Share icon in your browser toolbar
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "var(--media-primary-container)",
                color: "var(--media-on-primary-container)",
              }}
            >
              {step.icon}
            </div>
            <div className="flex-1 pt-1">
              <p
                className="text-sm leading-snug"
                style={{ color: "var(--media-on-surface)" }}
              >
                {step.text}
              </p>
            </div>
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-1.5"
              style={{
                background: "var(--media-surface-container-high)",
                color: "var(--media-on-surface-variant)",
              }}
            >
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDone}
        className="cursor-pointer w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:opacity-90"
        style={{
          background: "var(--media-primary)",
          color: "var(--media-on-primary)",
        }}
        id="pwa-ios-done"
      >
        Got it!
      </button>
    </motion.div>
  );
}

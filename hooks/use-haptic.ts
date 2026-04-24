"use client";

import { useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { WebHaptics } from "web-haptics";

/**
 * Haptic feedback patterns.
 *
 * Maps to web-haptics presets on iOS (uses the hidden switch trick via the
 * Taptic Engine) and falls back to navigator.vibrate on Android.
 *
 * - light:   a brief, subtle tap (UI confirmation)
 * - medium:  a standard press feedback
 * - heavy:   a strong impact (destructive / important action)
 * - success: double-pulse (positive result)
 * - error:   triple-pulse (negative result)
 */
export type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

// Map our internal pattern names to web-haptics inputs
// web-haptics built-ins: "success", "nudge", "error", "buzz"
// Custom durations (ms) are passed as numbers.
const WEB_HAPTIC_PATTERNS: Record<HapticPattern, Parameters<WebHaptics["trigger"]>[0]> = {
  light:   40,
  medium:  80,
  heavy:   "buzz",       // Long vibration — closest to heavy
  success: "success",    // Two taps
  error:   "error",      // Three sharp taps
};

/**
 * useHaptic – returns a `trigger` function that fires haptic feedback only when:
 *   1. The user is on a mobile device (viewport < 768px)
 *   2. The user has haptic feedback enabled in their session settings
 *   3. The browser or platform supports haptics (Android via Vibration API,
 *      iOS via the web-haptics hidden-switch Taptic Engine workaround)
 *
 * @example
 * const haptic = useHaptic();
 * <button onClick={() => haptic.trigger("light")}>Press me</button>
 */
export function useHaptic() {
  const { data: session } = useSession();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const hapticsRef = useRef<WebHaptics | null>(null);

  // Lazily create the WebHaptics instance on the client only
  useEffect(() => {
    if (typeof window !== "undefined") {
      hapticsRef.current = new WebHaptics();
    }
    return () => {
      hapticsRef.current?.destroy();
      hapticsRef.current = null;
    };
  }, []);

  const isEnabled =
    isMobile &&
    !!session?.user?.haptic;

  const trigger = useCallback(
    (pattern: HapticPattern = "light") => {
      if (!isEnabled || !hapticsRef.current) return;
      hapticsRef.current.trigger(WEB_HAPTIC_PATTERNS[pattern]);
    },
    [isEnabled]
  );

  return { trigger, isEnabled };
}

"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Haptic feedback patterns (in milliseconds).
 *
 * - light:   a brief, subtle tap (UI confirmation)
 * - medium:  a standard press feedback
 * - heavy:   a strong impact (destructive / important action)
 * - success: double-pulse (positive result)
 * - error:   triple-pulse (negative result)
 */
export type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

const HAPTIC_PATTERNS: Record<HapticPattern, VibratePattern> = {
  light:   40,
  medium:  80,
  heavy:   120,
  success: [60, 40, 60],
  error:   [80, 50, 80, 50, 80],
};

/**
 * useHaptic – returns a `trigger` function that fires haptic feedback only when:
 *   1. The user is on a mobile device (viewport < 768px)
 *   2. The user has haptic feedback enabled in their session settings
 *   3. The browser supports the Vibration API
 *
 * @example
 * const haptic = useHaptic();
 * <button onClick={() => haptic.trigger("light")}>Press me</button>
 */
export function useHaptic() {
  const { data: session } = useSession();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const isEnabled =
    isMobile &&
    !!session?.user?.haptic &&
    typeof navigator !== "undefined" &&
    "vibrate" in navigator;

  const trigger = useCallback(
    (pattern: HapticPattern = "light") => {
      if (!isEnabled) return;
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    },
    [isEnabled]
  );

  return { trigger, isEnabled };
}

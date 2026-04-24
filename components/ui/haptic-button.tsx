"use client";

import React, { useCallback } from "react";
import { useHaptic, type HapticPattern } from "@/hooks/use-haptic";

interface HapticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Haptic feedback intensity pattern.
   * @default "light"
   */
  hapticPattern?: HapticPattern;
  /** Render as a child element instead of a <button> (e.g. pass an <a> tag). */
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * HapticButton – a drop-in replacement for `<button>` that fires haptic
 * feedback on press.  All standard button props are forwarded.
 *
 * Haptic feedback only fires when:
 *   • The user is on a mobile device (< 768 px)
 *   • `session.user.haptic` is true
 *   • The browser supports `navigator.vibrate`
 *
 * @example
 * // Basic usage
 * <HapticButton onClick={handleSave}>Save</HapticButton>
 *
 * @example
 * // Custom pattern
 * <HapticButton hapticPattern="heavy" onClick={handleDelete}>
 *   Delete
 * </HapticButton>
 *
 * @example
 * // Compose with existing styled buttons by spreading props
 * <HapticButton
 *   hapticPattern="success"
 *   className="px-8 py-4 bg-media-secondary text-media-on-secondary rounded-2xl"
 *   type="submit"
 * >
 *   Submit
 * </HapticButton>
 */
export function HapticButton({
  hapticPattern = "light",
  onClick,
  children,
  ...rest
}: HapticButtonProps) {
  const { trigger } = useHaptic();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      trigger(hapticPattern);
      onClick?.(e);
    },
    [trigger, hapticPattern, onClick]
  );

  return (
    <button {...rest} onClick={handleClick}>
      {children}
    </button>
  );
}

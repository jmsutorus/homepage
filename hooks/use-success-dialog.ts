"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseSuccessDialogOptions {
  /**
   * Duration in milliseconds to display the success state before auto-closing
   * @default 2000
   */
  duration?: number;
  /**
   * Callback to execute when the dialog should close (after success display)
   */
  onClose?: () => void;
}

interface UseSuccessDialogReturn {
  /**
   * Whether the success state is currently showing
   */
  showSuccess: boolean;
  /**
   * Trigger the success state and start auto-dismiss timer
   */
  triggerSuccess: () => void;
  /**
   * Reset the success state manually (useful for cleanup)
   */
  resetSuccess: () => void;
  /**
   * Whether currently in loading state (between trigger and success display)
   */
  isTransitioning: boolean;
}

/**
 * Hook to manage success state in dialogs with auto-dismiss functionality.
 *
 * @example
 * ```tsx
 * function MyDialog({ open, onOpenChange }) {
 *   const { showSuccess, triggerSuccess } = useSuccessDialog({
 *     duration: 2000,
 *     onClose: () => onOpenChange(false)
 *   });
 *
 *   const handleSubmit = async () => {
 *     await createItem();
 *     triggerSuccess();
 *   };
 *
 *   return (
 *     <Dialog open={open} onOpenChange={onOpenChange}>
 *       <DialogContent>
 *         {showSuccess ? (
 *           <SuccessContent />
 *         ) : (
 *           <form onSubmit={handleSubmit}>...</form>
 *         )}
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * ```
 */
export function useSuccessDialog(
  options: UseSuccessDialogOptions = {}
): UseSuccessDialogReturn {
  const { duration = 2000, onClose } = options;

  const [showSuccess, setShowSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSuccess = useCallback(() => {
    setShowSuccess(false);
    setIsTransitioning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const triggerSuccess = useCallback(() => {
    setIsTransitioning(true);

    // Small delay to ensure any loading states complete
    setTimeout(() => {
      setShowSuccess(true);
      setIsTransitioning(false);

      // Auto-close after duration
      timeoutRef.current = setTimeout(() => {
        resetSuccess();
        onClose?.();
      }, duration);
    }, 100);
  }, [duration, onClose, resetSuccess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    showSuccess,
    triggerSuccess,
    resetSuccess,
    isTransitioning,
  };
}

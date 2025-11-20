"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type AnimationState =
  | "idle"
  | "sweeping"
  | "fading"
  | "showing-message"
  | "removing"
  | "completed";

interface TaskCompletionAnimationProps {
  /**
   * Whether the task is marked as completed
   */
  isCompleted: boolean;
  /**
   * Whether the animation should play (trigger when toggling to completed)
   */
  shouldAnimate: boolean;
  /**
   * Callback when animation sequence completes
   */
  onAnimationComplete?: () => void;
  /**
   * The task content to display and animate
   */
  children: React.ReactNode;
  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * Wrapper component that animates task completion with a green sweep line,
 * fade out, and "Task Completed" message before removal.
 *
 * @example
 * ```tsx
 * <TaskCompletionAnimation
 *   isCompleted={task.completed}
 *   shouldAnimate={isAnimating}
 *   onAnimationComplete={() => handleRemoveFromList(task.id)}
 * >
 *   <TaskCard task={task} />
 * </TaskCompletionAnimation>
 * ```
 */
export function TaskCompletionAnimation({
  isCompleted,
  shouldAnimate,
  onAnimationComplete,
  children,
  className = "",
}: TaskCompletionAnimationProps) {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Start animation sequence when shouldAnimate becomes true
  useEffect(() => {
    if (shouldAnimate && animationState === "idle") {
      if (prefersReducedMotion) {
        // Skip animation, go straight to completion
        setAnimationState("completed");
        setTimeout(() => onAnimationComplete?.(), 100);
      } else {
        // Start animation sequence
        setAnimationState("sweeping");
      }
    }
  }, [shouldAnimate, prefersReducedMotion, onAnimationComplete, animationState]);

  // Handle animation state transitions
  useEffect(() => {
    if (animationState === "sweeping") {
      // After sweep completes (400ms), start fading
      const timer = setTimeout(() => {
        setAnimationState("fading");
      }, 400);
      return () => clearTimeout(timer);
    }

    if (animationState === "fading") {
      // After fade (200ms), show completion message
      const timer = setTimeout(() => {
        setAnimationState("showing-message");
      }, 200);
      return () => clearTimeout(timer);
    }

    if (animationState === "showing-message") {
      // After showing message (1000ms), start removal
      const timer = setTimeout(() => {
        setAnimationState("removing");
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (animationState === "removing") {
      // After removal animation (300ms), mark as completed
      const timer = setTimeout(() => {
        setAnimationState("completed");
        onAnimationComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animationState, onAnimationComplete]);

  const isAnimating = animationState !== "idle" && animationState !== "completed";
  const showContent = animationState !== "removing" && animationState !== "completed";
  const showMessage = animationState === "showing-message";
  const contentOpacity =
    animationState === "fading" ? 0.5 :
    animationState === "showing-message" ? 0 :
    1;

  // Don't render anything if completed (to prevent "0" or other artifacts)
  if (animationState === "completed") {
    return null;
  }

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      layout
      initial={false}
      animate={{
        opacity: animationState === "removing" ? 0 : 1,
        x: animationState === "removing" ? 100 : 0,
        scale: animationState === "removing" ? 0.95 : 1,
      }}
      transition={{
        duration: animationState === "removing" ? 0.3 : 0.2,
        ease: animationState === "removing" ? "easeOut" : "easeInOut",
      }}
    >
      {/* Task content with fade animation */}
      {showContent ? (
        <motion.div
          animate={{ opacity: contentOpacity }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      ) : null}

      {/* Green sweep line */}
      <AnimatePresence>
        {animationState === "sweeping" ? (
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            style={{ zIndex: 10 }}
          />
        ) : null}
      </AnimatePresence>

      {/* "Task Completed" message */}
      <AnimatePresence>
        {showMessage ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Task Completed</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Screen reader announcement */}
      {shouldAnimate && isCompleted ? (
        <div className="sr-only" role="status" aria-live="polite">
          Task marked as complete
        </div>
      ) : null}
    </motion.div>
  );
}

/**
 * Hook to manage task completion animation state
 *
 * @example
 * ```tsx
 * const { animatingTasks, startAnimation, cleanupTask } = useTaskCompletionAnimation();
 *
 * const handleToggle = async (taskId) => {
 *   startAnimation(taskId);
 *   await updateTaskAPI(taskId);
 * };
 *
 * return tasks.map(task => (
 *   <TaskCompletionAnimation
 *     shouldAnimate={animatingTasks.has(task.id)}
 *     onAnimationComplete={() => cleanupTask(task.id)}
 *   >
 *     <TaskCard task={task} />
 *   </TaskCompletionAnimation>
 * ));
 * ```
 */
export function useTaskCompletionAnimation() {
  const [animatingTasks, setAnimatingTasks] = useState<Set<number>>(new Set());

  const startAnimation = useCallback((taskId: number) => {
    setAnimatingTasks((prev) => new Set(prev).add(taskId));
  }, []);

  const cleanupTask = useCallback((taskId: number) => {
    setAnimatingTasks((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  const isAnimating = useCallback((taskId: number) => {
    return animatingTasks.has(taskId);
  }, [animatingTasks]);

  return {
    animatingTasks,
    startAnimation,
    cleanupTask,
    isAnimating,
  };
}

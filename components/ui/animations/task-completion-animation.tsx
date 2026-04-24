"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { TreeSuccess } from "./tree-success";

type AnimationState =
  | "idle"
  | "showing-success"
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
    const initialMatches = mediaQuery.matches;

    // Defer initial state update to avoid cascading renders warning
    const timer = setTimeout(() => {
      setPrefersReducedMotion(initialMatches);
    }, 0);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Start animation sequence when shouldAnimate becomes true
  useEffect(() => {
    if (shouldAnimate && animationState === "idle") {
      // Defer state update to avoid cascading renders warning
      const timer = setTimeout(() => {
        if (prefersReducedMotion) {
          setAnimationState("completed");
          onAnimationComplete?.();
        } else {
          setAnimationState("showing-success");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, prefersReducedMotion, onAnimationComplete, animationState]);

  const handleSuccessComplete = () => {
    // Wait a short bit after the tree finishes to let the user see the final state
    setTimeout(() => {
      setAnimationState("completed");
      onAnimationComplete?.();
    }, 375);
  };

  const showSuccess = animationState === "showing-success";

  // Don't render anything if completed
  if (animationState === "completed") {
    return null;
  }

  return (
    <motion.div
      className={`relative ${className}`}
      layout
    >
      {/* Task content - Dimmed when successful */}
      <motion.div
        animate={{ 
          opacity: showSuccess ? 0.1 : 1,
          filter: showSuccess ? "blur(4px)" : "blur(0px)"
        }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>

      {/* Success Animation Inline */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <TreeSuccess 
              onComplete={handleSuccessComplete} 
              size={80} 
              showText={false}
              className="drop-shadow-2xl"
            />
          </motion.div>
        )}
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

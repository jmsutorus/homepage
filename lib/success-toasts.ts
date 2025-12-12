import { toast } from "sonner";

/**
 * Configuration options for success toasts
 */
interface SuccessToastOptions {
  /**
   * Custom message to display (overrides default entity-based message)
   */
  message?: string;
  /**
   * Toast duration in milliseconds
   * @default 3000
   */
  duration?: number;
  /**
   * Whether the toast should persist across page navigations
   * Useful for full-page editors that navigate after creation
   * @default false
   */
  persistent?: boolean;
  /**
   * Additional description or details to show below the main message
   */
  description?: string;
}

/**
 * Entity types that can be created in the application
 */
type EntityType =
  | "habit"
  | "task"
  | "event"
  | "mood"
  | "activity"
  | "journal"
  | "media"
  | "park"
  | "category"
  | "link"
  | "goal";

/**
 * Default success messages for each entity type
 */
const DEFAULT_MESSAGES: Record<EntityType, string> = {
  habit: "Habit created successfully!",
  task: "Task added to your list",
  event: "Event added to calendar",
  mood: "Mood entry recorded",
  activity: "Activity logged successfully",
  journal: "Journal entry saved",
  media: "Media entry added to collection",
  park: "Park visit recorded",
  category: "Category created",
  link: "Link added",
  goal: "Goal created successfully!",
};

/**
 * Default descriptions for entity types (optional motivational messages)
 */
const DEFAULT_DESCRIPTIONS: Partial<Record<EntityType, string>> = {
  habit: "You're on your way to building better habits!",
  activity: "Keep up the momentum!",
  mood: "Thanks for checking in with yourself.",
  journal: "Your thoughts have been saved.",
  goal: "One step closer to your dreams!",
};

/**
 * Show a success toast notification for a creation action
 *
 * @param entity - The type of entity that was created
 * @param options - Configuration options for the toast
 *
 * @example
 * ```ts
 * // Simple usage
 * showCreationSuccess("task");
 *
 * // With custom message
 * showCreationSuccess("task", { message: "Todo item created!" });
 *
 * // Persistent toast (for navigation scenarios)
 * showCreationSuccess("journal", { persistent: true });
 *
 * // With description
 * showCreationSuccess("habit", {
 *   description: "Keep going, you're doing great!"
 * });
 * ```
 */
export function showCreationSuccess(
  entity: EntityType,
  options: SuccessToastOptions = {}
): void {
  const {
    message = DEFAULT_MESSAGES[entity],
    duration = 3000,
    persistent = false,
    description = DEFAULT_DESCRIPTIONS[entity],
  } = options;

  const toastOptions = {
    duration: persistent ? Infinity : duration,
    description,
  };

  toast.success(message, toastOptions);
}

/**
 * Show an error toast notification for a failed creation action
 *
 * @param entity - The type of entity that failed to create
 * @param error - The error that occurred (optional)
 * @param options - Configuration options for the toast
 *
 * @example
 * ```ts
 * // Simple usage
 * showCreationError("task");
 *
 * // With error details
 * showCreationError("task", new Error("Network error"));
 *
 * // With custom message
 * showCreationError("task", undefined, {
 *   message: "Could not save your task"
 * });
 * ```
 */
export function showCreationError(
  entity: EntityType,
  error?: Error | unknown,
  options: Omit<SuccessToastOptions, "persistent"> = {}
): void {
  const { message, duration = 4000 } = options;

  const defaultErrorMessage = `Failed to create ${entity}`;
  const errorMessage = message || defaultErrorMessage;

  // Include error details if available
  let description: string | undefined;
  if (error instanceof Error) {
    description = error.message;
  } else if (error && typeof error === "string") {
    description = error;
  }

  toast.error(errorMessage, {
    duration,
    description,
  });
}

/**
 * Dismiss a persistent toast (useful when user navigates away or performs another action)
 *
 * @example
 * ```ts
 * // Show persistent toast
 * const toastId = showCreationSuccess("journal", { persistent: true });
 *
 * // Later, dismiss it
 * dismissToast(toastId);
 * ```
 */
export function dismissToast(toastId?: string | number): void {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    // Dismiss all toasts
    toast.dismiss();
  }
}

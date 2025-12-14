/**
 * Optimistic Updates Helper
 *
 * Utilities for managing optimistic UI updates when offline.
 * Generates temporary IDs and handles ID replacement after sync.
 */

/**
 * Generate a temporary ID for offline-created items
 */
export function generateTempId(prefix: string = "temp"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if an ID is a temporary ID
 */
export function isTempId(id: string): boolean {
  return id.startsWith("temp_");
}

/**
 * Storage key for optimistic updates
 */
const OPTIMISTIC_STORAGE_KEY = "homepage-optimistic-updates";

/**
 * Store optimistic update in localStorage
 */
export function storeOptimisticUpdate(
  type: string,
  tempId: string,
  data: any
): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(OPTIMISTIC_STORAGE_KEY);
    const updates = stored ? JSON.parse(stored) : {};

    updates[tempId] = {
      type,
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(OPTIMISTIC_STORAGE_KEY, JSON.stringify(updates));
  } catch (error) {
    console.error("Failed to store optimistic update:", error);
  }
}

/**
 * Get optimistic update by temp ID
 */
export function getOptimisticUpdate(tempId: string): any | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(OPTIMISTIC_STORAGE_KEY);
    if (!stored) return null;

    const updates = JSON.parse(stored);
    return updates[tempId] || null;
  } catch (error) {
    console.error("Failed to get optimistic update:", error);
    return null;
  }
}

/**
 * Remove optimistic update after successful sync
 */
export function removeOptimisticUpdate(tempId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(OPTIMISTIC_STORAGE_KEY);
    if (!stored) return;

    const updates = JSON.parse(stored);
    delete updates[tempId];

    if (Object.keys(updates).length === 0) {
      localStorage.removeItem(OPTIMISTIC_STORAGE_KEY);
    } else {
      localStorage.setItem(OPTIMISTIC_STORAGE_KEY, JSON.stringify(updates));
    }
  } catch (error) {
    console.error("Failed to remove optimistic update:", error);
  }
}

/**
 * Get all optimistic updates
 */
export function getAllOptimisticUpdates(): Record<string, any> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(OPTIMISTIC_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to get all optimistic updates:", error);
    return {};
  }
}

/**
 * Clear all optimistic updates (use with caution)
 */
export function clearOptimisticUpdates(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(OPTIMISTIC_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear optimistic updates:", error);
  }
}

/**
 * Replace temporary ID with real ID after sync
 */
export function replaceTempId<T extends { id: string }>(
  items: T[],
  tempId: string,
  realId: string
): T[] {
  return items.map((item) =>
    item.id === tempId ? { ...item, id: realId } : item
  );
}

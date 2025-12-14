/**
 * Background Sync System
 *
 * Processes offline queue when connection is restored.
 * Handles retry logic and error management for queued mutations.
 */

import {
  getPendingMutations,
  updateMutationStatus,
  removeFromQueue,
  type QueuedMutation,
} from "./offline-queue";

// Event types for sync notifications
export type SyncEventType = "sync-start" | "sync-complete" | "sync-error" | "mutation-synced" | "mutation-failed";

// Sync event data
export interface SyncEvent {
  type: SyncEventType;
  mutation?: QueuedMutation;
  error?: string;
  successCount?: number;
  failureCount?: number;
}

// Event listeners
type SyncEventListener = (event: SyncEvent) => void;
const listeners: SyncEventListener[] = [];

/**
 * Add event listener for sync events
 */
export function addSyncListener(listener: SyncEventListener): () => void {
  listeners.push(listener);

  // Return cleanup function
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Emit sync event to all listeners
 */
function emitSyncEvent(event: SyncEvent): void {
  listeners.forEach((listener) => listener(event));
}

/**
 * Process a single mutation by calling the appropriate API endpoint
 */
async function processMutation(mutation: QueuedMutation): Promise<void> {
  const { type, data } = mutation;

  console.log(`🔄 Processing mutation: ${type}`, data);

  try {
    let response: Response;

    switch (type) {
      case "CREATE_TASK":
        response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "UPDATE_TASK":
        response = await fetch(`/api/tasks/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "DELETE_TASK":
        response = await fetch(`/api/tasks/${data.id}`, {
          method: "DELETE",
        });
        break;

      case "CREATE_HABIT":
      case "UPDATE_HABIT":
        response = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "LOG_MOOD":
        response = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "CREATE_JOURNAL":
        response = await fetch("/api/journals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "UPDATE_JOURNAL":
        response = await fetch(`/api/journals/${data.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "CREATE_EVENT":
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "UPDATE_EVENT":
        response = await fetch(`/api/events/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "DELETE_EVENT":
        response = await fetch(`/api/events/${data.id}`, {
          method: "DELETE",
        });
        break;

      case "LOG_ACTIVITY":
        response = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "CREATE_GOAL":
        response = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      case "UPDATE_GOAL":
        response = await fetch(`/api/goals/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        break;

      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ Mutation synced successfully: ${type}`);
  } catch (error) {
    console.error(`❌ Failed to sync mutation: ${type}`, error);
    throw error;
  }
}

/**
 * Process all pending mutations in the queue
 */
export async function syncQueue(): Promise<{
  success: number;
  failed: number;
}> {
  console.log("🔄 Starting background sync...");

  emitSyncEvent({ type: "sync-start" });

  const mutations = await getPendingMutations();
  let successCount = 0;
  let failureCount = 0;

  if (mutations.length === 0) {
    console.log("✅ No pending mutations to sync");
    emitSyncEvent({
      type: "sync-complete",
      successCount: 0,
      failureCount: 0
    });
    return { success: 0, failed: 0 };
  }

  console.log(`📋 Found ${mutations.length} pending mutations`);

  for (const mutation of mutations) {
    try {
      // Mark as syncing
      await updateMutationStatus(mutation.id, "syncing");

      // Process the mutation
      await processMutation(mutation);

      // Remove from queue on success
      await removeFromQueue(mutation.id);
      successCount++;

      emitSyncEvent({
        type: "mutation-synced",
        mutation,
      });
    } catch (error) {
      // Mark as failed
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await updateMutationStatus(mutation.id, "failed", errorMessage);
      failureCount++;

      emitSyncEvent({
        type: "mutation-failed",
        mutation,
        error: errorMessage,
      });

      // Don't stop processing other mutations
      console.error(`Failed to sync mutation ${mutation.id}:`, error);
    }
  }

  console.log(`✅ Sync complete: ${successCount} succeeded, ${failureCount} failed`);

  emitSyncEvent({
    type: "sync-complete",
    successCount,
    failureCount,
  });

  return { success: successCount, failed: failureCount };
}

/**
 * Retry failed mutations
 */
export async function retryFailedMutations(): Promise<{
  success: number;
  failed: number;
}> {
  console.log("🔄 Retrying failed mutations...");
  return await syncQueue();
}

/**
 * Check if sync should be attempted based on network status
 */
export function shouldSync(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

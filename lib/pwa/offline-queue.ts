/**
 * Offline Queue System
 *
 * Manages pending mutations when offline using IndexedDB.
 * Stores CRUD operations for sync when connection is restored.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

// Mutation types supported by the offline queue
export type MutationType =
  | "CREATE_TASK"
  | "UPDATE_TASK"
  | "DELETE_TASK"
  | "CREATE_HABIT"
  | "UPDATE_HABIT"
  | "LOG_MOOD"
  | "CREATE_JOURNAL"
  | "UPDATE_JOURNAL"
  | "CREATE_EVENT"
  | "UPDATE_EVENT"
  | "DELETE_EVENT"
  | "LOG_ACTIVITY"
  | "CREATE_GOAL"
  | "UPDATE_GOAL";

// Status of a queued mutation
export type MutationStatus = "pending" | "syncing" | "failed";

// Structure of a queued mutation
export interface QueuedMutation {
  id: string;
  type: MutationType;
  data: any;
  timestamp: number;
  retryCount: number;
  status: MutationStatus;
  error?: string;
  tempId?: string; // Temporary ID for optimistic updates
}

// IndexedDB schema
interface OfflineQueueDB extends DBSchema {
  mutations: {
    key: string;
    value: QueuedMutation;
    indexes: { timestamp: number; status: MutationStatus };
  };
}

const DB_NAME = "homepage-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "mutations";

let dbInstance: IDBPDatabase<OfflineQueueDB> | null = null;

/**
 * Initialize the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase<OfflineQueueDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create mutations store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("status", "status");
      }
    },
  });

  return dbInstance;
}

/**
 * Generate a unique ID for mutations
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add a mutation to the queue
 */
export async function addToQueue(
  type: MutationType,
  data: any,
  tempId?: string
): Promise<string> {
  const db = await getDB();
  const id = generateId();

  const mutation: QueuedMutation = {
    id,
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0,
    status: "pending",
    tempId,
  };

  await db.add(STORE_NAME, mutation);
  console.log(`📝 Added to offline queue: ${type}`, mutation);

  return id;
}

/**
 * Get all pending mutations
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const index = tx.store.index("status");
  const pending = await index.getAll("pending");
  await tx.done;

  return pending.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get all mutations (any status)
 */
export async function getAllMutations(): Promise<QueuedMutation[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get a specific mutation by ID
 */
export async function getMutation(id: string): Promise<QueuedMutation | undefined> {
  const db = await getDB();
  return await db.get(STORE_NAME, id);
}

/**
 * Update mutation status
 */
export async function updateMutationStatus(
  id: string,
  status: MutationStatus,
  error?: string
): Promise<void> {
  const db = await getDB();
  const mutation = await db.get(STORE_NAME, id);

  if (mutation) {
    mutation.status = status;
    if (error) {
      mutation.error = error;
    }
    if (status === "failed") {
      mutation.retryCount++;
    }

    await db.put(STORE_NAME, mutation);
    console.log(`🔄 Updated mutation status: ${id} -> ${status}`);
  }
}

/**
 * Remove a mutation from the queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  console.log(`✅ Removed from queue: ${id}`);
}

/**
 * Clear all mutations (use with caution!)
 */
export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
  console.log("🗑️ Cleared offline queue");
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  total: number;
  pending: number;
  syncing: number;
  failed: number;
}> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);

  return {
    total: all.length,
    pending: all.filter((m) => m.status === "pending").length,
    syncing: all.filter((m) => m.status === "syncing").length,
    failed: all.filter((m) => m.status === "failed").length,
  };
}

/**
 * Export queue for debugging
 */
export async function exportQueue(): Promise<QueuedMutation[]> {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

/**
 * Import queue (for debugging/testing)
 */
export async function importQueue(mutations: QueuedMutation[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");

  for (const mutation of mutations) {
    await tx.store.put(mutation);
  }

  await tx.done;
  console.log(`📥 Imported ${mutations.length} mutations`);
}

/**
 * Get failed mutations (for manual retry)
 */
export async function getFailedMutations(): Promise<QueuedMutation[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const index = tx.store.index("status");
  const failed = await index.getAll("failed");
  await tx.done;

  return failed.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Retry a failed mutation
 */
export async function retryMutation(id: string): Promise<void> {
  await updateMutationStatus(id, "pending");
}

/**
 * Retry all failed mutations
 */
export async function retryAllFailed(): Promise<void> {
  const failed = await getFailedMutations();
  for (const mutation of failed) {
    await retryMutation(mutation.id);
  }
  console.log(`🔄 Retrying ${failed.length} failed mutations`);
}

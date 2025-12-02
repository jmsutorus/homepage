import { execute, queryOne } from "./index";

export interface CacheEntry {
  key: string;
  userId: string;
  value: string;
  expires_at: string;
  created_at: string;
}

/**
 * Get cached value if not expired for a specific user
 */
export async function getCachedValue<T>(key: string, userId: string): Promise<T | null> {
  const entry = await queryOne<CacheEntry>(
    "SELECT * FROM api_cache WHERE key = ? AND userId = ? AND expires_at > datetime('now')",
    [key, userId]
  );

  if (!entry) {
    return null;
  }

  try {
    return JSON.parse(entry.value) as T;
  } catch (error) {
    console.error("Failed to parse cached value:", error);
    return null;
  }
}

/**
 * Set cached value with TTL (in seconds) for a specific user
 */
export async function setCachedValue(key: string, value: unknown, userId: string, ttlSeconds: number): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const jsonValue = JSON.stringify(value);

  await execute(
    `INSERT INTO api_cache (key, value, userId, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       userId = excluded.userId,
       expires_at = excluded.expires_at,
       created_at = CURRENT_TIMESTAMP`,
    [key, jsonValue, userId, expiresAt]
  );
}

/**
 * Invalidate specific cache key for a specific user
 */
export async function invalidateCache(key: string, userId: string): Promise<boolean> {
  const result = await execute("DELETE FROM api_cache WHERE key = ? AND userId = ?", [key, userId]);
  return result.changes > 0;
}

/**
 * Invalidate cache keys matching a pattern for a specific user
 */
export async function invalidateCachePattern(pattern: string, userId: string): Promise<number> {
  const result = await execute("DELETE FROM api_cache WHERE key LIKE ? AND userId = ?", [pattern, userId]);
  return result.changes;
}

/**
 * Clear all expired cache entries for a specific user
 */
export async function clearExpiredCache(userId: string): Promise<number> {
  const result = await execute(
    "DELETE FROM api_cache WHERE userId = ? AND expires_at <= datetime('now')",
    [userId]
  );
  return result.changes;
}

/**
 * Clear all cache entries for a specific user
 */
export async function clearAllCache(userId: string): Promise<number> {
  const result = await execute("DELETE FROM api_cache WHERE userId = ?", [userId]);
  return result.changes;
}

/**
 * Get cache statistics for a specific user
 */
export async function getCacheStatistics(userId: string): Promise<{
  total: number;
  expired: number;
  active: number;
}> {
  const total = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM api_cache WHERE userId = ?",
    [userId]
  );

  const expired = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM api_cache WHERE userId = ? AND expires_at <= datetime('now')",
    [userId]
  );

  return {
    total: total?.count || 0,
    expired: expired?.count || 0,
    active: (total?.count || 0) - (expired?.count || 0),
  };
}

/**
 * Helper function to get or set cache for a specific user
 */
export async function getOrSetCache<T>(
  key: string,
  userId: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedValue<T>(key, userId);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  await setCachedValue(key, data, userId, ttlSeconds);

  return data;
}

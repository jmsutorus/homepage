import { execute, queryOne } from "./index";

export interface CacheEntry {
  key: string;
  value: string;
  expires_at: string;
  created_at: string;
}

/**
 * Get cached value if not expired
 */
export function getCachedValue<T>(key: string): T | null {
  const entry = queryOne<CacheEntry>(
    "SELECT * FROM api_cache WHERE key = ? AND expires_at > datetime('now')",
    [key]
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
 * Set cached value with TTL (in seconds)
 */
export function setCachedValue(key: string, value: unknown, ttlSeconds: number): void {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const jsonValue = JSON.stringify(value);

  execute(
    `INSERT INTO api_cache (key, value, expires_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       expires_at = excluded.expires_at,
       created_at = CURRENT_TIMESTAMP`,
    [key, jsonValue, expiresAt]
  );
}

/**
 * Invalidate specific cache key
 */
export function invalidateCache(key: string): boolean {
  const result = execute("DELETE FROM api_cache WHERE key = ?", [key]);
  return result.changes > 0;
}

/**
 * Invalidate cache keys matching a pattern
 */
export function invalidateCachePattern(pattern: string): number {
  const result = execute("DELETE FROM api_cache WHERE key LIKE ?", [pattern]);
  return result.changes;
}

/**
 * Clear all expired cache entries
 */
export function clearExpiredCache(): number {
  const result = execute(
    "DELETE FROM api_cache WHERE expires_at <= datetime('now')"
  );
  return result.changes;
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): number {
  const result = execute("DELETE FROM api_cache");
  return result.changes;
}

/**
 * Get cache statistics
 */
export function getCacheStatistics(): {
  total: number;
  expired: number;
  active: number;
} {
  const total = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM api_cache"
  );

  const expired = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM api_cache WHERE expires_at <= datetime('now')"
  );

  return {
    total: total?.count || 0,
    expired: expired?.count || 0,
    active: (total?.count || 0) - (expired?.count || 0),
  };
}

/**
 * Helper function to get or set cache
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = getCachedValue<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  setCachedValue(key, data, ttlSeconds);

  return data;
}

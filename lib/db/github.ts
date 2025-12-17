import { execute, query, queryOne } from "./index";
import type { GithubEvent } from "@/lib/github";

/**
 * Database representation of a GitHub event
 */
export interface DBGithubEvent {
  id: string;
  userId: string;
  type: string;
  actor_login: string;
  actor_avatar_url: string | null;
  repo_id: number;
  repo_name: string;
  payload: string | null;
  public: boolean;
  created_at: string;
  synced_at: string;
}

/**
 * Database representation of GitHub sync status
 */
export interface DBGithubSyncStatus {
  id: number;
  userId: string;
  last_sync: string | null;
  last_sync_events_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Convert a GitHub API event to database format
 */
function toDBEvent(event: GithubEvent, userId: string): Omit<DBGithubEvent, "synced_at"> {
  return {
    id: event.id,
    userId,
    type: event.type,
    actor_login: event.actor.login,
    actor_avatar_url: event.actor.avatar_url || null,
    repo_id: event.repo.id,
    repo_name: event.repo.name,
    payload: event.payload ? JSON.stringify(event.payload) : null,
    public: event.public,
    created_at: event.created_at,
  };
}

/**
 * Convert a database event to GitHub API format
 */
export function toGithubEvent(dbEvent: DBGithubEvent): GithubEvent {
  return {
    id: dbEvent.id,
    type: dbEvent.type,
    actor: {
      id: 0, // Not stored in DB
      login: dbEvent.actor_login,
      display_login: dbEvent.actor_login,
      gravatar_id: "",
      url: `https://api.github.com/users/${dbEvent.actor_login}`,
      avatar_url: dbEvent.actor_avatar_url || "",
    },
    repo: {
      id: dbEvent.repo_id,
      name: dbEvent.repo_name,
      url: `https://api.github.com/repos/${dbEvent.repo_name}`,
    },
    payload: dbEvent.payload ? JSON.parse(dbEvent.payload) : {},
    public: dbEvent.public,
    created_at: dbEvent.created_at,
  };
}

/**
 * Upsert multiple GitHub events
 */
export async function upsertGithubEvents(
  events: GithubEvent[],
  userId: string
): Promise<void> {
  if (events.length === 0) return;

  const sql = `
    INSERT INTO github_events (id, userId, type, actor_login, actor_avatar_url, repo_id, repo_name, payload, public, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      actor_login = excluded.actor_login,
      actor_avatar_url = excluded.actor_avatar_url,
      repo_id = excluded.repo_id,
      repo_name = excluded.repo_name,
      payload = excluded.payload,
      public = excluded.public,
      created_at = excluded.created_at,
      synced_at = CURRENT_TIMESTAMP
  `;

  for (const event of events) {
    const dbEvent = toDBEvent(event, userId);
    await execute(sql, [
      dbEvent.id,
      dbEvent.userId,
      dbEvent.type,
      dbEvent.actor_login,
      dbEvent.actor_avatar_url,
      dbEvent.repo_id,
      dbEvent.repo_name,
      dbEvent.payload,
      dbEvent.public ? 1 : 0,
      dbEvent.created_at,
    ]);
  }
}

/**
 * Get GitHub events by date range
 */
export async function getGithubEventsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<GithubEvent[]> {
  const sql = `
    SELECT * FROM github_events
    WHERE userId = ?
      AND created_at >= ?
      AND created_at <= ?
    ORDER BY created_at DESC
  `;

  const rows = await query<DBGithubEvent>(sql, [userId, startDate, endDate]);
  return rows.map(toGithubEvent);
}

/**
 * Get GitHub events for a specific date
 */
export async function getGithubEventsForDate(
  userId: string,
  date: string
): Promise<GithubEvent[]> {
  // date is in YYYY-MM-DD format
  const startDate = `${date}T00:00:00Z`;
  const endDate = `${date}T23:59:59Z`;
  return getGithubEventsByDateRange(userId, startDate, endDate);
}

/**
 * Get all GitHub events for a user
 */
export async function getAllGithubEvents(
  userId: string,
  limit = 100
): Promise<GithubEvent[]> {
  const sql = `
    SELECT * FROM github_events
    WHERE userId = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  const rows = await query<DBGithubEvent>(sql, [userId, limit]);
  return rows.map(toGithubEvent);
}

/**
 * Get GitHub sync status for a user
 */
export async function getGithubSyncStatus(
  userId: string
): Promise<DBGithubSyncStatus | undefined> {
  const sql = `SELECT * FROM github_sync_status WHERE userId = ?`;
  return queryOne<DBGithubSyncStatus>(sql, [userId]);
}

/**
 * Get last sync time for a user
 */
export async function getGithubLastSyncTime(
  userId: string
): Promise<Date | null> {
  const status = await getGithubSyncStatus(userId);
  if (!status?.last_sync) return null;
  return new Date(status.last_sync);
}

/**
 * Update GitHub sync status
 */
export async function updateGithubSyncStatus(
  userId: string,
  eventsCount: number
): Promise<void> {
  const sql = `
    INSERT INTO github_sync_status (userId, last_sync, last_sync_events_count)
    VALUES (?, CURRENT_TIMESTAMP, ?)
    ON CONFLICT(userId) DO UPDATE SET
      last_sync = CURRENT_TIMESTAMP,
      last_sync_events_count = excluded.last_sync_events_count,
      updated_at = CURRENT_TIMESTAMP
  `;

  await execute(sql, [userId, eventsCount]);
}

/**
 * Delete all GitHub events for a user
 */
export async function deleteGithubEvents(userId: string): Promise<boolean> {
  const sql = `DELETE FROM github_events WHERE userId = ?`;
  await execute(sql, [userId]);
  return true;
}

/**
 * Get event count by type for a user
 */
export async function getGithubEventCountsByType(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<Record<string, number>> {
  let sql = `
    SELECT type, COUNT(*) as count
    FROM github_events
    WHERE userId = ?
  `;
  const params: (string | number)[] = [userId];

  if (startDate) {
    sql += ` AND created_at >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND created_at <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY type`;

  const rows = await query<{ type: string; count: number }>(sql, params);
  return rows.reduce(
    (acc, row) => {
      acc[row.type] = row.count;
      return acc;
    },
    {} as Record<string, number>
  );
}

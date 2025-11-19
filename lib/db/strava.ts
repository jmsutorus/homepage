import { getDatabase, queryOne, query, execute } from "./index";
import type { StravaActivity, StravaAthlete } from "@/lib/api/strava";

export interface DBStravaActivity {
  id: number;
  athlete_id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  achievement_count: number;
  kudos_count: number;
  trainer: boolean;
  commute: boolean;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  elev_high?: number;
  elev_low?: number;
  pr_count: number;
  created_at: string;
  updated_at: string;
}

export interface DBStravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  profile_medium: string;
  profile: string;
  created_at: string;
  updated_at: string;
  last_sync?: string;
}

/**
 * Save or update athlete information
 */
export function upsertAthlete(athlete: StravaAthlete): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO strava_athlete (
      id, username, firstname, lastname, city, state, country,
      sex, premium, profile_medium, profile, last_sync
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      firstname = excluded.firstname,
      lastname = excluded.lastname,
      city = excluded.city,
      state = excluded.state,
      country = excluded.country,
      sex = excluded.sex,
      premium = excluded.premium,
      profile_medium = excluded.profile_medium,
      profile = excluded.profile,
      last_sync = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    athlete.id,
    athlete.username,
    athlete.firstname,
    athlete.lastname,
    athlete.city,
    athlete.state,
    athlete.country,
    athlete.sex,
    athlete.premium ? 1 : 0,
    athlete.profile_medium,
    athlete.profile
  );
}

/**
 * Get athlete information
 */
export function getAthlete(athleteId: number): DBStravaAthlete | undefined {
  return queryOne<DBStravaAthlete>(
    "SELECT * FROM strava_athlete WHERE id = ?",
    [athleteId]
  );
}

/**
 * Save or update activity
 */
export function upsertActivity(activity: StravaActivity, athleteId: number): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO strava_activities (
      id, athlete_id, name, distance, moving_time, elapsed_time,
      total_elevation_gain, type, sport_type, start_date, start_date_local,
      timezone, achievement_count, kudos_count, trainer, commute,
      average_speed, max_speed, average_heartrate, max_heartrate,
      elev_high, elev_low, pr_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      distance = excluded.distance,
      moving_time = excluded.moving_time,
      elapsed_time = excluded.elapsed_time,
      total_elevation_gain = excluded.total_elevation_gain,
      type = excluded.type,
      sport_type = excluded.sport_type,
      achievement_count = excluded.achievement_count,
      kudos_count = excluded.kudos_count,
      average_speed = excluded.average_speed,
      max_speed = excluded.max_speed,
      average_heartrate = excluded.average_heartrate,
      max_heartrate = excluded.max_heartrate,
      elev_high = excluded.elev_high,
      elev_low = excluded.elev_low,
      pr_count = excluded.pr_count,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    activity.id,
    athleteId,
    activity.name,
    activity.distance,
    activity.moving_time,
    activity.elapsed_time,
    activity.total_elevation_gain,
    activity.type,
    activity.sport_type,
    activity.start_date,
    activity.start_date_local,
    activity.timezone,
    activity.achievement_count,
    activity.kudos_count,
    activity.trainer ? 1 : 0,
    activity.commute ? 1 : 0,
    activity.average_speed,
    activity.max_speed,
    activity.average_heartrate,
    activity.max_heartrate,
    activity.elev_high,
    activity.elev_low,
    activity.pr_count
  );
}

/**
 * Save multiple activities
 */
export function upsertActivities(
  activities: StravaActivity[],
  athleteId: number
): void {
  const db = getDatabase();

  const insert = db.transaction(() => {
    for (const activity of activities) {
      upsertActivity(activity, athleteId);
    }
  });

  insert();
}

/**
 * Get activity by ID
 */
export function getActivity(activityId: number): DBStravaActivity | undefined {
  return queryOne<DBStravaActivity>(
    "SELECT * FROM strava_activities WHERE id = ?",
    [activityId]
  );
}

/**
 * Get all activities for an athlete
 */
export function getActivities(
  athleteId: number,
  limit = 50
): DBStravaActivity[] {
  return query<DBStravaActivity>(
    `SELECT * FROM strava_activities
     WHERE athlete_id = ?
     ORDER BY start_date DESC
     LIMIT ?`,
    [athleteId, limit]
  );
}

/**
 * Get activities by date range
 */
export function getActivitiesByDateRange(
  athleteId: number,
  startDate: string,
  endDate: string
): DBStravaActivity[] {
  return query<DBStravaActivity>(
    `SELECT * FROM strava_activities
     WHERE athlete_id = ?
     AND start_date >= ?
     AND start_date <= ?
     ORDER BY start_date DESC`,
    [athleteId, startDate, endDate]
  );
}

/**
 * Get activities by type (Run, Ride, Swim, etc.)
 */
export function getActivitiesByType(
  athleteId: number,
  type: string,
  limit = 50
): DBStravaActivity[] {
  return query<DBStravaActivity>(
    `SELECT * FROM strava_activities
     WHERE athlete_id = ?
     AND (type = ? OR sport_type = ?)
     ORDER BY start_date DESC
     LIMIT ?`,
    [athleteId, type, type, limit]
  );
}

/**
 * Get recent activities (last 30 days)
 */
export function getRecentActivities(athleteId: number): DBStravaActivity[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return query<DBStravaActivity>(
    `SELECT * FROM strava_activities
     WHERE athlete_id = ?
     AND start_date >= ?
     ORDER BY start_date DESC`,
    [athleteId, thirtyDaysAgo.toISOString()]
  );
}

/**
 * Get activity statistics for an athlete
 */
export function getActivityStats(athleteId: number) {
  const stats = queryOne<{
    total_activities: number;
    total_distance: number;
    total_moving_time: number;
    total_elevation_gain: number;
  }>(
    `SELECT
      COUNT(*) as total_activities,
      SUM(distance) as total_distance,
      SUM(moving_time) as total_moving_time,
      SUM(total_elevation_gain) as total_elevation_gain
     FROM strava_activities
     WHERE athlete_id = ?`,
    [athleteId]
  );

  return stats || {
    total_activities: 0,
    total_distance: 0,
    total_moving_time: 0,
    total_elevation_gain: 0,
  };
}

/**
 * Get year-to-date statistics
 */
export function getYTDStats(athleteId: number) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const stats = queryOne<{
    total_activities: number;
    total_distance: number;
    total_moving_time: number;
    total_elevation_gain: number;
  }>(
    `SELECT
      COUNT(*) as total_activities,
      SUM(distance) as total_distance,
      SUM(moving_time) as total_moving_time,
      SUM(total_elevation_gain) as total_elevation_gain
     FROM strava_activities
     WHERE athlete_id = ? AND start_date >= ?`,
    [athleteId, yearStart]
  );

  return stats || {
    total_activities: 0,
    total_distance: 0,
    total_moving_time: 0,
    total_elevation_gain: 0,
  };
}

/**
 * Delete a single activity by ID
 */
export function deleteActivity(activityId: number): boolean {
  const result = execute(
    "DELETE FROM strava_activities WHERE id = ?",
    [activityId]
  );
  return result.changes > 0;
}

/**
 * Delete all activities for an athlete
 */
export function deleteActivities(athleteId: number): boolean {
  const result = execute(
    "DELETE FROM strava_activities WHERE athlete_id = ?",
    [athleteId]
  );
  return result.changes > 0;
}

/**
 * Get the last sync time for an athlete
 */
export function getLastSyncTime(athleteId: number): Date | null {
  const athlete = getAthlete(athleteId);
  return athlete?.last_sync ? new Date(athlete.last_sync) : null;
}

const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export interface StravaActivity {
  id: number;
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
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  average_speed: number;
  max_speed: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high?: number;
  elev_low?: number;
  pr_count: number;
  total_photo_count: number;
  workout_type?: number;
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id: number;
  profile_medium: string;
  profile: string;
  friend: null | string;
  follower: null | string;
}

export interface StravaStats {
  biggest_ride_distance: number;
  biggest_climb_elevation_gain: number;
  recent_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
    achievement_count: number;
  };
  recent_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
    achievement_count: number;
  };
  recent_swim_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
    achievement_count: number;
  };
  ytd_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_swim_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_swim_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
}

/**
 * Make an authenticated request to the Strava API
 */
async function stravaFetch<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  if (!accessToken) {
    throw new Error("No Strava access token provided.");
  }

  const url = `${STRAVA_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get the authenticated athlete's profile
 */
export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>("/athlete", accessToken);
}

/**
 * Get the authenticated athlete's statistics
 */
export async function getAthleteStats(
  athleteId: number,
  accessToken: string
): Promise<StravaStats> {
  return stravaFetch<StravaStats>(`/athletes/${athleteId}/stats`, accessToken);
}

/**
 * Get the authenticated athlete's activities
 * @param accessToken - Strava access token
 * @param page - Page number (default 1)
 * @param perPage - Number of activities per page (default 30, max 200)
 * @param before - Unix timestamp to filter activities before
 * @param after - Unix timestamp to filter activities after
 */
export async function getActivities(
  accessToken: string,
  page = 1,
  perPage = 30,
  before?: number,
  after?: number
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (before) params.append("before", before.toString());
  if (after) params.append("after", after.toString());

  return stravaFetch<StravaActivity[]>(`/athlete/activities?${params}`, accessToken);
}

/**
 * Get a specific activity by ID
 */
export async function getActivity(
  activityId: number,
  accessToken: string
): Promise<StravaActivity> {
  return stravaFetch<StravaActivity>(`/activities/${activityId}`, accessToken);
}

/**
 * Get recent activities (last 30 days)
 */
export async function getRecentActivities(accessToken: string): Promise<StravaActivity[]> {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  return getActivities(accessToken, 1, 200, undefined, thirtyDaysAgo);
}

// Re-export utility functions from the utils module
// This allows existing code to continue importing from this file
export { formatDistance, formatDuration, formatPace } from "@/lib/utils/strava";

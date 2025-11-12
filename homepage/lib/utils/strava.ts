/**
 * Strava utility functions for formatting and conversion
 * These are safe to use in both client and server components
 */

/**
 * Format distance from meters to kilometers/miles
 */
export function formatDistance(meters: number, unit: "km" | "mi" = "km"): string {
  if (unit === "mi") {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

/**
 * Format duration from seconds to human readable
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format pace from meters per second
 */
export function formatPace(
  metersPerSecond: number,
  unit: "km" | "mi" = "km"
): string {
  if (unit === "mi") {
    const milesPerHour = metersPerSecond * 2.23694;
    return `${milesPerHour.toFixed(2)} mph`;
  }
  const kmPerHour = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(2)} km/h`;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string (YYYY-MM-DD or YYYY/MM/DD) to a localized date string without timezone issues.
 * This prevents the common bug where dates shift by one day due to UTC conversion.
 *
 * @param dateString - Date in YYYY-MM-DD or YYYY/MM/DD format, or timestamp (YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS)
 * @returns Formatted date string in the user's locale
 *
 * @example
 * formatDateSafe("2025-01-15") // "1/15/2025" (in en-US locale)
 * formatDateSafe("2025/01/15") // "1/15/2025" (in en-US locale)
 * formatDateSafe("2025-01-15 18:12:55") // "1/15/2025" (in en-US locale)
 * formatDateSafe("2025-01-15T18:12:55") // "1/15/2025" (in en-US locale)
 */
export function formatDateSafe(dateString: string): string {
  if (!dateString) return "";

  // Handle ISO datetime strings (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD HH:MM:SS)
  // Split on both "T" and space " " to handle SQLite timestamps
  const datePart = dateString.split("T")[0].split(" ")[0];

  // Parse date components to avoid timezone issues
  // Handle both YYYY-MM-DD and YYYY/MM/DD formats
  const separator = datePart.includes("-") ? "-" : "/";
  const [year, month, day] = datePart.split(separator).map(Number);

  // Create date in local timezone (not UTC)
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString();
}

/**
 * Format a date string (YYYY-MM-DD or YYYY/MM/DD) to a long localized date string with weekday without timezone issues.
 * This prevents the common bug where dates shift by one day due to UTC conversion.
 *
 * @param dateString - Date in YYYY-MM-DD or YYYY/MM/DD format, or timestamp (YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS)
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted date string with weekday, month, day, and year
 *
 * @example
 * formatDateLongSafe("2025-01-15") // "Wednesday, January 15, 2025" (in en-US locale)
 * formatDateLongSafe("2025/01/15") // "Wednesday, January 15, 2025" (in en-US locale)
 * formatDateLongSafe("2025-01-15 18:12:55") // "Wednesday, January 15, 2025" (in en-US locale)
 * formatDateLongSafe("2025-01-15T18:12:55") // "Wednesday, January 15, 2025" (in en-US locale)
 */
export function formatDateLongSafe(dateString: string, locale: string = "en-US"): string {
  if (!dateString) return "";

  // Handle ISO datetime strings (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD HH:MM:SS)
  // Split on both "T" and space " " to handle SQLite timestamps
  const datePart = dateString.split("T")[0].split(" ")[0];

  // Parse date components to avoid timezone issues
  // Handle both YYYY-MM-DD and YYYY/MM/DD formats
  const separator = datePart.includes("-") ? "-" : "/";
  const [year, month, day] = datePart.split(separator).map(Number);

  // Create date in local timezone (not UTC)
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

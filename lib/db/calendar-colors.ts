import { query, execute } from "./index";
import { CalendarColors } from "@/lib/constants/calendar";

export interface CalendarColor {
  id?: number;
  userId: string;
  category: string;
  bg_color: string;
  text_color: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarColorUpdate {
  bg_color: string;
  text_color: string;
}

/**
 * Helper to flatten the nested CalendarColors constant into an array of CalendarColor objects
 */
function getDefaultCalendarColors(): Omit<CalendarColor, "userId" | "id" | "created_at" | "updated_at">[] {
  const defaults: Omit<CalendarColor, "userId" | "id" | "created_at" | "updated_at">[] = [];

   
  const processObject = (obj: any, prefix = "") => {
    for (const key in obj) {
      const value = obj[key];
      const currentKey = prefix ? `${prefix}.${key}` : key;

      if (value.bg && value.text) {
        defaults.push({
          category: currentKey,
          bg_color: value.bg,
          text_color: value.text,
        });
      } else if (typeof value === "object") {
        processObject(value, currentKey);
      }
    }
  };

  processObject(CalendarColors);
  return defaults;
}

/**
 * Get all calendar colors for a user
 * Merges user's custom colors with system defaults (for any missing categories)
 */
export function getCalendarColors(userId: string): CalendarColor[] {
  // Try to get user's custom colors
  const userColors = query<CalendarColor>(
    `SELECT * FROM calendar_colors WHERE userId = ? ORDER BY category ASC`,
    [userId]
  );

  // Get all system defaults
  const defaults = getDefaultCalendarColors();

  // If user has no custom colors, return all defaults
  if (userColors.length === 0) {
    return defaults.map(d => ({
      ...d,
      userId,
      id: 0, // Placeholder ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  // Merge: use user's colors where they exist, defaults for missing categories
  const userColorMap = new Map(userColors.map(c => [c.category, c]));
  const mergedColors: CalendarColor[] = [];

  for (const defaultColor of defaults) {
    const userColor = userColorMap.get(defaultColor.category);
    if (userColor) {
      mergedColors.push(userColor);
    } else {
      // Add missing default color
      mergedColors.push({
        ...defaultColor,
        userId,
        id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  return mergedColors;
}

/**
 * Get calendar colors as a structured object (matching CalendarColors constant structure)
 */
 
export function getCalendarColorsObject(userId: string): any {
  const colors = getCalendarColors(userId);
   
  const colorObj: any = {};

  colors.forEach((color) => {
    const parts = color.category.split(".");

    if (parts.length === 1) {
      // Simple category like 'activity', 'media', etc.
      colorObj[parts[0]] = {
        bg: color.bg_color,
        text: color.text_color,
      };
    } else if (parts.length === 2) {
      // Nested category like 'workout.upcoming', 'task.overdue', etc.
      if (!colorObj[parts[0]]) {
        colorObj[parts[0]] = {};
      }
      colorObj[parts[0]][parts[1]] = {
        bg: color.bg_color,
        text: color.text_color,
      };
    }
  });

  return colorObj;
}

/**
 * Update or insert a calendar color for a user
 */
export function upsertCalendarColor(
  userId: string,
  category: string,
  colors: CalendarColorUpdate
): void {
  execute(
    `INSERT INTO calendar_colors (userId, category, bg_color, text_color)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(userId, category)
     DO UPDATE SET
       bg_color = excluded.bg_color,
       text_color = excluded.text_color,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, category, colors.bg_color, colors.text_color]
  );
}

/**
 * Reset a specific category to system default for a user
 */
export function resetCalendarColorToDefault(
  userId: string,
  category: string
): void {
  execute(
    `DELETE FROM calendar_colors WHERE userId = ? AND category = ?`,
    [userId, category]
  );
}

/**
 * Copy system defaults to a user's calendar colors
 */
export function populateUserColorsFromDefaults(userId: string): void {
  // First, delete any existing user colors
  execute(`DELETE FROM calendar_colors WHERE userId = ?`, [userId]);

  // Get all system defaults from constants
  const systemDefaults = getDefaultCalendarColors();

  // Copy system defaults to user
  for (const color of systemDefaults) {
    execute(
      `INSERT INTO calendar_colors (userId, category, bg_color, text_color)
       VALUES (?, ?, ?, ?)`,
      [userId, color.category, color.bg_color, color.text_color]
    );
  }
}

/**
 * Reset all calendar colors to system defaults for a user
 */
export function resetAllCalendarColorsToDefaults(userId: string): void {
  populateUserColorsFromDefaults(userId);
}

/**
 * Check if user has any calendar colors set, if not populate from defaults
 */
export function ensureUserColorsExist(userId: string): void {
  const userColors = query<CalendarColor>(
    `SELECT id FROM calendar_colors WHERE userId = ? LIMIT 1`,
    [userId]
  );

  if (userColors.length === 0) {
    populateUserColorsFromDefaults(userId);
  }
}

/**
 * Get a single calendar color by category
 */
export function getCalendarColorByCategory(
  userId: string,
  category: string
): CalendarColor | null {
  // Try user's custom color first
  const userColor = query<CalendarColor>(
    `SELECT * FROM calendar_colors WHERE userId = ? AND category = ?`,
    [userId, category]
  )[0];

  if (userColor) {
    return userColor;
  }

  // Fall back to system default from constants
  const defaults = getDefaultCalendarColors();
  const defaultColor = defaults.find(d => d.category === category);
  
  if (defaultColor) {
    return {
      ...defaultColor,
      userId,
      id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return null;
}

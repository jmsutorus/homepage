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
async function getDefaultCalendarColors(): Promise<Omit<CalendarColor, "userId" | "id" | "created_at" | "updated_at">[]> {
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
export async function getCalendarColors(userId: string): Promise<CalendarColor[]> {
  // Try to get user's custom colors
  const userColors = await query<CalendarColor>(
    `SELECT * FROM calendar_colors WHERE userId = ? ORDER BY category ASC`,
    [userId]
  );

  // Get all system defaults
  const defaults = await getDefaultCalendarColors();

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
 
export async function getCalendarColorsObject(userId: string): Promise<any> {
  const colors = await getCalendarColors(userId);
   
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
export async function upsertCalendarColor(
  userId: string,
  category: string,
  colors: CalendarColorUpdate
): Promise<void> {
  await execute(
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
export async function resetCalendarColorToDefault(
  userId: string,
  category: string
): Promise<void> {
  await execute(
    `DELETE FROM calendar_colors WHERE userId = ? AND category = ?`,
    [userId, category]
  );
}

/**
 * Copy system defaults to a user's calendar colors
 */
export async function populateUserColorsFromDefaults(userId: string): Promise<void> {
  // First, delete any existing user colors
  await execute(`DELETE FROM calendar_colors WHERE userId = ?`, [userId]);

  // Get all system defaults from constants
  const systemDefaults = await getDefaultCalendarColors();

  // Copy system defaults to user
  for (const color of systemDefaults) {
    await execute(
      `INSERT INTO calendar_colors (userId, category, bg_color, text_color)
       VALUES (?, ?, ?, ?)`,
      [userId, color.category, color.bg_color, color.text_color]
    );
  }
}

/**
 * Reset all calendar colors to system defaults for a user
 */
export async function resetAllCalendarColorsToDefaults(userId: string): Promise<void> {
  await populateUserColorsFromDefaults(userId);
}

/**
 * Check if user has any calendar colors set, if not populate from defaults
 */
export async function ensureUserColorsExist(userId: string): Promise<void> {
  const userColors = await query<CalendarColor>(
    `SELECT id FROM calendar_colors WHERE userId = ? LIMIT 1`,
    [userId]
  );

  if (userColors.length === 0) {
    await populateUserColorsFromDefaults(userId);
  }
}

/**
 * Get a single calendar color by category
 */
export async function getCalendarColorByCategory(
  userId: string,
  category: string
): Promise<CalendarColor | null> {
  // Try user's custom color first
  const userColors = await query<CalendarColor>(
    `SELECT * FROM calendar_colors WHERE userId = ? AND category = ?`,
    [userId, category]
  );

  const userColor = userColors[0];

  if (userColor) {
    return userColor;
  }

  // Fall back to system default from constants
  const defaults = await getDefaultCalendarColors();
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

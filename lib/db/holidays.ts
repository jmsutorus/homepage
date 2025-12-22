import { execute, query, queryOne } from "./index";

// ==================== Types ====================

export interface Holiday {
  id: number;
  name: string;
  month: number;
  day: number;
  year: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHolidayInput {
  name: string;
  month: number;
  day: number;
  year?: number | null;
}

export interface UpdateHolidayInput {
  name?: string;
  month?: number;
  day?: number;
  year?: number | null;
}

// ==================== Variable Holiday Date Computation ====================

/**
 * Rules for computing variable holiday dates
 * Format: { holidayName: (year) => { month, day } }
 */
const VARIABLE_HOLIDAY_RULES: Record<string, (year: number) => { month: number; day: number }> = {
  // MLK Day: 3rd Monday of January
  "MLK Day": (year) => getNthWeekdayOfMonth(year, 1, 1, 3), // month=1 (Jan), weekday=1 (Mon), nth=3
  
  // Presidents' Day: 3rd Monday of February
  "Presidents' Day": (year) => getNthWeekdayOfMonth(year, 2, 1, 3),
  
  // Memorial Day: Last Monday of May
  "Memorial Day": (year) => getLastWeekdayOfMonth(year, 5, 1),
  
  // Labor Day: 1st Monday of September
  "Labor Day": (year) => getNthWeekdayOfMonth(year, 9, 1, 1),
  
  // Columbus Day: 2nd Monday of October
  "Columbus Day": (year) => getNthWeekdayOfMonth(year, 10, 1, 2),
  
  // Thanksgiving: 4th Thursday of November
  "Thanksgiving": (year) => getNthWeekdayOfMonth(year, 11, 4, 4), // weekday=4 (Thu), nth=4
};

/**
 * Get the nth occurrence of a weekday in a month
 * @param year - The year
 * @param month - Month (1-12)
 * @param weekday - Day of week (0=Sun, 1=Mon, ..., 6=Sat)
 * @param nth - Which occurrence (1=first, 2=second, etc.)
 */
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number
): { month: number; day: number } {
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstOfMonth.getDay();
  
  // Calculate days until the first occurrence of the weekday
  let daysUntilWeekday = weekday - firstDayOfWeek;
  if (daysUntilWeekday < 0) {
    daysUntilWeekday += 7;
  }
  
  // Calculate the day of the nth occurrence
  const day = 1 + daysUntilWeekday + (nth - 1) * 7;
  
  return { month, day };
}

/**
 * Get the last occurrence of a weekday in a month
 * @param year - The year
 * @param month - Month (1-12)
 * @param weekday - Day of week (0=Sun, 1=Mon, ..., 6=Sat)
 */
function getLastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number
): { month: number; day: number } {
  // Get the last day of the month
  const lastOfMonth = new Date(year, month, 0);
  const lastDay = lastOfMonth.getDate();
  const lastDayOfWeek = lastOfMonth.getDay();
  
  // Calculate days back to the last occurrence of the weekday
  let daysBack = lastDayOfWeek - weekday;
  if (daysBack < 0) {
    daysBack += 7;
  }
  
  const day = lastDay - daysBack;
  
  return { month, day };
}

/**
 * Compute the actual date for a holiday in a given year
 * Uses rules for variable holidays, falls back to stored date for fixed holidays
 */
export function computeHolidayDate(
  holiday: Holiday,
  year: number
): { month: number; day: number } {
  const rule = VARIABLE_HOLIDAY_RULES[holiday.name];
  if (rule) {
    return rule(year);
  }
  // Fixed holiday - use stored date
  return { month: holiday.month, day: holiday.day };
}

/**
 * Get holidays for a month with computed dates for variable holidays
 */
export async function getHolidaysForMonthComputed(
  month: number,
  year: number
): Promise<Array<Holiday & { computedDay: number }>> {
  // Get all holidays (we need to check all because variable holidays may land in different months)
  const allHolidays = await query<Holiday>(
    `SELECT * FROM holidays WHERE year IS NULL OR year = ?`,
    [year]
  );
  
  // Compute dates and filter to the requested month
  const holidaysInMonth: Array<Holiday & { computedDay: number }> = [];
  
  for (const holiday of allHolidays) {
    const computed = computeHolidayDate(holiday, year);
    if (computed.month === month) {
      holidaysInMonth.push({
        ...holiday,
        computedDay: computed.day,
      });
    }
  }
  
  return holidaysInMonth.sort((a, b) => a.computedDay - b.computedDay);
}

// ==================== CRUD Operations ====================

/**
 * Get all holidays
 */
export async function getAllHolidays(): Promise<Holiday[]> {
  return await query<Holiday>(
    `SELECT * FROM holidays ORDER BY month, day, year`
  );
}

/**
 * Get holidays for a specific month/year
 * Returns holidays that match the month AND either:
 * - year is NULL (recurring holiday)
 * - year matches the given year (one-time holiday)
 */
export async function getHolidaysForMonth(
  month: number,
  year: number
): Promise<Holiday[]> {
  return await query<Holiday>(
    `SELECT * FROM holidays 
     WHERE month = ? AND (year IS NULL OR year = ?)
     ORDER BY day`,
    [month, year]
  );
}

/**
 * Get holiday by ID
 */
export async function getHoliday(id: number): Promise<Holiday | undefined> {
  return await queryOne<Holiday>(
    `SELECT * FROM holidays WHERE id = ?`,
    [id]
  );
}

/**
 * Create a new holiday
 */
export async function createHoliday(
  input: CreateHolidayInput
): Promise<Holiday> {
  const result = await execute(
    `INSERT INTO holidays (name, month, day, year)
     VALUES (?, ?, ?, ?)`,
    [input.name, input.month, input.day, input.year ?? null]
  );

  const holiday = await getHoliday(Number(result.lastInsertRowid));
  if (!holiday) {
    throw new Error("Failed to create holiday");
  }
  return holiday;
}

/**
 * Update a holiday
 */
export async function updateHoliday(
  id: number,
  updates: UpdateHolidayInput
): Promise<boolean> {
  const setClauses: string[] = [];
  const args: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    setClauses.push("name = ?");
    args.push(updates.name);
  }
  if (updates.month !== undefined) {
    setClauses.push("month = ?");
    args.push(updates.month);
  }
  if (updates.day !== undefined) {
    setClauses.push("day = ?");
    args.push(updates.day);
  }
  if (updates.year !== undefined) {
    setClauses.push("year = ?");
    args.push(updates.year);
  }

  if (setClauses.length === 0) {
    return false;
  }

  args.push(id);

  const result = await execute(
    `UPDATE holidays SET ${setClauses.join(", ")} WHERE id = ?`,
    args
  );

  return result.changes > 0;
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(id: number): Promise<boolean> {
  const result = await execute(
    `DELETE FROM holidays WHERE id = ?`,
    [id]
  );
  return result.changes > 0;
}

/**
 * Seed default USA holidays
 * These are major federal holidays with typical dates
 */
export async function seedDefaultHolidays(): Promise<number> {
  const defaultHolidays: CreateHolidayInput[] = [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "MLK Day", month: 1, day: 20 },
    { name: "Presidents' Day", month: 2, day: 17 },
    { name: "Memorial Day", month: 5, day: 27 },
    { name: "Independence Day", month: 7, day: 4 },
    { name: "Labor Day", month: 9, day: 2 },
    { name: "Columbus Day", month: 10, day: 14 },
    { name: "Veterans Day", month: 11, day: 11 },
    { name: "Thanksgiving", month: 11, day: 28 },
    { name: "Christmas", month: 12, day: 25 },
  ];

  let created = 0;
  for (const holiday of defaultHolidays) {
    try {
      // Use INSERT OR IGNORE to skip duplicates
      const result = await execute(
        `INSERT OR IGNORE INTO holidays (name, month, day, year)
         VALUES (?, ?, ?, NULL)`,
        [holiday.name, holiday.month, holiday.day]
      );
      if (result.changes > 0) {
        created++;
      }
    } catch {
      // Ignore duplicate errors
      console.log(`Holiday ${holiday.name} already exists, skipping`);
    }
  }

  return created;
}


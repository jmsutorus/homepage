import { execute, query, queryOne } from "./index";
import { checkAchievement } from "../achievements";

export interface MoodEntry {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  rating: number; // 1-5
  note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new mood entry
 */
export async function createMoodEntry(
  date: string,
  rating: number,
  note: string | undefined,
  userId: string
): MoodEntry {
  execute(
    `INSERT INTO mood_entries (userId, date, rating, note)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(userId, date) DO UPDATE SET
       rating = excluded.rating,
       note = excluded.note,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, date, rating, note || null]
  );

  const entry = getMoodEntry(date, userId);
  if (!entry) {
    throw new Error("Failed to create mood entry");
  }

  // Check for achievements in the background
  checkAchievement(userId, 'mood').catch(console.error);

  return entry;
}

/**
 * Get mood entry for a specific date
 */
export async function getMoodEntry(date: string, userId: string): Promise<MoodEntry | undefined> {
  return await queryOne<MoodEntry>(
    "SELECT * FROM mood_entries WHERE date = ? AND userId = ?",
    [date, userId]
  );
}

/**
 * Get mood entries in a date range
 */
export async function getMoodEntriesInRange(
  startDate: string,
  endDate: string,
  userId: string
): MoodEntry[] {
  return await query<MoodEntry>(
    "SELECT * FROM mood_entries WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date ASC",
    [userId, startDate, endDate]
  );
}

/**
 * Get all mood entries
 */
export async function getAllMoodEntries(userId: string): Promise<MoodEntry[]> {
  return await query<MoodEntry>(
    "SELECT * FROM mood_entries WHERE userId = ? ORDER BY date DESC",
    [userId]
  );
}

/**
 * Get mood entries for current year
 */
export async function getMoodEntriesForYear(year: number, userId: string): Promise<MoodEntry[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  return getMoodEntriesInRange(startDate, endDate, userId);
}

/**
 * Update mood entry
 */
export async function updateMoodEntry(
  date: string,
  rating: number,
  note: string | undefined,
  userId: string
): boolean {
  const result = execute(
    "UPDATE mood_entries SET rating = ?, note = ? WHERE date = ? AND userId = ?",
    [rating, note || null, date, userId]
  );

  return result.changes > 0;
}

/**
 * Delete mood entry
 */
export async function deleteMoodEntry(date: string, userId: string): Promise<boolean> {
  const result = execute("DELETE FROM mood_entries WHERE date = ? AND userId = ?", [date, userId]);
  return result.changes > 0;
}

/**
 * Get mood statistics
 */
export async function getMoodStatistics(userId: string): {
  total: number;
  average: number;
  byRating: Record<number, number>;
} {
  const entries = getAllMoodEntries(userId);
  const total = entries.length;
  const sum = entries.reduce((acc, entry) => acc + entry.rating, 0);
  const average = total > 0 ? sum / total : 0;

  const byRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entries.forEach((entry) => {
    byRating[entry.rating] = (byRating[entry.rating] || 0) + 1;
  });

  return { total, average, byRating };
}

import { query, queryOne, execute } from "@/lib/db";

export interface DuolingoCompletion {
  id: number;
  userId: string;
  date: string;
  completed_at: string;
}

/**
 * Check if user has completed their Duolingo lesson for a specific date
 */
export async function getDuolingoCompletion(
  userId: string,
  date: string
): Promise<DuolingoCompletion | null> {
  try {
    const completion = await queryOne<DuolingoCompletion>(
      "SELECT * FROM duolingo_completions WHERE userId = ? AND date = ?",
      [userId, date]
    );
    return completion ?? null;
  } catch (error) {
    console.error("Error getting Duolingo completion:", error);
    return null;
  }
}

/**
 * Get Duolingo completions for a date range
 */
export async function getDuolingoCompletionsForRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DuolingoCompletion[]> {
  try {
    return await query<DuolingoCompletion>(
      "SELECT * FROM duolingo_completions WHERE userId = ? AND date >= ? AND date <= ? ORDER BY date DESC",
      [userId, startDate, endDate]
    );
  } catch (error) {
    console.error("Error getting Duolingo completions range:", error);
    return [];
  }
}

/**
 * Toggle Duolingo lesson completion for a specific date
 * Returns true if now completed, false if completion was removed
 */
export async function toggleDuolingoCompletion(
  userId: string,
  date: string
): Promise<boolean> {
  try {
    // Check if already completed
    const existing = await queryOne<DuolingoCompletion>(
      "SELECT * FROM duolingo_completions WHERE userId = ? AND date = ?",
      [userId, date]
    );

    if (existing) {
      // Remove completion
      await execute("DELETE FROM duolingo_completions WHERE id = ?", [
        existing.id,
      ]);
      return false; // No longer completed
    } else {
      // Add completion
      await execute(
        "INSERT INTO duolingo_completions (userId, date) VALUES (?, ?)",
        [userId, date]
      );
      return true; // Now completed
    }
  } catch (error) {
    console.error("Error toggling Duolingo completion:", error);
    throw error;
  }
}

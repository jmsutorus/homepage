import { execute, query, queryOne } from "./index";
import { checkAchievement } from "../achievements";

// ============================================================================
// Interfaces
// ============================================================================

export interface RelationshipDate {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  type: string;
  location: string | null;
  venue: string | null;
  rating: number | null;
  cost: number | null;
  photos: string | null; // JSON array
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntimacyEntry {
  id: number;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  duration: number | null;
  satisfaction_rating: number | null;
  initiation: string | null;
  type: string | null;
  location: string | null;
  mood_before: string | null;
  mood_after: string | null;
  positions: string | null; // JSON array of position names
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RelationshipMilestone {
  id: number;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  description: string | null;
  photos: string | null; // JSON array
  created_at: string;
  updated_at: string;
}

export interface RelationshipPosition {
  id: number;
  userId: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface RelationshipStats {
  totalDates: number;
  totalIntimacy: number;
  totalMilestones: number;
  avgDateRating: number;
  avgSatisfaction: number;
  dateFrequency: { month: string; count: number }[];
  intimacyFrequency: { month: string; count: number }[];
}

// ============================================================================
// Relationship Dates Functions
// ============================================================================

/**
 * Create a new relationship date entry
 */
export async function createRelationshipDate(
  date: string,
  time: string | undefined,
  type: string,
  location: string | undefined,
  venue: string | undefined,
  rating: number | undefined,
  cost: number | undefined,
  photos: string | undefined,
  notes: string | undefined,
  userId: string
): Promise<RelationshipDate> {
  const result = await execute(
    `INSERT INTO relationship_dates (userId, date, time, type, location, venue, rating, cost, photos, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, date, time || null, type, location || null, venue || null, rating || null, cost || null, photos || null, notes || null]
  );

  const createdDate = await queryOne<RelationshipDate>(
    "SELECT * FROM relationship_dates WHERE id = ?",
    [result.lastInsertRowid]
  );

  if (!createdDate) {
    throw new Error("Failed to create relationship date");
  }

  // Check for achievements in the background
  checkAchievement(userId, 'relationship').catch(console.error);

  return createdDate;
}

/**
 * Get all relationship dates for a user
 */
export async function getRelationshipDates(userId: string): Promise<RelationshipDate[]> {
  return await query<RelationshipDate>(
    "SELECT * FROM relationship_dates WHERE userId = ? ORDER BY date DESC, time DESC",
    [userId]
  );
}

/**
 * Get relationship dates in a date range
 */
export async function getRelationshipDatesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<RelationshipDate[]> {
  return await query<RelationshipDate>(
    "SELECT * FROM relationship_dates WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date DESC, time DESC",
    [userId, startDate, endDate]
  );
}

/**
 * Get a specific relationship date by ID
 */
export async function getRelationshipDateById(id: number, userId: string): Promise<RelationshipDate | undefined> {
  return await queryOne<RelationshipDate>(
    "SELECT * FROM relationship_dates WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update a relationship date
 */
export async function updateRelationshipDate(
  id: number,
  date: string,
  time: string | undefined,
  type: string,
  location: string | undefined,
  venue: string | undefined,
  rating: number | undefined,
  cost: number | undefined,
  photos: string | undefined,
  notes: string | undefined,
  userId: string
): Promise<boolean> {
  const result = await execute(
    `UPDATE relationship_dates
     SET date = ?, time = ?, type = ?, location = ?, venue = ?, rating = ?, cost = ?, photos = ?, notes = ?
     WHERE id = ? AND userId = ?`,
    [date, time || null, type, location || null, venue || null, rating || null, cost || null, photos || null, notes || null, id, userId]
  );

  return result.changes > 0;
}

/**
 * Delete a relationship date
 */
export async function deleteRelationshipDate(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM relationship_dates WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
}

// ============================================================================
// Intimacy Entries Functions
// ============================================================================

/**
 * Create a new intimacy entry
 */
export async function createIntimacyEntry(
  date: string,
  time: string | undefined,
  duration: number | undefined,
  satisfaction_rating: number | undefined,
  initiation: string | undefined,
  type: string | undefined,
  location: string | undefined,
  mood_before: string | undefined,
  mood_after: string | undefined,
  positions: string[] | undefined,
  notes: string | undefined,
  userId: string
): Promise<IntimacyEntry> {
  const result = await execute(
    `INSERT INTO intimacy_entries (userId, date, time, duration, satisfaction_rating, initiation, type, location, mood_before, mood_after, positions, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      date,
      time || null,
      duration || null,
      satisfaction_rating || null,
      initiation || null,
      type || null,
      location || null,
      mood_before || null,
      mood_after || null,
      positions ? JSON.stringify(positions) : null,
      notes || null
    ]
  );

  const createdEntry = await queryOne<IntimacyEntry>(
    "SELECT * FROM intimacy_entries WHERE id = ?",
    [result.lastInsertRowid]
  );

  if (!createdEntry) {
    throw new Error("Failed to create intimacy entry");
  }

  // Check for achievements in the background
  checkAchievement(userId, 'relationship').catch(console.error);

  return createdEntry;
}

/**
 * Get all intimacy entries for a user
 */
export async function getIntimacyEntries(userId: string): Promise<IntimacyEntry[]> {
  return await query<IntimacyEntry>(
    "SELECT * FROM intimacy_entries WHERE userId = ? ORDER BY date DESC, time DESC",
    [userId]
  );
}

/**
 * Get intimacy entries in a date range
 */
export async function getIntimacyEntriesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<IntimacyEntry[]> {
  return await query<IntimacyEntry>(
    "SELECT * FROM intimacy_entries WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date DESC, time DESC",
    [userId, startDate, endDate]
  );
}

/**
 * Get a specific intimacy entry by ID
 */
export async function getIntimacyEntryById(id: number, userId: string): Promise<IntimacyEntry | undefined> {
  return await queryOne<IntimacyEntry>(
    "SELECT * FROM intimacy_entries WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update an intimacy entry
 */
export async function updateIntimacyEntry(
  id: number,
  date: string,
  time: string | undefined,
  duration: number | undefined,
  satisfaction_rating: number | undefined,
  initiation: string | undefined,
  type: string | undefined,
  location: string | undefined,
  mood_before: string | undefined,
  mood_after: string | undefined,
  positions: string[] | undefined,
  notes: string | undefined,
  userId: string
): Promise<boolean> {
  const result = await execute(
    `UPDATE intimacy_entries
     SET date = ?, time = ?, duration = ?, satisfaction_rating = ?, initiation = ?, type = ?, location = ?, mood_before = ?, mood_after = ?, positions = ?, notes = ?
     WHERE id = ? AND userId = ?`,
    [
      date,
      time || null,
      duration || null,
      satisfaction_rating || null,
      initiation || null,
      type || null,
      location || null,
      mood_before || null,
      mood_after || null,
      positions ? JSON.stringify(positions) : null,
      notes || null,
      id,
      userId
    ]
  );

  return result.changes > 0;
}

/**
 * Delete an intimacy entry
 */
export async function deleteIntimacyEntry(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM intimacy_entries WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
}

// ============================================================================
// Relationship Milestones Functions
// ============================================================================

/**
 * Create a new relationship milestone
 */
export async function createRelationshipMilestone(
  title: string,
  date: string,
  category: string,
  description: string | undefined,
  photos: string | undefined,
  userId: string
): Promise<RelationshipMilestone> {
  const result = await execute(
    `INSERT INTO relationship_milestones (userId, title, date, category, description, photos)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, date, category, description || null, photos || null]
  );

  const createdMilestone = await queryOne<RelationshipMilestone>(
    "SELECT * FROM relationship_milestones WHERE id = ?",
    [result.lastInsertRowid]
  );

  if (!createdMilestone) {
    throw new Error("Failed to create relationship milestone");
  }

  // Check for achievements in the background
  checkAchievement(userId, 'relationship').catch(console.error);

  return createdMilestone;
}

/**
 * Get all relationship milestones for a user
 */
export async function getMilestones(userId: string): Promise<RelationshipMilestone[]> {
  return await query<RelationshipMilestone>(
    "SELECT * FROM relationship_milestones WHERE userId = ? ORDER BY date DESC",
    [userId]
  );
}

/**
 * Get relationship milestones in a date range
 */
export async function getMilestonesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<RelationshipMilestone[]> {
  return await query<RelationshipMilestone>(
    "SELECT * FROM relationship_milestones WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date DESC",
    [userId, startDate, endDate]
  );
}

/**
 * Get a specific milestone by ID
 */
export async function getMilestoneById(id: number, userId: string): Promise<RelationshipMilestone | undefined> {
  return await queryOne<RelationshipMilestone>(
    "SELECT * FROM relationship_milestones WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update a relationship milestone
 */
export async function updateMilestone(
  id: number,
  title: string,
  date: string,
  category: string,
  description: string | undefined,
  photos: string | undefined,
  userId: string
): Promise<boolean> {
  const result = await execute(
    `UPDATE relationship_milestones
     SET title = ?, date = ?, category = ?, description = ?, photos = ?
     WHERE id = ? AND userId = ?`,
    [title, date, category, description || null, photos || null, id, userId]
  );

  return result.changes > 0;
}

/**
 * Delete a relationship milestone
 */
export async function deleteMilestone(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM relationship_milestones WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
}

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Get comprehensive relationship statistics
 */
export async function getRelationshipStats(userId: string): Promise<RelationshipStats> {
  const dates = await getRelationshipDates(userId);
  const intimacyEntries = await getIntimacyEntries(userId);
  const milestones = await getMilestones(userId);

  // Calculate totals
  const totalDates = dates.length;
  const totalIntimacy = intimacyEntries.length;
  const totalMilestones = milestones.length;

  // Calculate average date rating
  const datesWithRating = dates.filter(d => d.rating !== null);
  const avgDateRating = datesWithRating.length > 0
    ? datesWithRating.reduce((sum, d) => sum + (d.rating || 0), 0) / datesWithRating.length
    : 0;

  // Calculate average satisfaction rating
  const entriesWithRating = intimacyEntries.filter(e => e.satisfaction_rating !== null);
  const avgSatisfaction = entriesWithRating.length > 0
    ? entriesWithRating.reduce((sum, e) => sum + (e.satisfaction_rating || 0), 0) / entriesWithRating.length
    : 0;

  // Calculate date frequency (last 12 months)
  const dateFrequency = calculateMonthlyFrequency(dates);

  // Calculate intimacy frequency (last 12 months)
  const intimacyFrequency = calculateMonthlyFrequency(intimacyEntries);

  return {
    totalDates,
    totalIntimacy,
    totalMilestones,
    avgDateRating,
    avgSatisfaction,
    dateFrequency,
    intimacyFrequency,
  };
}

/**
 * Helper function to calculate monthly frequency for the last 12 months
 */
function calculateMonthlyFrequency(entries: { date: string }[]): { month: string; count: number }[] {
  const now = new Date();
  const months: { month: string; count: number }[] = [];

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({ month: monthKey, count: 0 });
  }

  // Count entries per month
  entries.forEach(entry => {
    const entryMonth = entry.date.substring(0, 7); // YYYY-MM
    const monthData = months.find(m => m.month === entryMonth);
    if (monthData) {
      monthData.count++;
    }
  });

  return months;
}

// ============================================================================
// Relationship Positions Functions
// ============================================================================

/**
 * Default positions that will be created for new users
 */
const DEFAULT_POSITIONS = [
  "Missionary",
  "Doggy Style",
  "Cowgirl",
  "Reverse Cowgirl",
  "Spooning",
  "Standing"
];

/**
 * Get all positions for a user (including defaults)
 */
export async function getPositions(userId: string): Promise<RelationshipPosition[]> {
  const positions = await query<{
    id: number;
    userId: string;
    name: string;
    is_default: number;
    created_at: string;
  }>(
    `SELECT * FROM relationship_positions WHERE userId = ? ORDER BY is_default DESC, name ASC`,
    [userId]
  );

  return positions.map(p => ({
    ...p,
    is_default: p.is_default === 1
  }));
}

/**
 * Create default positions for a user if they don't exist
 */
export async function ensureDefaultPositions(userId: string): Promise<void> {
  const existingPositions = await getPositions(userId);

  if (existingPositions.length === 0) {
    // Create default positions
    for (const name of DEFAULT_POSITIONS) {
      await execute(
        `INSERT INTO relationship_positions (userId, name, is_default) VALUES (?, ?, 1)`,
        [userId, name]
      );
    }
  }
}

/**
 * Create a new custom position
 */
export async function createPosition(
  name: string,
  userId: string
): Promise<RelationshipPosition> {
  const result = await execute(
    `INSERT INTO relationship_positions (userId, name, is_default) VALUES (?, ?, 0)`,
    [userId, name]
  );

  const createdPosition = await queryOne<{
    id: number;
    userId: string;
    name: string;
    is_default: number;
    created_at: string;
  }>(
    "SELECT * FROM relationship_positions WHERE id = ?",
    [result.lastInsertRowid]
  );

  if (!createdPosition) {
    throw new Error("Failed to create position");
  }

  return {
    ...createdPosition,
    is_default: createdPosition.is_default === 1
  };
}

/**
 * Delete a position (only if it's a custom position, not a default)
 */
export async function deletePosition(
  id: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    `DELETE FROM relationship_positions WHERE id = ? AND userId = ? AND is_default = 0`,
    [id, userId]
  );

  return result.changes > 0;
}

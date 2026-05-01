import { earthboundFetch } from "../api/earthbound";

// ============================================================================
// Interfaces
// ============================================================================

import {
  type RelationshipDate,
  type IntimacyEntry,
  type RelationshipMilestone,
  type RelationshipPosition,
  type RelationshipStats,
} from "@jmsutorus/earthbound-shared";

export type {
  RelationshipDate,
  IntimacyEntry,
  RelationshipMilestone,
  RelationshipPosition,
  RelationshipStats,
};

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
  const res = await earthboundFetch(`/api/relationship/dates?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ date, time, type, location, venue, rating, cost, photos, notes }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create relationship date");
  }

  return await res.json();
}

/**
 * Get all relationship dates for a user
 */
export async function getRelationshipDates(userId: string): Promise<RelationshipDate[]> {
  const res = await earthboundFetch(`/api/relationship/dates?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get relationship dates in a date range
 */
export async function getRelationshipDatesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<RelationshipDate[]> {
  const dates = await getRelationshipDates(userId);
  return dates.filter(d => d.date >= startDate && d.date <= endDate);
}

/**
 * Get a specific relationship date by ID
 */
export async function getRelationshipDateById(id: number, userId: string): Promise<RelationshipDate | undefined> {
  // Not directly exposed but can be found in list
  const dates = await getRelationshipDates(userId);
  return dates.find(d => d.id === id);
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
  const res = await earthboundFetch(`/api/relationship/dates/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ date, time, type, location, venue, rating, cost, photos, notes }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete a relationship date
 */
export async function deleteRelationshipDate(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/relationship/dates/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
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
  const res = await earthboundFetch(`/api/relationship/intimacy?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ date, time, duration, satisfaction_rating, initiation, type, location, mood_before, mood_after, positions, notes }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create intimacy entry");
  }

  return await res.json();
}

/**
 * Get all intimacy entries for a user
 */
export async function getIntimacyEntries(userId: string): Promise<IntimacyEntry[]> {
  const res = await earthboundFetch(`/api/relationship/intimacy?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get intimacy entries in a date range
 */
export async function getIntimacyEntriesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<IntimacyEntry[]> {
  const entries = await getIntimacyEntries(userId);
  return entries.filter(e => e.date >= startDate && e.date <= endDate);
}

/**
 * Get a specific intimacy entry by ID
 */
export async function getIntimacyEntryById(id: number, userId: string): Promise<IntimacyEntry | undefined> {
  const entries = await getIntimacyEntries(userId);
  return entries.find(e => e.id === id);
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
  const res = await earthboundFetch(`/api/relationship/intimacy/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ date, time, duration, satisfaction_rating, initiation, type, location, mood_before, mood_after, positions, notes }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete an intimacy entry
 */
export async function deleteIntimacyEntry(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/relationship/intimacy/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
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
  const res = await earthboundFetch(`/api/relationship/milestones?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ title, date, category, description, photos }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create relationship milestone");
  }

  return await res.json();
}

/**
 * Get all relationship milestones for a user
 */
export async function getMilestones(userId: string): Promise<RelationshipMilestone[]> {
  const res = await earthboundFetch(`/api/relationship/milestones?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get relationship milestones in a date range
 */
export async function getMilestonesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<RelationshipMilestone[]> {
  const milestones = await getMilestones(userId);
  return milestones.filter(m => m.date >= startDate && m.date <= endDate);
}

/**
 * Get a specific milestone by ID
 */
export async function getMilestoneById(id: number, userId: string): Promise<RelationshipMilestone | undefined> {
  const milestones = await getMilestones(userId);
  return milestones.find(m => m.id === id);
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
  const res = await earthboundFetch(`/api/relationship/milestones/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title, date, category, description, photos }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete a relationship milestone
 */
export async function deleteMilestone(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/relationship/milestones/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Get comprehensive relationship statistics
 */
export async function getRelationshipStats(userId: string): Promise<RelationshipStats> {
  const res = await earthboundFetch(`/api/relationship/stats?userId=${userId}`);
  if (!res.ok) {
    throw new Error("Failed to get relationship stats");
  }
  return await res.json();
}

// ============================================================================
// Relationship Positions Functions
// ============================================================================

/**
 * Get all positions for a user (including defaults)
 */
export async function getPositions(userId: string): Promise<RelationshipPosition[]> {
  const res = await earthboundFetch(`/api/relationship/positions?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Create default positions for a user if they don't exist
 */
export async function ensureDefaultPositions(_userId: string): Promise<void> {
  // Handled by API automatically or not needed if we just fetch
}

/**
 * Create a new custom position
 */
export async function createPosition(
  name: string,
  userId: string
): Promise<RelationshipPosition> {
  const res = await earthboundFetch(`/api/relationship/positions?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create position");
  }

  return await res.json();
}

/**
 * Delete a position (only if it's a custom position, not a default)
 */
export async function deletePosition(
  id: number,
  userId: string
): Promise<boolean> {
  const res = await earthboundFetch(`/api/relationship/positions/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

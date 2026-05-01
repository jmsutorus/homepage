import { earthboundFetch } from "../api/earthbound";

import {
  type MediaContent,
  type MediaContentInput,
  type PaginatedMediaResult,
  type TimelinePeriod,
  type MediaTimelineItem,
  type MediaTimelineDataPoint,
  type MediaTimelineStats,
  type MediaTimelineData,
} from "@jmsutorus/earthbound-shared";

export type {
  MediaContent,
  MediaContentInput,
  PaginatedMediaResult,
  TimelinePeriod,
  MediaTimelineItem,
  MediaTimelineDataPoint,
  MediaTimelineStats,
  MediaTimelineData,
};

/**
 * Create a new media content entry
 */
export async function createMedia(data: MediaContentInput, userId: string): Promise<MediaContent> {
  const response = await earthboundFetch(`/api/media?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create media entry: ${response.statusText}`);
  }

  return response.json() as Promise<MediaContent>;
}

/**
 * Get media entry by ID
 */
export async function getMediaById(id: number): Promise<MediaContent | undefined> {
  const response = await earthboundFetch(`/api/media/id/${id}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch media by id: ${response.statusText}`);
  }
  return response.json() as Promise<MediaContent>;
}

/**
 * Get media entry by slug for a specific user
 */
export async function getMediaBySlug(slug: string, userId: string): Promise<MediaContent | undefined> {
  const response = await earthboundFetch(`/api/media/s/${slug}?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch media by slug: ${response.statusText}`);
  }
  return response.json() as Promise<MediaContent>;
}

/**
 * Get all media entries for a specific user
 * @param userId - User ID
 * @param includeContent - Whether to include the content field (default: false for performance)
 */
export async function getAllMedia(userId: string, includeContent: boolean = false): Promise<MediaContent[]> {
  const response = await earthboundFetch(`/api/media?userId=${userId}&includeContent=${includeContent}`);
  if (!response.ok) throw new Error(`Failed to fetch all media: ${response.statusText}`);
  return response.json() as Promise<MediaContent[]>;
}



type SortOption =
  | "title-asc"
  | "title-desc"
  | "rating-desc"
  | "rating-asc"
  | "completed-desc"
  | "completed-asc"
  | "started-desc"
  | "started-asc"
  | "created-desc";

/**
 * Get paginated media entries for a specific user
 * @param userId - User ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param filters - Optional filters (type, status, search, genres, tags, sort)
 * @param includeContent - Whether to include the content field (default: false for performance)
 */
export async function getPaginatedMedia(
  userId: string,
  page: number = 1,
  pageSize: number = 25,
  filters?: {
    type?: "movie" | "tv" | "book" | "game" | "album";
    status?: "in-progress" | "completed" | "planned";
    search?: string;
    genres?: string[];
    tags?: string[];
    sortBy?: SortOption;
  },
  includeContent: boolean = false
): Promise<PaginatedMediaResult> {
  const params = new URLSearchParams({
    userId,
    page: page.toString(),
    pageSize: pageSize.toString(),
    includeContent: includeContent.toString(),
  });

  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);

  if (filters?.genres && filters.genres.length > 0) {
    params.append("genres", filters.genres.join(","));
  }
  if (filters?.tags && filters.tags.length > 0) {
    params.append("tags", filters.tags.join(","));
  }

  const response = await earthboundFetch(`/api/media/paginated?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch paginated media: ${response.statusText}`);
  }

  return response.json() as Promise<PaginatedMediaResult>;
}

/**
 * Get media entries by type for a specific user
 * @param type - Media type
 * @param userId - User ID
 * @param includeContent - Whether to include the content field (default: false for performance)
 */
export async function getMediaByType(
  type: "movie" | "tv" | "book" | "game" | "album",
  userId: string,
  includeContent: boolean = false
): Promise<MediaContent[]> {
  const response = await earthboundFetch(`/api/media?userId=${userId}&type=${type}&includeContent=${includeContent}`);
  if (!response.ok) throw new Error(`Failed to fetch media by type: ${response.statusText}`);
  return response.json() as Promise<MediaContent[]>;
}

/**
 * Get media entries by status for a specific user
 * @param status - Media status
 * @param userId - User ID
 * @param includeContent - Whether to include the content field (default: false for performance)
 */
export async function getMediaByStatus(
  status: "in-progress" | "completed" | "planned",
  userId: string,
  includeContent: boolean = false
): Promise<MediaContent[]> {
  const response = await earthboundFetch(`/api/media?userId=${userId}&status=${status}&includeContent=${includeContent}`);
  if (!response.ok) throw new Error(`Failed to fetch media by status: ${response.statusText}`);
  return response.json() as Promise<MediaContent[]>;
}

/**
 * Get media entries by type and status for a specific user
 * @param type - Media type
 * @param status - Media status
 * @param userId - User ID
 * @param includeContent - Whether to include the content field (default: false for performance)
 */
export async function getMediaByTypeAndStatus(
  type: "movie" | "tv" | "book" | "game" | "album",
  status: "in-progress" | "completed" | "planned",
  userId: string,
  includeContent: boolean = false
): Promise<MediaContent[]> {
  const response = await earthboundFetch(
    `/api/media?userId=${userId}&type=${type}&status=${status}&includeContent=${includeContent}`
  );
  if (!response.ok) throw new Error(`Failed to fetch media by type and status: ${response.statusText}`);
  return response.json() as Promise<MediaContent[]>;
}

/**
 * Update media entry with ownership verification
 */
export async function updateMedia(
  slug: string,
  userId: string,
  data: Partial<MediaContentInput>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/media/s/${slug}?userId=${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Failed to update media entry: ${response.statusText}`);
  }

  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete media entry with ownership verification
 */
export async function deleteMedia(slug: string, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/media/s/${slug}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Failed to delete media entry: ${response.statusText}`);
  }

  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Get media statistics for a specific user
 */
export async function getMediaStatistics(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: number;
}> {
  const response = await earthboundFetch(`/api/media/stats?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch media statistics: ${response.statusText}`);
  return response.json() as Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    averageRating: number;
  }>;
}

/**
 * Parse genres from JSON string to array
 */
export function parseGenres(genresJson: string | null): string[] {
  if (!genresJson) {
    return [];
  }
  try {
    return JSON.parse(genresJson) as string[];
  } catch {
    return [];
  }
}

/**
 * Parse tags from JSON string to array
 */
export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) {
    return [];
  }
  try {
    return JSON.parse(tagsJson) as string[];
  } catch {
    return [];
  }
}

/**
 * Parse creator from JSON string to array
 */
export function parseCreator(creatorJson: string | null): string[] {
  if (!creatorJson) {
    return [];
  }
  try {
    return JSON.parse(creatorJson) as string[];
  } catch {
    return [];
  }
}

/**
 * Get media with parsed genres (helper function)
 */
export function getMediaWithGenres(media: MediaContent): MediaContent & { genresParsed: string[] } {
  return {
    ...media,
    genresParsed: parseGenres(media.genres),
  };
}

/**
 * Get all unique genres across all media for a specific user
 */
export async function getAllUniqueGenres(userId: string): Promise<string[]> {
  const response = await earthboundFetch(`/api/media/genres?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch unique genres: ${response.statusText}`);
  return response.json() as Promise<string[]>;
}

/**
 * Get all unique tags across all media for a specific user
 */
export async function getAllUniqueTags(userId: string): Promise<string[]> {
  const response = await earthboundFetch(`/api/media/tags?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch unique tags: ${response.statusText}`);
  return response.json() as Promise<string[]>;
}

/**
 * Rename a genre across all media entries for a specific user
 */
export async function renameGenre(oldName: string, newName: string, userId: string): Promise<number> {
  const allMedia = await getAllMedia(userId);
  let updatedCount = 0;

  for (const media of allMedia) {
    const genres = parseGenres(media.genres);
    const index = genres.indexOf(oldName);

    if (index !== -1) {
      genres[index] = newName;
      await updateMedia(media.slug, userId, { genres });
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Rename a tag across all media entries for a specific user
 */
export async function renameTag(oldName: string, newName: string, userId: string): Promise<number> {
  const allMedia = await getAllMedia(userId);
  let updatedCount = 0;

  for (const media of allMedia) {
    const tags = parseTags(media.tags);
    const index = tags.indexOf(oldName);

    if (index !== -1) {
      tags[index] = newName;
      await updateMedia(media.slug, userId, { tags });
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Delete a genre from all media entries for a specific user
 */
export async function deleteGenre(name: string, userId: string): Promise<number> {
  const allMedia = await getAllMedia(userId);
  let updatedCount = 0;

  for (const media of allMedia) {
    const genres = parseGenres(media.genres);
    const filtered = genres.filter((g) => g !== name);

    if (filtered.length !== genres.length) {
      await updateMedia(media.slug, userId, { genres: filtered });
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Delete a tag from all media entries for a specific user
 */
export async function deleteTag(name: string, userId: string): Promise<number> {
  const allMedia = await getAllMedia(userId);
  let updatedCount = 0;

  for (const media of allMedia) {
    const tags = parseTags(media.tags);
    const filtered = tags.filter((t) => t !== name);

    if (filtered.length !== tags.length) {
      await updateMedia(media.slug, userId, { tags: filtered });
      updatedCount++;
    }
  }

  return updatedCount;
}

// ============================================
// Media Timeline Data Types and Functions
// ============================================



/**
 * Get media timeline data for charting for a specific user
 * Shows media completed over time with breakdown by type
 */
export async function getMediaTimelineData(
  userId: string,
  period: TimelinePeriod = "month",
  numPeriods: number = 12
): Promise<MediaTimelineData> {
  const response = await earthboundFetch(
    `/api/media/timeline?userId=${userId}&period=${period}&numPeriods=${numPeriods}`
  );
  if (!response.ok) throw new Error(`Failed to fetch media timeline data: ${response.statusText}`);
  return response.json() as Promise<MediaTimelineData>;
}

/**
 * Helper to get date range and label for a timeline period
 */
function getTimelinePeriodRange(
  now: Date,
  period: TimelinePeriod,
  periodsAgo: number
): { startDate: string; endDate: string; label: string } {
  const start = new Date(now);
  const end = new Date(now);

  if (period === "week") {
    // Go to the start of the current week (Sunday) then go back periodsAgo weeks
    const dayOfWeek = now.getDay();
    start.setDate(now.getDate() - dayOfWeek - periodsAgo * 7);
    end.setDate(start.getDate() + 6);
    const weekNum = getWeekNumber(start);
    return {
      startDate: formatTimelineDate(start),
      endDate: formatTimelineDate(end),
      label: `W${weekNum}`,
    };
  }

  if (period === "month") {
    start.setMonth(now.getMonth() - periodsAgo, 1);
    end.setMonth(start.getMonth() + 1, 0); // Last day of month
    const label = start.toLocaleDateString("en-US", { month: "short" });
    return {
      startDate: formatTimelineDate(start),
      endDate: formatTimelineDate(end),
      label,
    };
  }

  // year
  start.setFullYear(now.getFullYear() - periodsAgo, 0, 1);
  end.setFullYear(start.getFullYear(), 11, 31);
  const label = start.getFullYear().toString();
  return {
    startDate: formatTimelineDate(start),
    endDate: formatTimelineDate(end),
    label,
  };
}

function formatTimelineDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

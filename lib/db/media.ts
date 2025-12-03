import { execute, query, queryOne } from "./index";
import { checkAchievement } from "../achievements";

export interface MediaContent {
  id: number;
  userId: string;
  slug: string;
  title: string;
  type: "movie" | "tv" | "book" | "game";
  status: "in-progress" | "completed" | "planned";
  rating: number | null;
  started: string | null; // YYYY-MM-DD format
  completed: string | null; // YYYY-MM-DD format
  released: string | null; // YYYY-MM-DD format
  genres: string | null; // JSON array of genre strings
  poster: string | null; // Image URL
  tags: string | null; // JSON array of tag strings
  description: string | null; // Short description or plot summary
  length: string | null; // Runtime/page count as string
  creator: string | null; // JSON array of creator strings (directors/authors)
  featured: number; // SQLite boolean (0 or 1)
  published: number; // SQLite boolean (0 or 1)
  content: string; // Markdown content
  created_at: string;
  updated_at: string;
}

export interface MediaContentInput {
  slug: string;
  title: string;
  type: "movie" | "tv" | "book" | "game";
  status: "in-progress" | "completed" | "planned";
  rating?: number;
  started?: string;
  completed?: string;
  released?: string;
  genres?: string[]; // Will be converted to JSON
  poster?: string;
  tags?: string[]; // Will be converted to JSON
  description?: string;
  length?: string;
  creator?: string[]; // Will be converted to JSON
  featured?: boolean;
  published?: boolean;
  content: string;
}

/**
 * Create a new media content entry
 */
export async function createMedia(data: MediaContentInput, userId: string): Promise<MediaContent> {
  const genresJson = data.genres ? JSON.stringify(data.genres) : null;
  const tagsJson = data.tags ? JSON.stringify(data.tags) : null;
  const creatorJson = data.creator ? JSON.stringify(data.creator) : null;

  const result = await execute(
    `INSERT INTO media_content (
      slug, title, type, status, rating, started, completed, released,
      genres, poster, tags, description, length, creator, featured, published, content, userId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.type,
      data.status,
      data.rating || null,
      data.started || null,
      data.completed || null,
      data.released || null,
      genresJson,
      data.poster || null,
      tagsJson,
      data.description || null,
      data.length || null,
      creatorJson,
      data.featured ? 1 : 0,
      data.published !== false ? 1 : 0, // Default to true/1
      data.content,
      userId,
    ]
  );

  const entry = await getMediaById(Number(result.lastInsertRowid));
  if (!entry) {
    throw new Error("Failed to create media entry");
  }

  return entry;
}

/**
 * Get media entry by ID
 */
export async function getMediaById(id: number): Promise<MediaContent | undefined> {
  return await queryOne<MediaContent>(
    "SELECT * FROM media_content WHERE id = ?",
    [id]
  );
}

/**
 * Get media entry by slug for a specific user
 */
export async function getMediaBySlug(slug: string, userId: string): Promise<MediaContent | undefined> {
  return await queryOne<MediaContent>(
    "SELECT * FROM media_content WHERE slug = ? AND userId = ?",
    [slug, userId]
  );
}

/**
 * Get all media entries for a specific user
 */
export async function getAllMedia(userId: string): Promise<MediaContent[]> {
  return await query<MediaContent>(
    "SELECT * FROM media_content WHERE userId = ? ORDER BY created_at DESC",
    [userId]
  );
}

export interface PaginatedMediaResult {
  items: MediaContent[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
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
 */
export async function getPaginatedMedia(
  userId: string,
  page: number = 1,
  pageSize: number = 25,
  filters?: {
    type?: "movie" | "tv" | "book" | "game";
    status?: "in-progress" | "completed" | "planned";
    search?: string;
    genres?: string[];
    tags?: string[];
    sortBy?: SortOption;
  }
): Promise<PaginatedMediaResult> {
  const offset = (page - 1) * pageSize;

  // Build WHERE clause
  const whereClauses: string[] = ["userId = ?"];
  const params: unknown[] = [userId];

  if (filters?.type) {
    whereClauses.push("type = ?");
    params.push(filters.type);
  }

  if (filters?.status) {
    whereClauses.push("status = ?");
    params.push(filters.status);
  }

  if (filters?.search) {
    whereClauses.push("title LIKE ?");
    params.push(`%${filters.search}%`);
  }

  // Note: Genre and tag filtering requires JSON operations
  // For simplicity, we'll filter these client-side for now
  // A more advanced implementation could use JSON functions in SQLite

  const whereClause = whereClauses.join(" AND ");

  // Determine ORDER BY clause
  // SQLite doesn't support NULLS LAST, so we use CASE to handle nulls
  let orderBy = "created_at DESC";
  switch (filters?.sortBy) {
    case "title-asc":
      orderBy = "title ASC";
      break;
    case "title-desc":
      orderBy = "title DESC";
      break;
    case "rating-desc":
      orderBy = "CASE WHEN rating IS NULL THEN 0 ELSE 1 END DESC, rating DESC";
      break;
    case "rating-asc":
      orderBy = "CASE WHEN rating IS NULL THEN 0 ELSE 1 END DESC, rating ASC";
      break;
    case "completed-desc":
      orderBy = "CASE WHEN completed IS NULL THEN 0 ELSE 1 END DESC, completed DESC";
      break;
    case "completed-asc":
      orderBy = "CASE WHEN completed IS NULL THEN 0 ELSE 1 END DESC, completed ASC";
      break;
    case "started-desc":
      orderBy = "CASE WHEN started IS NULL THEN 0 ELSE 1 END DESC, started DESC";
      break;
    case "started-asc":
      orderBy = "CASE WHEN started IS NULL THEN 0 ELSE 1 END DESC, started ASC";
      break;
    case "created-desc":
    default:
      orderBy = "created_at DESC";
  }

  // Get all matching items for counting and genre/tag filtering
  let allItems = await query<MediaContent>(
    `SELECT * FROM media_content WHERE ${whereClause} ORDER BY ${orderBy}`,
    params
  );

  // Apply genre filter if specified
  if (filters?.genres && filters.genres.length > 0) {
    allItems = allItems.filter((item) => {
      if (!item.genres) return false;
      const itemGenres = JSON.parse(item.genres);
      return itemGenres.some((g: string) => filters.genres!.includes(g));
    });
  }

  // Apply tag filter if specified
  if (filters?.tags && filters.tags.length > 0) {
    allItems = allItems.filter((item) => {
      if (!item.tags) return false;
      const itemTags = JSON.parse(item.tags);
      return itemTags.some((t: string) => filters.tags!.includes(t));
    });
  }

  const total = allItems.length;

  // Apply pagination
  const items = allItems.slice(offset, offset + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: offset + items.length < total,
  };
}

/**
 * Get media entries by type for a specific user
 */
export async function getMediaByType(
  type: "movie" | "tv" | "book" | "game",
  userId: string
): Promise<MediaContent[]> {
  return await query<MediaContent>(
    "SELECT * FROM media_content WHERE type = ? AND userId = ? ORDER BY created_at DESC",
    [type, userId]
  );
}

/**
 * Get media entries by status for a specific user
 */
export async function getMediaByStatus(
  status: "in-progress" | "completed" | "planned",
  userId: string
): Promise<MediaContent[]> {
  return await query<MediaContent>(
    "SELECT * FROM media_content WHERE status = ? AND userId = ? ORDER BY created_at DESC",
    [status, userId]
  );
}

/**
 * Get media entries by type and status for a specific user
 */
export async function getMediaByTypeAndStatus(
  type: "movie" | "tv" | "book" | "game",
  status: "in-progress" | "completed" | "planned",
  userId: string
): Promise<MediaContent[]> {
  return await query<MediaContent>(
    `SELECT * FROM media_content
     WHERE type = ? AND status = ? AND userId = ?
     ORDER BY created_at DESC`,
    [type, status, userId]
  );
}

/**
 * Update media entry with ownership verification
 */
export async function updateMedia(
  slug: string,
  userId: string,
  data: Partial<MediaContentInput>
): Promise<boolean> {
  // Verify ownership
  const existing = await getMediaBySlug(slug, userId);
  if (!existing) {
    return false;
  }

  // Build dynamic update await query based on provided fields
  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    params.push(data.title);
  }
  if (data.type !== undefined) {
    updates.push("type = ?");
    params.push(data.type);
  }
  if (data.status !== undefined) {
    updates.push("status = ?");
    params.push(data.status);
  }
  if (data.rating !== undefined) {
    updates.push("rating = ?");
    params.push(data.rating);
  }
  if (data.started !== undefined) {
    updates.push("started = ?");
    params.push(data.started);
  }
  if (data.completed !== undefined) {
    updates.push("completed = ?");
    params.push(data.completed);
  }
  if (data.released !== undefined) {
    updates.push("released = ?");
    params.push(data.released);
  }
  if (data.genres !== undefined) {
    updates.push("genres = ?");
    params.push(data.genres ? JSON.stringify(data.genres) : null);
  }
  if (data.poster !== undefined) {
    updates.push("poster = ?");
    params.push(data.poster);
  }
  if (data.tags !== undefined) {
    updates.push("tags = ?");
    params.push(data.tags ? JSON.stringify(data.tags) : null);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    params.push(data.description);
  }
  if (data.length !== undefined) {
    updates.push("length = ?");
    params.push(data.length);
  }
  if (data.creator !== undefined) {
    updates.push("creator = ?");
    params.push(data.creator ? JSON.stringify(data.creator) : null);
  }
  if (data.featured !== undefined) {
    updates.push("featured = ?");
    params.push(data.featured ? 1 : 0);
  }
  if (data.published !== undefined) {
    updates.push("published = ?");
    params.push(data.published ? 1 : 0);
  }
  if (data.content !== undefined) {
    updates.push("content = ?");
    params.push(data.content);
  }
  if (data.slug !== undefined) {
    updates.push("slug = ?");
    params.push(data.slug);
  }

  if (updates.length === 0) {
    return false;
  }

  params.push(slug, userId);

  const result = await execute(
    `UPDATE media_content SET ${updates.join(", ")} WHERE slug = ? AND userId = ?`,
    params
  );

  if (result.changes > 0) {
    // Check for achievements if status changed to completed
    if (data.status === 'completed') {
      checkAchievement(userId, 'media').catch(console.error);
    }
  }

  return result.changes > 0;
}

/**
 * Delete media entry with ownership verification
 */
export async function deleteMedia(slug: string, userId: string): Promise<boolean> {
  // Verify ownership
  const existing = await getMediaBySlug(slug, userId);
  if (!existing) {
    return false;
  }

  const result = await execute("DELETE FROM media_content WHERE slug = ? AND userId = ?", [slug, userId]);
  return result.changes > 0;
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
  const entries = await getAllMedia(userId);
  const total = entries.length;

  const byType: Record<string, number> = { movie: 0, tv: 0, book: 0, game: 0 };
  const byStatus: Record<string, number> = {
    "in-progress": 0,
    completed: 0,
    planned: 0,
  };

  let ratingSum = 0;
  let ratingCount = 0;

  entries.forEach((entry) => {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;

    if (entry.rating) {
      ratingSum += entry.rating;
      ratingCount++;
    }
  });

  const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

  return { total, byType, byStatus, averageRating };
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
  const allMedia = await getAllMedia(userId);
  const genreSet = new Set<string>();

  allMedia.forEach((media) => {
    const genres = parseGenres(media.genres);
    genres.forEach((genre) => genreSet.add(genre));
  });

  return Array.from(genreSet).sort();
}

/**
 * Get all unique tags across all media for a specific user
 */
export async function getAllUniqueTags(userId: string): Promise<string[]> {
  const allMedia = await getAllMedia(userId);
  const tagSet = new Set<string>();

  allMedia.forEach((media) => {
    const tags = parseTags(media.tags);
    tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
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

export type TimelinePeriod = "week" | "month" | "year";

export interface MediaTimelineItem {
  id: number;
  title: string;
  type: "movie" | "tv" | "book" | "game";
  rating: number | null;
  completed: string;
  poster: string | null;
}

export interface MediaTimelineDataPoint {
  label: string;
  startDate: string;
  endDate: string;
  count: number;
  movies: number;
  tv: number;
  books: number;
  games: number;
  items: MediaTimelineItem[];
  avgRating: number | null;
}

export interface MediaTimelineStats {
  totalCompleted: number;
  avgPerPeriod: number;
  mostActiveMonth: string;
  mostActiveMonthCount: number;
  avgRating: number;
  topType: string;
  trend: number; // percentage change comparing recent vs earlier periods
}

export interface MediaTimelineData {
  dataPoints: MediaTimelineDataPoint[];
  stats: MediaTimelineStats;
  period: TimelinePeriod;
}

/**
 * Get media timeline data for charting for a specific user
 * Shows media completed over time with breakdown by type
 */
export async function getMediaTimelineData(
  userId: string,
  period: TimelinePeriod = "month",
  numPeriods: number = 12
): Promise<MediaTimelineData> {
  const now = new Date();
  const dataPoints: MediaTimelineDataPoint[] = [];

  // Get all completed media with valid completion dates
  const allMedia = await getAllMedia(userId);
  const completedMedia = allMedia.filter(
    (m) => m.status === "completed" && m.completed
  );

  // Calculate date ranges for each period
  for (let i = numPeriods - 1; i >= 0; i--) {
    const { startDate, endDate, label } = getTimelinePeriodRange(now, period, i);

    // Filter media completed in this period
    const periodMedia = completedMedia.filter((m) => {
      const completedDate = m.completed!;
      return completedDate >= startDate && completedDate <= endDate;
    });

    // Count by type
    const movies = periodMedia.filter((m) => m.type === "movie").length;
    const tv = periodMedia.filter((m) => m.type === "tv").length;
    const books = periodMedia.filter((m) => m.type === "book").length;
    const games = periodMedia.filter((m) => m.type === "game").length;

    // Calculate average rating for the period
    const ratedMedia = periodMedia.filter((m) => m.rating !== null);
    const avgRating =
      ratedMedia.length > 0
        ? Math.round(
            (ratedMedia.reduce((sum, m) => sum + (m.rating || 0), 0) /
              ratedMedia.length) *
              10
          ) / 10
        : null;

    // Create timeline items for hover details
    const items: MediaTimelineItem[] = periodMedia
      .sort((a, b) => (b.completed || "").localeCompare(a.completed || ""))
      .slice(0, 10) // Limit to 10 most recent for tooltip
      .map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        rating: m.rating,
        completed: m.completed!,
        poster: m.poster,
      }));

    dataPoints.push({
      label,
      startDate,
      endDate,
      count: periodMedia.length,
      movies,
      tv,
      books,
      games,
      items,
      avgRating,
    });
  }

  // Calculate stats
  const totalCompleted = dataPoints.reduce((sum, d) => sum + d.count, 0);
  const avgPerPeriod = Math.round((totalCompleted / numPeriods) * 10) / 10;

  // Find most active period
  const mostActivePeriod = dataPoints.reduce(
    (best, current) => (current.count > best.count ? current : best),
    dataPoints[0]
  );

  // Calculate overall average rating
  const allRatedMedia = completedMedia.filter((m) => m.rating !== null);
  const overallAvgRating =
    allRatedMedia.length > 0
      ? Math.round(
          (allRatedMedia.reduce((sum, m) => sum + (m.rating || 0), 0) /
            allRatedMedia.length) *
            10
        ) / 10
      : 0;

  // Find top type
  const typeCounts = {
    movie: completedMedia.filter((m) => m.type === "movie").length,
    tv: completedMedia.filter((m) => m.type === "tv").length,
    book: completedMedia.filter((m) => m.type === "book").length,
    game: completedMedia.filter((m) => m.type === "game").length,
  };
  const topType = Object.entries(typeCounts).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  // Calculate trend (compare second half to first half)
  const midpoint = Math.floor(numPeriods / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);
  const firstHalfAvg =
    firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length || 0;
  const secondHalfAvg =
    secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length || 0;
  const trend =
    firstHalfAvg > 0
      ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
      : secondHalfAvg > 0
        ? 100
        : 0;

  return {
    dataPoints,
    stats: {
      totalCompleted,
      avgPerPeriod,
      mostActiveMonth: mostActivePeriod?.label || "",
      mostActiveMonthCount: mostActivePeriod?.count || 0,
      avgRating: overallAvgRating,
      topType: topType as string,
      trend,
    },
    period,
  };
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

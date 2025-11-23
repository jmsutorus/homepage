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
export function createMedia(data: MediaContentInput): MediaContent {
  const genresJson = data.genres ? JSON.stringify(data.genres) : null;
  const tagsJson = data.tags ? JSON.stringify(data.tags) : null;
  const creatorJson = data.creator ? JSON.stringify(data.creator) : null;

  const result = execute(
    `INSERT INTO media_content (
      slug, title, type, status, rating, started, completed, released,
      genres, poster, tags, description, length, creator, featured, published, content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ]
  );

  const entry = getMediaById(Number(result.lastInsertRowid));
  if (!entry) {
    throw new Error("Failed to create media entry");
  }

  return entry;
}

/**
 * Get media entry by ID
 */
export function getMediaById(id: number): MediaContent | undefined {
  return queryOne<MediaContent>(
    "SELECT * FROM media_content WHERE id = ?",
    [id]
  );
}

/**
 * Get media entry by slug
 */
export function getMediaBySlug(slug: string): MediaContent | undefined {
  return queryOne<MediaContent>(
    "SELECT * FROM media_content WHERE slug = ?",
    [slug]
  );
}

/**
 * Get all media entries
 */
export function getAllMedia(): MediaContent[] {
  return query<MediaContent>(
    "SELECT * FROM media_content ORDER BY created_at DESC"
  );
}

/**
 * Get media entries by type
 */
export function getMediaByType(
  type: "movie" | "tv" | "book" | "game"
): MediaContent[] {
  return query<MediaContent>(
    "SELECT * FROM media_content WHERE type = ? ORDER BY created_at DESC",
    [type]
  );
}

/**
 * Get media entries by status
 */
export function getMediaByStatus(
  status: "in-progress" | "completed" | "planned"
): MediaContent[] {
  return query<MediaContent>(
    "SELECT * FROM media_content WHERE status = ? ORDER BY created_at DESC",
    [status]
  );
}

/**
 * Get media entries by type and status
 */
export function getMediaByTypeAndStatus(
  type: "movie" | "tv" | "book" | "game",
  status: "in-progress" | "completed" | "planned"
): MediaContent[] {
  return query<MediaContent>(
    `SELECT * FROM media_content
     WHERE type = ? AND status = ?
     ORDER BY created_at DESC`,
    [type, status]
  );
}

/**
 * Update media entry
 */
export function updateMedia(
  slug: string,
  data: Partial<MediaContentInput>
): boolean {
  const existing = getMediaBySlug(slug);
  if (!existing) {
    return false;
  }

  // Build dynamic update query based on provided fields
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

  params.push(slug);

  const result = execute(
    `UPDATE media_content SET ${updates.join(", ")} WHERE slug = ?`,
    params
  );

  if (result.changes > 0) {
    // Check for achievements if status changed to completed
    if (data.status === 'completed') {
      // We need userId. MediaContent has userId but updateMedia doesn't take it.
      // However, checkAchievement needs userId.
      // The current updateMedia function doesn't seem to enforce userId ownership check explicitly 
      // (it assumes slug is unique enough or caller handles auth).
      // Let's fetch the media to get userId.
      const updatedMedia = getMediaBySlug(slug);
      if (updatedMedia) {
        checkAchievement(updatedMedia.userId, 'media').catch(console.error);
      }
    }
  }

  return result.changes > 0;
}

/**
 * Delete media entry
 */
export function deleteMedia(slug: string): boolean {
  const result = execute("DELETE FROM media_content WHERE slug = ?", [slug]);
  return result.changes > 0;
}

/**
 * Get media statistics
 */
export function getMediaStatistics(): {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: number;
} {
  const entries = getAllMedia();
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
export function getMediaWithGenres(media: MediaContent): MediaContent & {
  genresParsed: string[];
} {
  return {
    ...media,
    genresParsed: parseGenres(media.genres),
  };
}

/**
 * Get all unique genres across all media
 */
export function getAllUniqueGenres(): string[] {
  const allMedia = getAllMedia();
  const genreSet = new Set<string>();

  allMedia.forEach((media) => {
    const genres = parseGenres(media.genres);
    genres.forEach((genre) => genreSet.add(genre));
  });

  return Array.from(genreSet).sort();
}

/**
 * Get all unique tags across all media
 */
export function getAllUniqueTags(): string[] {
  const allMedia = getAllMedia();
  const tagSet = new Set<string>();

  allMedia.forEach((media) => {
    const tags = parseTags(media.tags);
    tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Rename a genre across all media entries
 */
export function renameGenre(oldName: string, newName: string): number {
  const allMedia = getAllMedia();
  let updatedCount = 0;

  allMedia.forEach((media) => {
    const genres = parseGenres(media.genres);
    const index = genres.indexOf(oldName);

    if (index !== -1) {
      genres[index] = newName;
      updateMedia(media.slug, { genres });
      updatedCount++;
    }
  });

  return updatedCount;
}

/**
 * Rename a tag across all media entries
 */
export function renameTag(oldName: string, newName: string): number {
  const allMedia = getAllMedia();
  let updatedCount = 0;

  allMedia.forEach((media) => {
    const tags = parseTags(media.tags);
    const index = tags.indexOf(oldName);

    if (index !== -1) {
      tags[index] = newName;
      updateMedia(media.slug, { tags });
      updatedCount++;
    }
  });

  return updatedCount;
}

/**
 * Delete a genre from all media entries
 */
export function deleteGenre(name: string): number {
  const allMedia = getAllMedia();
  let updatedCount = 0;

  allMedia.forEach((media) => {
    const genres = parseGenres(media.genres);
    const filtered = genres.filter((g) => g !== name);

    if (filtered.length !== genres.length) {
      updateMedia(media.slug, { genres: filtered });
      updatedCount++;
    }
  });

  return updatedCount;
}

/**
 * Delete a tag from all media entries
 */
export function deleteTag(name: string): number {
  const allMedia = getAllMedia();
  let updatedCount = 0;

  allMedia.forEach((media) => {
    const tags = parseTags(media.tags);
    const filtered = tags.filter((t) => t !== name);

    if (filtered.length !== tags.length) {
      updateMedia(media.slug, { tags: filtered });
      updatedCount++;
    }
  });

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
 * Get media timeline data for charting
 * Shows media completed over time with breakdown by type
 */
export function getMediaTimelineData(
  period: TimelinePeriod = "month",
  numPeriods: number = 12
): MediaTimelineData {
  const now = new Date();
  const dataPoints: MediaTimelineDataPoint[] = [];

  // Get all completed media with valid completion dates
  const completedMedia = getAllMedia().filter(
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

import { execute, query, queryOne } from "./index";

export interface MediaContent {
  id: number;
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
      genres, poster, tags, length, creator, featured, published, content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

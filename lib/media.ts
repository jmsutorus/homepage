import {
  getAllMedia as dbGetAllMedia,
  getMediaBySlug as dbGetMediaBySlug,
  getMediaByType as dbGetMediaByType,
  parseGenres,
  parseTags,
  type MediaContent,
} from "./db/media";

// Updated MediaFrontmatter interface with all new fields
export interface MediaFrontmatter {
  title: string;
  type: "movie" | "tv" | "book" | "game";
  status: "in-progress" | "completed" | "planned";
  rating?: number;
  started?: string;
  completed?: string;
  released?: string;
  genres?: string[];
  poster?: string;
  tags?: string[];
  description?: string;
  length?: string;
  featured?: boolean;
  published?: boolean;
}

// Interface matching the old MediaItem structure
export interface MediaItem {
  slug: string;
  frontmatter: MediaFrontmatter;
  content: string;
}

/**
 * Convert database MediaContent to MediaItem format
 */
function dbToMediaItem(dbMedia: MediaContent): MediaItem {
  return {
    slug: dbMedia.slug,
    frontmatter: {
      title: dbMedia.title,
      type: dbMedia.type,
      status: dbMedia.status,
      rating: dbMedia.rating ?? undefined,
      started: dbMedia.started ?? undefined,
      completed: dbMedia.completed ?? undefined,
      released: dbMedia.released ?? undefined,
      genres: parseGenres(dbMedia.genres),
      poster: dbMedia.poster ?? undefined,
      tags: parseTags(dbMedia.tags),
      description: dbMedia.description ?? undefined,
      length: dbMedia.length ?? undefined,
      featured: dbMedia.featured === 1,
      published: dbMedia.published === 1,
    },
    content: dbMedia.content,
  };
}

/**
 * Get media item by slug
 * @param directory - Legacy parameter for backwards compatibility (e.g., "media/movies")
 * @param slug - Media slug
 * @param userId - User ID for filtering
 */
export async function getMediaBySlug(directory: string, slug: string, userId: string): Promise<MediaItem | null> {
  try {
    const dbMedia = await dbGetMediaBySlug(slug, userId);
    if (!dbMedia) {
      return null;
    }
    return dbToMediaItem(dbMedia);
  } catch (error) {
    console.error(`Error reading media: ${slug}`, error);
    return null;
  }
}

/**
 * Get all media items from a directory
 * @param directory - Directory path (e.g., "media/movies", "media/tv", "media/books", "media/games")
 * @param userId - User ID for filtering
 */
export async function getAllMedia(directory: string, userId: string): Promise<MediaItem[]> {
  try {
    // Extract type from directory path
    let type: "movie" | "tv" | "book" | "game" | null = null;

    if (directory.includes("movies")) {
      type = "movie";
    } else if (directory.includes("tv")) {
      type = "tv";
    } else if (directory.includes("books")) {
      type = "book";
    } else if (directory.includes("games")) {
      type = "game";
    }

    // Get media from database
    const dbMedia = type ? await dbGetMediaByType(type, userId) : await dbGetAllMedia(userId);

    // Convert to MediaItem format
    return dbMedia.map(dbToMediaItem);
  } catch (error) {
    console.error(`Error reading media from directory: ${directory}`, error);
    return [];
  }
}

/**
 * Get all media items from all directories
 */
export async function getAllMediaItems(userId: string): Promise<MediaItem[]> {
  try {
    const dbMedia = await dbGetAllMedia(userId);
    return dbMedia.map(dbToMediaItem);
  } catch (error) {
    console.error("Error reading all media items", error);
    return [];
  }
}

/**
 * Filter media by type
 */
export function filterMediaByType(
  media: MediaItem[],
  type: MediaFrontmatter["type"]
): MediaItem[] {
  return media.filter((item) => item.frontmatter.type === type);
}

/**
 * Filter media by status
 */
export function filterMediaByStatus(
  media: MediaItem[],
  status: MediaFrontmatter["status"]
): MediaItem[] {
  return media.filter((item) => item.frontmatter.status === status);
}

/**
 * Sort media by date watched (newest first)
 */
export function sortMediaByDate(media: MediaItem[]): MediaItem[] {
  return [...media].sort((a, b) => {
    const dateA = a.frontmatter.completed || a.frontmatter.started || "";
    const dateB = b.frontmatter.completed || b.frontmatter.started || "";
    return dateB.localeCompare(dateA);
  });
}

/**
 * Sort media by rating (highest first)
 */
export function sortMediaByRating(media: MediaItem[]): MediaItem[] {
  return [...media].sort((a, b) => {
    const ratingA = a.frontmatter.rating || 0;
    const ratingB = b.frontmatter.rating || 0;
    return ratingB - ratingA;
  });
}

/**
 * Get recently completed media sorted by completion date (newest first)
 * @param userId - User ID for filtering
 * @param limit - Number of items to return (default: 4)
 */
export async function getRecentlyCompletedMedia(userId: string, limit: number = 4): Promise<MediaItem[]> {
  try {
    const allMedia = await dbGetAllMedia(userId);

    // Filter for completed media with a completed date
    const completedMedia = allMedia
      .filter(item => item.status === "completed" && item.completed)
      .map(dbToMediaItem);

    // Sort by completed date (newest first)
    const sortedMedia = completedMedia.sort((a, b) => {
      const dateA = a.frontmatter.completed || "";
      const dateB = b.frontmatter.completed || "";
      return dateB.localeCompare(dateA);
    });

    return sortedMedia.slice(0, limit);
  } catch (error) {
    console.error("Error getting recently completed media", error);
    return [];
  }
}

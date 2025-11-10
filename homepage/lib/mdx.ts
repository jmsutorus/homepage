import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface MediaFrontmatter {
  title: string;
  type: "movie" | "tv" | "book";
  status: "watching" | "completed" | "planned";
  rating?: number;
  imageUrl?: string;
  dateWatched?: string;
  dateStarted?: string;
  genres?: string[];
}

export interface MediaItem {
  slug: string;
  frontmatter: MediaFrontmatter;
  content: string;
}

/**
 * Get the path to the content directory
 */
function getContentPath(directory: string): string {
  return path.join(process.cwd(), "content", directory);
}

/**
 * Get all markdown files in a directory
 */
export function getMediaFiles(directory: string): string[] {
  const contentPath = getContentPath(directory);

  if (!fs.existsSync(contentPath)) {
    return [];
  }

  const files = fs.readdirSync(contentPath);
  return files.filter((file) => file.endsWith(".md"));
}

/**
 * Get media item by slug
 */
export function getMediaBySlug(directory: string, slug: string): MediaItem | null {
  try {
    const filePath = path.join(getContentPath(directory), `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      frontmatter: data as MediaFrontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error reading media file: ${slug}`, error);
    return null;
  }
}

/**
 * Get all media items from a directory
 */
export function getAllMedia(directory: string): MediaItem[] {
  const files = getMediaFiles(directory);

  const media = files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      return getMediaBySlug(directory, slug);
    })
    .filter((item): item is MediaItem => item !== null);

  return media;
}

/**
 * Get all media items from all directories
 */
export function getAllMediaItems(): MediaItem[] {
  const movies = getAllMedia("media/movies");
  const tvShows = getAllMedia("media/tv");
  const books = getAllMedia("media/books");

  return [...movies, ...tvShows, ...books];
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
    const dateA = a.frontmatter.dateWatched || a.frontmatter.dateStarted || "";
    const dateB = b.frontmatter.dateWatched || b.frontmatter.dateStarted || "";
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

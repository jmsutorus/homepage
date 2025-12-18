import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllMedia, createMedia, getMediaBySlug, getPaginatedMedia } from "@/lib/db/media";
import type { MediaContentInput } from "@/lib/db/media";
import { requireAuthApi } from "@/lib/auth/server";

// Helper function to sanitize slug
function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to map singular type to plural directory name (for URL paths)
function getDirectoryName(type: "movie" | "tv" | "book" | "game" | "album"): string {
  const dirMap = {
    movie: "movies",
    tv: "tv",
    book: "books",
    game: "games",
    album: "albums",
  };
  return dirMap[type];
}

/**
 * GET /api/media
 * Get all media entries or paginated media with filters
 * Query params:
 * - page: Page number (1-indexed)
 * - pageSize: Number of items per page (default: 25)
 * - type: Filter by media type (movie, tv, book, game)
 * - status: Filter by status (in-progress, completed, planned)
 * - search: Search by title
 * - paginate: Enable pagination (default: false for backwards compatibility)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;

    // Check if pagination is requested
    const paginate = searchParams.get("paginate") === "true";

    if (paginate) {
      // Paginated response
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "25");
      const type = searchParams.get("type") as "movie" | "tv" | "book" | "game" | "album" | null;
      const status = searchParams.get("status") as "in-progress" | "completed" | "planned" | null;
      const search = searchParams.get("search");
      const genresParam = searchParams.get("genres");
      const tagsParam = searchParams.get("tags");
      const sortBy = searchParams.get("sortBy") as
        | "title-asc"
        | "title-desc"
        | "rating-desc"
        | "rating-asc"
        | "completed-desc"
        | "completed-asc"
        | "started-desc"
        | "started-asc"
        | "created-desc"
        | null;

      const filters: {
        type?: "movie" | "tv" | "book" | "game" | "album";
        status?: "in-progress" | "completed" | "planned";
        search?: string;
        genres?: string[];
        tags?: string[];
        sortBy?:
          | "title-asc"
          | "title-desc"
          | "rating-desc"
          | "rating-asc"
          | "completed-desc"
          | "completed-asc"
          | "started-desc"
          | "started-asc"
          | "created-desc";
      } = {};

      if (type && type !== null) filters.type = type;
      if (status && status !== null) filters.status = status;
      if (search) filters.search = search;
      if (genresParam) filters.genres = genresParam.split(",");
      if (tagsParam) filters.tags = tagsParam.split(",");
      if (sortBy && sortBy !== null) filters.sortBy = sortBy;

      console.log("Fetching paginated media with filters:", JSON.stringify(filters, null, 2));
      // Exclude content field for performance (not needed for list view)
      const result = await getPaginatedMedia(userId, page, pageSize, filters, false);
      console.log(`Returned ${result.items.length} items, hasMore: ${result.hasMore}`);
      return NextResponse.json(result);
    } else {
      // Legacy non-paginated response for backwards compatibility
      const type = searchParams.get("type") as "movie" | "tv" | "book" | null;
      const status = searchParams.get("status") as
        | "watching"
        | "completed"
        | "planned"
        | null;

      // Exclude content field for performance (not needed for list view)
      let media = await getAllMedia(userId, false);

      // Apply filters
      if (type) {
        media = media.filter((m) => m.type === type);
      }
      if (status) {
        media = media.filter((m) => m.status === status);
      }

      return NextResponse.json(media);
    }
  } catch (error) {
    console.error("Error fetching media:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch media", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media
 * Create a new media entry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { frontmatter, content } = body;

    // Validate required fields
    if (!frontmatter?.title || !frontmatter?.type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["movie", "tv", "book", "game", "album"];
    if (!validTypes.includes(frontmatter.type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be movie, tv, book, game, or album" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = sanitizeSlug(frontmatter.title);

    // Check if media with this slug already exists for this user
    const existing = await getMediaBySlug(slug, userId);
    if (existing) {
      return NextResponse.json(
        { error: "A media entry with this title already exists" },
        { status: 409 }
      );
    }

    const mediaInput: MediaContentInput = {
      slug,
      title: frontmatter.title,
      type: frontmatter.type,
      status: frontmatter.status || "planned",
      rating: frontmatter.rating,
      started: frontmatter.started,
      completed: frontmatter.completed,
      released: frontmatter.released,
      genres: frontmatter.genres,
      poster: frontmatter.poster,
      tags: frontmatter.tags,
      description: frontmatter.description,
      length: frontmatter.length,
      creator: frontmatter.creator,
      featured: frontmatter.featured,
      published: frontmatter.published,
      timeSpent: frontmatter.timeSpent,
      content: content || "",
    };

    const media = await createMedia(mediaInput, userId);
    const dirName = getDirectoryName(frontmatter.type);

    // Revalidate paths
    revalidatePath("/media");
    revalidatePath(`/media/${dirName}/${slug}`);

    return NextResponse.json(
      {
        success: true,
        slug,
        path: `/media/${dirName}/${slug}`,
        media,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}

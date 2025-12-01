import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllMedia, createMedia, getMediaBySlug } from "@/lib/db/media";
import type { MediaContentInput } from "@/lib/db/media";
import { getUserId } from "@/lib/auth/server";

// Helper function to sanitize slug
async function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to map singular type to plural directory name (for URL paths)
function getDirectoryName(type: "movie" | "tv" | "book" | "game"): string {
  const dirMap = {
    movie: "movies",
    tv: "tv",
    book: "books",
    game: "games",
  };
  return dirMap[type];
}

/**
 * GET /api/media
 * Get all media entries or filter by type/status
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await await getUserId();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "movie" | "tv" | "book" | null;
    const status = searchParams.get("status") as
      | "watching"
      | "completed"
      | "planned"
      | null;

    let media = await getAllMedia(userId);

    // Apply filters
    if (type) {
      media = media.filter((m) => m.type === type);
    }
    if (status) {
      media = media.filter((m) => m.status === status);
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
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
    const userId = await await getUserId();
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
    const validTypes = ["movie", "tv", "book", "game"];
    if (!validTypes.includes(frontmatter.type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be movie, tv, book, or game" },
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
      featured: frontmatter.featured,
      published: frontmatter.published,
      content: content || "",
    };

    const media = await createMedia(mediaInput, userId);
    const dirName = await getDirectoryName(frontmatter.type);

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

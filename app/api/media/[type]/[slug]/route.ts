import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getMediaBySlug,
  updateMedia,
  deleteMedia,
  parseGenres,
  parseTags,
} from "@/lib/db/media";
import type { MediaContentInput } from "@/lib/db/media";
import { getUserId, requireAuthApi } from "@/lib/auth/server";

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

// GET - Read existing media entry for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params;
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Validate type
    const validTypes = ["movie", "tv", "book", "game"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const media = await getMediaBySlug(slug, userId);

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Convert to frontmatter format for compatibility
    return NextResponse.json({
      frontmatter: {
        title: media.title,
        type: media.type,
        status: media.status,
        rating: media.rating,
        started: media.started,
        completed: media.completed,
        released: media.released,
        genres: parseGenres(media.genres),
        poster: media.poster,
        tags: parseTags(media.tags),
        description: media.description,
        length: media.length,
        featured: media.featured === 1,
        published: media.published === 1,
      },
      content: media.content,
      slug: media.slug,
      type: media.type,
    });
  } catch (error) {
    console.error("Error reading media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing media entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params;
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { frontmatter, content } = body;

    // Validate type
    const validTypes = ["movie", "tv", "book", "game"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Check if media exists
    const existing = await getMediaBySlug(slug, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!frontmatter?.title || !frontmatter?.type || !frontmatter?.status) {
      return NextResponse.json(
        { error: "Title, type, and status are required" },
        { status: 400 }
      );
    }

    // Build update object (allow null for optional fields)
    const updateData: Partial<MediaContentInput> = {
      title: frontmatter.title,
      type: frontmatter.type,
      status: frontmatter.status,
      rating: frontmatter.rating || undefined,
      started: frontmatter.started || undefined,
      completed: frontmatter.completed || undefined,
      released: frontmatter.released || undefined,
      genres: frontmatter.genres || undefined,
      poster: frontmatter.poster || undefined,
      tags: frontmatter.tags || undefined,
      description: frontmatter.description || undefined,
      length: frontmatter.length || undefined,
      featured: frontmatter.featured,
      published: frontmatter.published,
      content: content || "",
    };

    const success = await updateMedia(slug, userId, updateData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update media" },
        { status: 500 }
      );
    }

    // Use the NEW type from frontmatter for the redirect path (in case type changed)
    const newType = frontmatter.type as "movie" | "tv" | "book" | "game";
    const dirName = getDirectoryName(newType);
    const oldDirName = getDirectoryName(type as "movie" | "tv" | "book" | "game");

    // Revalidate both old and new paths (in case type changed)
    revalidatePath("/media");
    revalidatePath(`/media/${oldDirName}/${slug}`);
    if (oldDirName !== dirName) {
      revalidatePath(`/media/${dirName}/${slug}`);
    }

    return NextResponse.json({
      success: true,
      slug,
      path: `/media/${dirName}/${slug}`,
    });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

// DELETE - Remove media entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params;
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Validate type
    const validTypes = ["movie", "tv", "book", "game"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Check if media exists
    const existing = await getMediaBySlug(slug, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    const success = await deleteMedia(slug, userId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete media" },
        { status: 500 }
      );
    }

    // Revalidate paths
    revalidatePath("/media");

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

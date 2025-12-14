import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllParks, createPark, getParkBySlug } from "@/lib/db/parks";
import { PARK_CATEGORIES } from "@/lib/db/enums/park-enums";
import { requireAuthApi } from "@/lib/auth/server";

// Helper function to sanitize slug
// Helper function to sanitize slug
function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/parks
 * Get all park entries or filter by category/state
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const state = searchParams.get("state");

    let parks = await getAllParks(userId);

    // Apply filters
    if (category) {
      parks = parks.filter((p) => p.category === category);
    }
    if (state) {
      parks = parks.filter((p) => p.state === state);
    }

    return NextResponse.json(parks);
  } catch (error) {
    console.error("Error fetching parks:", error);
    return NextResponse.json(
      { error: "Failed to fetch parks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/parks
 * Create a new park entry
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
    if (!frontmatter?.title || !frontmatter?.category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    // Validate category
    if (!(PARK_CATEGORIES as readonly string[]).includes(frontmatter.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${PARK_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = sanitizeSlug(frontmatter.title);

    // Check if park with this slug already exists for this user
    const existing = await getParkBySlug(slug, userId);
    if (existing) {
      return NextResponse.json(
        { error: "A park entry with this title already exists" },
        { status: 409 }
      );
    }

    const parkData = {
      slug,
      title: frontmatter.title,
      category: frontmatter.category,
      state: frontmatter.state,
      poster: frontmatter.poster,
      description: frontmatter.description,
      visited: frontmatter.visited,
      tags: frontmatter.tags,
      rating: frontmatter.rating,
      featured: frontmatter.featured,
      published: frontmatter.published,
      content: content || "",
      userId,
    };

    const park = await createPark(parkData);

    // Revalidate paths
    revalidatePath("/parks");
    revalidatePath(`/parks/${slug}`);

    return NextResponse.json(
      {
        success: true,
        slug,
        path: `/parks/${slug}`,
        park,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating park:", error);
    return NextResponse.json(
      { error: "Failed to create park" },
      { status: 500 }
    );
  }
}

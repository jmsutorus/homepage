import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getParkBySlug,
  updatePark,
  deletePark,
} from "@/lib/db/parks";
import { PARK_CATEGORIES, ParkCategoryValue } from "@/lib/db/enums/park-enums";

// GET - Read existing park entry for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const park = getParkBySlug(slug);

    if (!park) {
      return NextResponse.json(
        { error: "Park not found" },
        { status: 404 }
      );
    }

    // Convert to frontmatter format for compatibility
    return NextResponse.json({
      frontmatter: {
        title: park.title,
        category: park.category,
        state: park.state,
        poster: park.poster,
        description: park.description,
        visited: park.visited,
        tags: park.tags,
        rating: park.rating,
        featured: park.featured,
        published: park.published,
      },
      content: park.content,
      slug: park.slug,
    });
  } catch (error) {
    console.error("Error reading park:", error);
    return NextResponse.json(
      { error: "Failed to fetch park" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing park entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { frontmatter, content } = body;

    // Check if park exists
    const existing = getParkBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: "Park not found" },
        { status: 404 }
      );
    }

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

    // Build update object
    const updateData = {
      title: frontmatter.title,
      category: frontmatter.category,
      state: frontmatter.state || undefined,
      poster: frontmatter.poster || undefined,
      description: frontmatter.description || undefined,
      visited: frontmatter.visited || undefined,
      tags: frontmatter.tags || undefined,
      rating: frontmatter.rating !== undefined ? frontmatter.rating : undefined,
      featured: frontmatter.featured,
      published: frontmatter.published,
      content: content || "",
    };

    const updatedPark = updatePark(slug, updateData);

    if (!updatedPark) {
      return NextResponse.json(
        { error: "Failed to update park" },
        { status: 500 }
      );
    }

    // Revalidate paths
    revalidatePath("/parks");
    revalidatePath(`/parks/${slug}`);

    return NextResponse.json({
      success: true,
      slug,
      path: `/parks/${slug}`,
    });
  } catch (error) {
    console.error("Error updating park:", error);
    return NextResponse.json(
      { error: "Failed to update park" },
      { status: 500 }
    );
  }
}

// DELETE - Remove park entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if park exists
    const existing = getParkBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: "Park not found" },
        { status: 404 }
      );
    }

    const success = deletePark(slug);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete park" },
        { status: 500 }
      );
    }

    // Revalidate paths
    revalidatePath("/parks");

    return NextResponse.json({
      success: true,
      message: "Park deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting park:", error);
    return NextResponse.json(
      { error: "Failed to delete park" },
      { status: 500 }
    );
  }
}

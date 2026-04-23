import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getParkBySlug,
  updatePark,
  deletePark,
  getParkPhotos,
  getParkTrails,
} from "@/lib/db/parks";
import { PARK_CATEGORIES } from "@/lib/db/enums/park-enums";
import { requireAuthApi } from "@/lib/auth/server";
import { getAdminStorage } from "@/lib/firebase/admin";

// GET - Read existing park entry for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const park = await getParkBySlug(slug, userId);

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
        quote: park.quote,
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
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const existing = await getParkBySlug(slug, userId);
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

    // Handle photo cleanup if poster is being updated
    if (frontmatter.poster !== undefined && existing.poster && existing.poster !== frontmatter.poster) {
      if (existing.poster.includes("firebasestorage.googleapis.com")) {
        try {
          const bucket = getAdminStorage().bucket();
          const urlObj = new URL(existing.poster);
          const pathPart = urlObj.pathname.split("/o/")[1];
          if (pathPart) {
            const filePath = decodeURIComponent(pathPart);
            const oldFile = bucket.file(filePath);
            const [exists] = await oldFile.exists();
            if (exists) {
              await oldFile.delete();
              console.log(`Deleted old park poster during PATCH: ${filePath}`);
            }
          }
        } catch (err) {
          console.error("Failed to delete old park poster during PATCH:", err);
        }
      }
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
      quote: frontmatter.quote || undefined,
    };

    const updatedPark = await updatePark(slug, userId, updateData);

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
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const existing = await getParkBySlug(slug, userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Park not found" },
        { status: 404 }
      );
    }

    // Delete all associated media from storage
    const bucket = getAdminStorage().bucket();

    // 1. Delete poster
    if (existing.poster && existing.poster.includes("firebasestorage.googleapis.com")) {
      try {
        const urlObj = new URL(existing.poster);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted park poster during park deletion: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete park poster during park deletion:", err);
      }
    }

    // 2. Delete gallery photos
    const photos = await getParkPhotos(existing.id);
    for (const photo of photos) {
      if (photo.url && photo.url.includes("firebasestorage.googleapis.com")) {
        try {
          const urlObj = new URL(photo.url);
          const pathPart = urlObj.pathname.split("/o/")[1];
          if (pathPart) {
            const filePath = decodeURIComponent(pathPart);
            const oldFile = bucket.file(filePath);
            const [exists] = await oldFile.exists();
            if (exists) {
              await oldFile.delete();
              console.log(`Deleted park gallery photo during park deletion: ${filePath}`);
            }
          }
        } catch (err) {
          console.error("Failed to delete park gallery photo during park deletion:", err);
        }
      }
    }

    // 3. Delete trail photos
    const trails = await getParkTrails(existing.id);
    for (const trail of trails) {
      if (trail.photo_url && trail.photo_url.includes("firebasestorage.googleapis.com")) {
        try {
          const urlObj = new URL(trail.photo_url);
          const pathPart = urlObj.pathname.split("/o/")[1];
          if (pathPart) {
            const filePath = decodeURIComponent(pathPart);
            const oldFile = bucket.file(filePath);
            const [exists] = await oldFile.exists();
            if (exists) {
              await oldFile.delete();
              console.log(`Deleted park trail photo during park deletion: ${filePath}`);
            }
          }
        } catch (err) {
          console.error("Failed to delete park trail photo during park deletion:", err);
        }
      }
    }

    const success = await deletePark(slug, userId);

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

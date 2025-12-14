import { NextRequest, NextResponse } from "next/server";
import {
  getUserQuickLinks,
  createLink,
  updateLink,
  deleteLink,
  initializeDefaultQuickLinks,
} from "@/lib/db/quick-links";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/quick-links
 * Get all quick links for the authenticated user
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const quickLinks = await getUserQuickLinks(userId);

    // If no quick links exist, initialize defaults
    if (quickLinks.length === 0) {
      initializeDefaultQuickLinks(userId);
      return NextResponse.json(await getUserQuickLinks(userId));
    }

    return NextResponse.json(quickLinks);
  } catch (error) {
    console.error("Error fetching quick links:", error);
    return NextResponse.json(
      { error: "Failed to fetch quick links" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quick-links
 * Create a new link
 * Body: { categoryId: number, title: string, url: string, icon?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { categoryId, title, url, icon } = body;

    // Validate input
    if (!categoryId || !title || !url) {
      return NextResponse.json(
        { error: "Missing required fields: categoryId, title, and url" },
        { status: 400 }
      );
    }

    const link = await createLink(userId, categoryId, title, url, icon);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/quick-links
 * Update a link
 * Body: { id: number, title?: string, url?: string, icon?: string, categoryId?: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const success = await updateLink(id, userId, {
      title: updates.title,
      url: updates.url,
      icon: updates.icon,
      category_id: updates.categoryId,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Link not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quick-links
 * Delete a link
 * Query params: id
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const success = await deleteLink(parseInt(id, 10), userId);

    if (!success) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}

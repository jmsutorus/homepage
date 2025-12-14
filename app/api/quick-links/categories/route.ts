import { NextRequest, NextResponse } from "next/server";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getUserQuickLinks,
} from "@/lib/db/quick-links";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/quick-links/categories
 * Get all categories for the authenticated user
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const quickLinks = getUserQuickLinks(userId);
    return NextResponse.json(quickLinks);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quick-links/categories
 * Create a new category
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const category = createCategory(userId, name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quick-links/categories
 * Update a category or reorder categories
 * Body: { id?: number, name?: string } OR { categoryIds: number[] }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();

    // Handle reordering
    if (body.categoryIds) {
      reorderCategories(userId, body.categoryIds);
      return NextResponse.json({ success: true });
    }

    // Handle update
    const { id, name } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const success = updateCategory(id, userId, { name });

    if (!success) {
      return NextResponse.json(
        { error: "Category not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quick-links/categories
 * Delete a category and all its links
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

    const success = deleteCategory(parseInt(id, 10), userId);

    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

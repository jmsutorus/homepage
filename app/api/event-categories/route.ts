import { NextRequest, NextResponse } from "next/server";
import {
  getAllEventCategories,
  createEventCategory,
  ensureDefaultEventCategories,
} from "@/lib/db/events";
import { getUserId } from "@/lib/auth/server";

/**
 * GET /api/event-categories
 * Returns all event categories for the current user
 * Auto-initializes default categories if user has none
 */
export async function GET() {
  try {
    const userId = await getUserId();

    // Ensure user has default categories if they don't have any
    await ensureDefaultEventCategories(userId);

    const categories = await getAllEventCategories(userId);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching event categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch event categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/event-categories
 * Creates a new event category
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await createEventCategory(userId, name.trim());
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating event category:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event category" },
      { status: 500 }
    );
  }
}

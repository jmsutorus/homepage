import { NextRequest, NextResponse } from "next/server";
import {
  getAllTaskCategories,
  createTaskCategory,
} from "@/lib/db/tasks";
import { getUserId } from "@/lib/auth/server";

/**
 * GET /api/task-categories
 * Returns all task categories for the current user
 */
export async function GET() {
  try {
    const categories = await getAllTaskCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching task categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch task categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/task-categories
 * Creates a new task category
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

    const category = await createTaskCategory(userId, name.trim());
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating task category:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create task category" },
      { status: 500 }
    );
  }
}

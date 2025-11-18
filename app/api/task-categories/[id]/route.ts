import { NextRequest, NextResponse } from "next/server";
import {
  deleteTaskCategory,
  renameTaskCategory,
} from "@/lib/db/tasks";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/task-categories/[id]
 * Renames a task category
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const success = renameTaskCategory(categoryId, name.trim());

    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error renaming task category:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to rename task category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/task-categories/[id]
 * Deletes a task category
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const success = deleteTaskCategory(categoryId);

    if (!success) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task category:", error);
    return NextResponse.json(
      { error: "Failed to delete task category" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateTaskStatus, deleteTaskStatus } from "@/lib/db/tasks";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/task-statuses/[id]
 * Updates a custom task status
 * Body: { name?: string, color?: string }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const statusId = parseInt(id, 10);

    if (isNaN(statusId)) {
      return NextResponse.json({ error: "Invalid status ID" }, { status: 400 });
    }

    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const updates: { name?: string; color?: string } = {};

    if (body.name !== undefined) {
      updates.name = body.name;
    }

    if (body.color !== undefined) {
      updates.color = body.color;
    }

    const success = await updateTaskStatus(statusId, userId, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update status or status not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task status:", error);

    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A status with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/task-statuses/[id]
 * Deletes a custom task status
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const statusId = parseInt(id, 10);

    if (isNaN(statusId)) {
      return NextResponse.json({ error: "Invalid status ID" }, { status: 400 });
    }

    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const success = await deleteTaskStatus(statusId, userId);

    if (!success) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task status:", error);
    return NextResponse.json(
      { error: "Failed to delete task status" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask, deleteTask, TaskPriority, TaskStatus, isValidTaskStatus } from "@/lib/db/tasks";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/tasks/[id]
 * Body: { title?, description?, completed?, status?, dueDate?, priority?, category? }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Check if task exists
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const existingTask = await getTask(taskId, userId);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: {
      title?: string;
      description?: string;
      completed?: boolean;
      status?: TaskStatus;
      due_date?: string;
      priority?: TaskPriority;
      category?: string | null;
    } = {};

    if (body.title !== undefined) {
      updates.title = body.title;
    }

    if (body.description !== undefined) {
      updates.description = body.description;
    }

    if (body.status !== undefined) {
      // Validate status
      if (!(await isValidTaskStatus(userId, body.status))) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.completed !== undefined) {
      updates.completed = body.completed;
    }

    if (body.dueDate !== undefined) {
      updates.due_date = body.dueDate;
    }

    if (body.priority !== undefined) {
      updates.priority = body.priority as TaskPriority;
    }

    if (body.category !== undefined) {
      updates.category = body.category || null;
    }

    const success = await updateTask(taskId, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    const updatedTask = await getTask(taskId, userId);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const success = await deleteTask(taskId, userId);

    if (!success) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

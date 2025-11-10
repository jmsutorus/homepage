import { NextRequest, NextResponse } from "next/server";
import { createTask, getAllTasks, TaskPriority, TaskFilter } from "@/lib/db/tasks";

/**
 * GET /api/tasks
 * Query params:
 * - completed: Filter by completion status (true/false)
 * - priority: Filter by priority (low/medium/high)
 * - search: Search in title
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const completedParam = searchParams.get("completed");
    const priority = searchParams.get("priority") as TaskPriority | null;
    const search = searchParams.get("search");

    const filter: TaskFilter = {};

    if (completedParam !== null) {
      filter.completed = completedParam === "true";
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.search = search;
    }

    const tasks = getAllTasks(filter);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Body: { title: string, dueDate?: string, priority?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, dueDate, priority } = body;

    // Validate input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create task
    const task = createTask(
      title.trim(),
      dueDate || undefined,
      (priority as TaskPriority) || "medium"
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

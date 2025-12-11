import { NextRequest, NextResponse } from "next/server";
import {
  getAllTaskStatuses,
  getCustomTaskStatuses,
  createTaskStatus,
} from "@/lib/db/tasks";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/task-statuses
 * Returns all task statuses (predefined + custom) for the current user
 * Query params:
 * - customOnly: if true, only return custom statuses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const searchParams = request.nextUrl.searchParams;
    const customOnly = searchParams.get("customOnly") === "true";

    if (customOnly) {
      const customStatuses = await getCustomTaskStatuses(userId);
      return NextResponse.json({ custom: customStatuses });
    }

    const statuses = await getAllTaskStatuses(userId);
    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching task statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch task statuses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/task-statuses
 * Creates a new custom task status
 * Body: { name: string, color?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Status name is required" },
        { status: 400 }
      );
    }

    const status = await createTaskStatus(userId, name.trim(), color);
    return NextResponse.json(status, { status: 201 });
  } catch (error) {
    console.error("Error creating task status:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "A status with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create task status" },
      { status: 500 }
    );
  }
}

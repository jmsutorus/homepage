import { NextRequest, NextResponse } from "next/server";
import { getHabits, getAllHabits, createHabit } from "@/lib/db/habits";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/habits
 * Query params:
 * - includeArchived: Include archived habits (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const includeArchived = searchParams.get("includeArchived") === "true";

    const habits = includeArchived ? await getAllHabits(userId) : await getHabits(userId);
    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 * Body: { title: string, description?: string, frequency?: string, target?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await request.json();
    const { title, description, frequency, target } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const habit = await createHabit(userId, {
      title: title.trim(),
      description,
      frequency,
      target,
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}

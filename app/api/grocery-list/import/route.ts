import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { importFromMeal } from "@/lib/db/grocery";

// POST /api/grocery-list/import - Import ingredients from a meal
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const mealId = body.mealId;

    if (!mealId || typeof mealId !== "number") {
      return NextResponse.json(
        { error: "Valid mealId is required" },
        { status: 400 }
      );
    }

    const addedItems = await importFromMeal(mealId, session.user.id);
    return NextResponse.json({
      success: true,
      count: addedItems.length,
      items: addedItems,
    });
  } catch (error) {
    console.error("Error importing from meal:", error);
    const message =
      error instanceof Error ? error.message : "Failed to import from meal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

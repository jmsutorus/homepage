import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  getDailyMealsByDate,
  addDailyMeal,
  deleteDailyMealByDateAndType,
} from "@/lib/db/daily-meals";
import type { DailyMealInput, MealType } from "@/lib/types/meals";

// GET /api/daily-meals?date=YYYY-MM-DD - Get daily meals for a specific date
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    const dailyMeals = await getDailyMealsByDate(session.user.id, date);
    return NextResponse.json(dailyMeals);
  } catch (error) {
    console.error("Error fetching daily meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily meals" },
      { status: 500 }
    );
  }
}

// POST /api/daily-meals - Add or update a daily meal
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: DailyMealInput = await request.json();

    if (!body.date || !body.meal_type || !body.mealId) {
      return NextResponse.json(
        { error: "Missing required fields: date, meal_type, mealId" },
        { status: 400 }
      );
    }

    const dailyMeal = await addDailyMeal(body, session.user.id);
    return NextResponse.json(dailyMeal, { status: 201 });
  } catch (error) {
    console.error("Error adding daily meal:", error);
    return NextResponse.json(
      { error: "Failed to add daily meal" },
      { status: 500 }
    );
  }
}

// DELETE /api/daily-meals?date=YYYY-MM-DD&meal_type=breakfast - Delete a specific daily meal
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const mealType = searchParams.get("meal_type") as MealType;

  if (!date || !mealType) {
    return NextResponse.json(
      { error: "Date and meal_type parameters are required" },
      { status: 400 }
    );
  }

  try {
    await deleteDailyMealByDateAndType(session.user.id, date, mealType);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting daily meal:", error);
    return NextResponse.json(
      { error: "Failed to delete daily meal" },
      { status: 500 }
    );
  }
}

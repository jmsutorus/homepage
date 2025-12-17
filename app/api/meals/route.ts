import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllMeals,
  createMeal,
  MealInput,
} from "@/lib/db/meals";

// GET /api/meals - Get all meals for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meals = await getAllMeals(session.user.id);
    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

// POST /api/meals - Create a new meal
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const mealInput: MealInput = {
      name: body.name,
      description: body.description,
      steps: body.steps,
      servings: body.servings,
      prep_time: body.prep_time,
      cook_time: body.cook_time,
      image_url: body.image_url,
      tags: body.tags,
      rating: body.rating,
    };

    if (!mealInput.name) {
      return NextResponse.json(
        { error: "Meal name is required" },
        { status: 400 }
      );
    }

    const meal = await createMeal(mealInput, session.user.id);
    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}

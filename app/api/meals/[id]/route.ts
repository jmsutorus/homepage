import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getMealWithIngredients,
  getMealById,
  updateMeal,
  deleteMeal,
  MealInput,
} from "@/lib/db/meals";
import { getAdminStorage } from "@/lib/firebase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/meals/[id] - Get a specific meal with ingredients
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const mealId = parseInt(id, 10);
    if (isNaN(mealId)) {
      return NextResponse.json({ error: "Invalid meal ID" }, { status: 400 });
    }

    const meal = await getMealWithIngredients(mealId, session.user.id);
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error fetching meal:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal" },
      { status: 500 }
    );
  }
}

// PUT /api/meals/[id] - Update a meal
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const mealId = parseInt(id, 10);
    if (isNaN(mealId)) {
      return NextResponse.json({ error: "Invalid meal ID" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Partial<MealInput> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.steps !== undefined) updates.steps = body.steps;
    if (body.servings !== undefined) updates.servings = body.servings;
    if (body.prep_time !== undefined) updates.prep_time = body.prep_time;
    if (body.cook_time !== undefined) updates.cook_time = body.cook_time;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.rating !== undefined) updates.rating = body.rating;

    // Handle old photo cleanup if image_url is being updated
    if (body.image_url !== undefined) {
      updates.image_url = body.image_url;
      const existingMeal = await getMealById(mealId, session.user.id);
      if (existingMeal && existingMeal.image_url && existingMeal.image_url !== body.image_url) {
        if (existingMeal.image_url.includes("firebasestorage.googleapis.com")) {
          try {
            const bucket = getAdminStorage().bucket();
            const urlObj = new URL(existingMeal.image_url);
            const pathPart = urlObj.pathname.split("/o/")[1];
            if (pathPart) {
              const filePath = decodeURIComponent(pathPart);
              const oldFile = bucket.file(filePath);
              const [exists] = await oldFile.exists();
              if (exists) {
                await oldFile.delete();
                console.log(`Deleted old meal photo during PUT: ${filePath}`);
              }
            }
          } catch (err) {
            console.error("Failed to delete old meal photo during PUT:", err);
          }
        }
      }
    }

    const success = await updateMeal(mealId, session.user.id, updates);
    if (!success) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const updated = await getMealWithIngredients(mealId, session.user.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

// DELETE /api/meals/[id] - Delete a meal
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const mealId = parseInt(id, 10);
    if (isNaN(mealId)) {
      return NextResponse.json({ error: "Invalid meal ID" }, { status: 400 });
    }

    // Delete image from storage if it exists
    const existingMeal = await getMealById(mealId, session.user.id);
    if (existingMeal && existingMeal.image_url && existingMeal.image_url.includes("firebasestorage.googleapis.com")) {
      try {
        const bucket = getAdminStorage().bucket();
        const urlObj = new URL(existingMeal.image_url);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted meal photo during DELETE: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete meal photo during DELETE:", err);
      }
    }

    const success = await deleteMeal(mealId, session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}

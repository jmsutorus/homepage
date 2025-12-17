import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getIngredients,
  addIngredient,
  getMealById,
  deleteAllIngredients,
} from "@/lib/db/meals";
import type { IngredientInput } from "@/lib/types/meals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/meals/[id]/ingredients - Get all ingredients for a meal
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

    // Verify meal ownership
    const meal = await getMealById(mealId, session.user.id);
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const ingredients = await getIngredients(mealId);
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

// POST /api/meals/[id]/ingredients - Add an ingredient to a meal
export async function POST(request: Request, { params }: RouteParams) {
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

    // Verify meal ownership
    const meal = await getMealById(mealId, session.user.id);
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const body = await request.json();
    const ingredientInput: IngredientInput = {
      name: body.name,
      quantity: body.quantity,
      unit: body.unit,
      category: body.category,
      notes: body.notes,
      order_index: body.order_index,
    };

    if (!ingredientInput.name) {
      return NextResponse.json(
        { error: "Ingredient name is required" },
        { status: 400 }
      );
    }

    const ingredient = await addIngredient(mealId, ingredientInput);
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  }
}

// DELETE /api/meals/[id]/ingredients - Delete all ingredients for a meal
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

    // Verify meal ownership
    const meal = await getMealById(mealId, session.user.id);
    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const count = await deleteAllIngredients(mealId);
    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error("Error deleting ingredients:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredients" },
      { status: 500 }
    );
  }
}

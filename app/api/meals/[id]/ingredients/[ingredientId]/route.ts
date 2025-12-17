import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  updateIngredient,
  deleteIngredient,
  IngredientInput,
} from "@/lib/db/meals";
import { queryOne } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string; ingredientId: string }>;
}

// Helper to verify ingredient belongs to a user's meal
async function verifyIngredientOwnership(
  ingredientId: number,
  userId: string
): Promise<boolean> {
  const result = await queryOne<{ id: number }>(
    `SELECT mi.id FROM meal_ingredients mi
     JOIN meals m ON mi.mealId = m.id
     WHERE mi.id = ? AND m.userId = ?`,
    [ingredientId, userId]
  );
  return !!result;
}

// PUT /api/meals/[id]/ingredients/[ingredientId] - Update an ingredient
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ingredientId } = await params;
    const ingId = parseInt(ingredientId, 10);
    if (isNaN(ingId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 }
      );
    }

    // Verify ownership
    const hasAccess = await verifyIngredientOwnership(ingId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Partial<IngredientInput> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.quantity !== undefined) updates.quantity = body.quantity;
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.category !== undefined) updates.category = body.category;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.order_index !== undefined) updates.order_index = body.order_index;

    const success = await updateIngredient(ingId, updates);
    if (!success) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 }
    );
  }
}

// DELETE /api/meals/[id]/ingredients/[ingredientId] - Delete an ingredient
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ingredientId } = await params;
    const ingId = parseInt(ingredientId, 10);
    if (isNaN(ingId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 }
      );
    }

    // Verify ownership
    const hasAccess = await verifyIngredientOwnership(ingId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    const success = await deleteIngredient(ingId);
    if (!success) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
}

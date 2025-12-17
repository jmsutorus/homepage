import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  updateGroceryItem,
  deleteGroceryItem,
  toggleGroceryItem,
} from "@/lib/db/grocery";
import type { IngredientCategory } from "@/lib/types/meals";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/grocery-list/[id] - Update a grocery item
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if this is a toggle request
    if (body.toggle === true) {
      const success = await toggleGroceryItem(itemId, session.user.id);
      if (!success) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    // Otherwise, update the item
    const updates: {
      name?: string;
      quantity?: number;
      unit?: string;
      category?: IngredientCategory;
      checked?: boolean;
    } = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.quantity !== undefined) updates.quantity = body.quantity;
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.category !== undefined) updates.category = body.category;
    if (body.checked !== undefined) updates.checked = body.checked;

    const success = await updateGroceryItem(itemId, session.user.id, updates);
    if (!success) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating grocery item:", error);
    return NextResponse.json(
      { error: "Failed to update grocery item" },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery-list/[id] - Delete a grocery item
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const success = await deleteGroceryItem(itemId, session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grocery item:", error);
    return NextResponse.json(
      { error: "Failed to delete grocery item" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getGroceryListByCategory,
  addGroceryItem,
  clearCheckedItems,
  GroceryItemInput,
} from "@/lib/db/grocery";

// GET /api/grocery-list - Get all grocery items grouped by category
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groceryList = await getGroceryListByCategory(session.user.id);
    return NextResponse.json(groceryList);
  } catch (error) {
    console.error("Error fetching grocery list:", error);
    return NextResponse.json(
      { error: "Failed to fetch grocery list" },
      { status: 500 }
    );
  }
}

// POST /api/grocery-list - Add an item to the grocery list
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const itemInput: GroceryItemInput = {
      name: body.name,
      quantity: body.quantity,
      unit: body.unit,
      category: body.category,
      mealId: body.mealId,
    };

    if (!itemInput.name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    const item = await addGroceryItem(itemInput, session.user.id);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding grocery item:", error);
    return NextResponse.json(
      { error: "Failed to add grocery item" },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery-list - Clear all checked items
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await clearCheckedItems(session.user.id);
    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error("Error clearing checked items:", error);
    return NextResponse.json(
      { error: "Failed to clear checked items" },
      { status: 500 }
    );
  }
}

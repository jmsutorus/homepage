import { execute, query, queryOne } from "./index";

// Re-export types from shared types file
export type { 
  GroceryItem, 
  GroceryItemInput, 
  GroceryListByCategory 
} from "@/lib/types/meals";

export { CATEGORY_DISPLAY_NAMES } from "@/lib/types/meals";

import type { 
  IngredientCategory, 
  GroceryItem, 
  GroceryItemInput, 
  GroceryListByCategory 
} from "@/lib/types/meals";

import { INGREDIENT_CATEGORIES } from "@/lib/types/meals";

// ==================== Grocery List CRUD ====================

// Add an item to the grocery list
export async function addGroceryItem(
  data: GroceryItemInput,
  userId: string
): Promise<GroceryItem> {
  const result = await execute(
    `INSERT INTO grocery_items (userId, name, quantity, unit, category, mealId)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.name,
      data.quantity || null,
      data.unit || null,
      data.category || "other",
      data.mealId || null,
    ]
  );

  const item = await queryOne<GroceryItem>(
    "SELECT * FROM grocery_items WHERE id = ?",
    [result.lastInsertRowid]
  );
  if (!item) {
    throw new Error("Failed to add grocery item");
  }
  return item;
}

// Get all grocery items for a user
export async function getGroceryList(userId: string): Promise<GroceryItem[]> {
  return query<GroceryItem>(
    `SELECT * FROM grocery_items 
     WHERE userId = ? 
     ORDER BY checked ASC, category ASC, name ASC`,
    [userId]
  );
}

// Get grocery list grouped by category
export async function getGroceryListByCategory(
  userId: string
): Promise<GroceryListByCategory[]> {
  const items = await getGroceryList(userId);

  // Create a map for all categories
  const categoryMap = new Map<IngredientCategory, GroceryItem[]>();

  // Initialize with empty arrays for all categories
  for (const cat of INGREDIENT_CATEGORIES) {
    categoryMap.set(cat, []);
  }

  // Populate with items
  for (const item of items) {
    const category = item.category as IngredientCategory;
    const list = categoryMap.get(category) || [];
    list.push(item);
    categoryMap.set(category, list);
  }

  // Convert to array, filtering out empty categories
  const result: GroceryListByCategory[] = [];
  for (const cat of INGREDIENT_CATEGORIES) {
    const items = categoryMap.get(cat) || [];
    if (items.length > 0) {
      result.push({ category: cat, items });
    }
  }

  return result;
}

// Update a grocery item with ownership verification
export async function updateGroceryItem(
  id: number,
  userId: string,
  data: Partial<GroceryItemInput & { checked?: boolean }>
): Promise<boolean> {
  const existing = await queryOne<GroceryItem>(
    "SELECT * FROM grocery_items WHERE id = ? AND userId = ?",
    [id, userId]
  );
  if (!existing) return false;

  const updates: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.quantity !== undefined) {
    updates.push("quantity = ?");
    values.push(data.quantity || null);
  }
  if (data.unit !== undefined) {
    updates.push("unit = ?");
    values.push(data.unit || null);
  }
  if (data.category !== undefined) {
    updates.push("category = ?");
    values.push(data.category);
  }
  if (data.checked !== undefined) {
    updates.push("checked = ?");
    values.push(data.checked ? 1 : 0);
  }

  if (updates.length === 0) return true;

  values.push(id, userId);
  const result = await execute(
    `UPDATE grocery_items SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
    values
  );
  return result.changes > 0;
}

// Toggle check state of a grocery item
export async function toggleGroceryItem(
  id: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    `UPDATE grocery_items SET checked = NOT checked WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

// Delete a grocery item with ownership verification
export async function deleteGroceryItem(
  id: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM grocery_items WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

// Clear all checked items from the grocery list
export async function clearCheckedItems(userId: string): Promise<number> {
  const result = await execute(
    "DELETE FROM grocery_items WHERE userId = ? AND checked = 1",
    [userId]
  );
  return result.changes;
}

// Clear the entire grocery list
export async function clearGroceryList(userId: string): Promise<number> {
  const result = await execute(
    "DELETE FROM grocery_items WHERE userId = ?",
    [userId]
  );
  return result.changes;
}

// Import ingredients from a meal to the grocery list
export async function importFromMeal(
  mealId: number,
  userId: string
): Promise<GroceryItem[]> {
  // First verify the meal belongs to this user
  const meal = await queryOne<{ id: number }>(
    "SELECT id FROM meals WHERE id = ? AND userId = ?",
    [mealId, userId]
  );
  if (!meal) {
    throw new Error("Meal not found or unauthorized");
  }

  // Get all ingredients from the meal
  const ingredients = await query<{
    name: string;
    quantity: number | null;
    unit: string | null;
    category: string;
  }>(
    "SELECT name, quantity, unit, category FROM meal_ingredients WHERE mealId = ?",
    [mealId]
  );

  // Add each ingredient to the grocery list
  const addedItems: GroceryItem[] = [];
  for (const ingredient of ingredients) {
    const item = await addGroceryItem(
      {
        name: ingredient.name,
        quantity: ingredient.quantity || undefined,
        unit: ingredient.unit || undefined,
        category: (ingredient.category as IngredientCategory) || "other",
        mealId: mealId,
      },
      userId
    );
    addedItems.push(item);
  }

  return addedItems;
}

// Get grocery list statistics
export async function getGroceryStats(
  userId: string
): Promise<{ total: number; checked: number; unchecked: number }> {
  const stats = await queryOne<{ total: number; checked: number }>(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN checked = 1 THEN 1 ELSE 0 END) as checked
     FROM grocery_items 
     WHERE userId = ?`,
    [userId]
  );

  return {
    total: stats?.total || 0,
    checked: stats?.checked || 0,
    unchecked: (stats?.total || 0) - (stats?.checked || 0),
  };
}

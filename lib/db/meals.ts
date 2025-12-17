import { execute, query, queryOne } from "./index";

// Re-export types from shared types file
export type {
  IngredientCategory,
  Meal,
  MealIngredient,
  MealInput,
  IngredientInput,
  MealWithIngredients,
} from "@/lib/types/meals";

export {
  INGREDIENT_CATEGORIES,
  parseSteps,
  parseTags,
  getTotalTime,
  formatTime,
} from "@/lib/types/meals";

import type { Meal, MealIngredient, MealInput, IngredientInput, MealWithIngredients } from "@/lib/types/meals";

// ==================== Meal CRUD ====================

// Create a new meal
export async function createMeal(
  data: MealInput,
  userId: string
): Promise<Meal> {
  const result = await execute(
    `INSERT INTO meals (userId, name, description, steps, servings, prep_time, cook_time, image_url, tags, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.name,
      data.description || null,
      data.steps ? JSON.stringify(data.steps) : null,
      data.servings || 1,
      data.prep_time || null,
      data.cook_time || null,
      data.image_url || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.rating || null,
    ]
  );

  const meal = await getMealById(result.lastInsertRowid as number, userId);
  if (!meal) {
    throw new Error("Failed to create meal");
  }
  return meal;
}

// Get a meal by ID with ownership verification
export async function getMealById(
  id: number,
  userId: string
): Promise<Meal | undefined> {
  return queryOne<Meal>("SELECT * FROM meals WHERE id = ? AND userId = ?", [
    id,
    userId,
  ]);
}

// Get all meals for a user
export async function getAllMeals(userId: string): Promise<Meal[]> {
  return query<Meal>(
    "SELECT * FROM meals WHERE userId = ? ORDER BY name ASC",
    [userId]
  );
}

// Get meal with ingredients
export async function getMealWithIngredients(
  id: number,
  userId: string
): Promise<MealWithIngredients | undefined> {
  const meal = await getMealById(id, userId);
  if (!meal) return undefined;

  const ingredients = await query<MealIngredient>(
    "SELECT * FROM meal_ingredients WHERE mealId = ? ORDER BY order_index ASC",
    [id]
  );

  return { ...meal, ingredients };
}

// Update a meal with ownership verification
export async function updateMeal(
  id: number,
  userId: string,
  data: Partial<MealInput>
): Promise<boolean> {
  const meal = await getMealById(id, userId);
  if (!meal) return false;

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description || null);
  }
  if (data.steps !== undefined) {
    updates.push("steps = ?");
    values.push(data.steps ? JSON.stringify(data.steps) : null);
  }
  if (data.servings !== undefined) {
    updates.push("servings = ?");
    values.push(data.servings);
  }
  if (data.prep_time !== undefined) {
    updates.push("prep_time = ?");
    values.push(data.prep_time || null);
  }
  if (data.cook_time !== undefined) {
    updates.push("cook_time = ?");
    values.push(data.cook_time || null);
  }
  if (data.image_url !== undefined) {
    updates.push("image_url = ?");
    values.push(data.image_url || null);
  }
  if (data.tags !== undefined) {
    updates.push("tags = ?");
    values.push(data.tags ? JSON.stringify(data.tags) : null);
  }
  if (data.rating !== undefined) {
    updates.push("rating = ?");
    values.push(data.rating || null);
  }

  if (updates.length === 0) return true;

  values.push(id, userId);
  await execute(
    `UPDATE meals SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
    values
  );
  return true;
}

// Delete a meal with ownership verification
export async function deleteMeal(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM meals WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

// Search meals by name
export async function searchMeals(
  userId: string,
  searchTerm: string
): Promise<Meal[]> {
  return query<Meal>(
    `SELECT * FROM meals WHERE userId = ? AND name LIKE ? ORDER BY name ASC`,
    [userId, `%${searchTerm}%`]
  );
}

// ==================== Ingredient CRUD ====================

// Add an ingredient to a meal
export async function addIngredient(
  mealId: number,
  data: IngredientInput
): Promise<MealIngredient> {
  // Get the next order_index if not provided
  let orderIndex = data.order_index;
  if (orderIndex === undefined) {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      "SELECT MAX(order_index) as max_order FROM meal_ingredients WHERE mealId = ?",
      [mealId]
    );
    orderIndex = (maxOrder?.max_order ?? -1) + 1;
  }

  const result = await execute(
    `INSERT INTO meal_ingredients (mealId, name, quantity, unit, category, notes, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      mealId,
      data.name,
      data.quantity || null,
      data.unit || null,
      data.category || "other",
      data.notes || null,
      orderIndex,
    ]
  );

  const ingredient = await queryOne<MealIngredient>(
    "SELECT * FROM meal_ingredients WHERE id = ?",
    [result.lastInsertRowid]
  );
  if (!ingredient) {
    throw new Error("Failed to add ingredient");
  }
  return ingredient;
}

// Get all ingredients for a meal
export async function getIngredients(mealId: number): Promise<MealIngredient[]> {
  return query<MealIngredient>(
    "SELECT * FROM meal_ingredients WHERE mealId = ? ORDER BY order_index ASC",
    [mealId]
  );
}

// Update an ingredient
export async function updateIngredient(
  id: number,
  data: Partial<IngredientInput>
): Promise<boolean> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

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
  if (data.notes !== undefined) {
    updates.push("notes = ?");
    values.push(data.notes || null);
  }
  if (data.order_index !== undefined) {
    updates.push("order_index = ?");
    values.push(data.order_index);
  }

  if (updates.length === 0) return true;

  values.push(id);
  const result = await execute(
    `UPDATE meal_ingredients SET ${updates.join(", ")} WHERE id = ?`,
    values
  );
  return result.changes > 0;
}

// Delete an ingredient
export async function deleteIngredient(id: number): Promise<boolean> {
  const result = await execute("DELETE FROM meal_ingredients WHERE id = ?", [id]);
  return result.changes > 0;
}

// Delete all ingredients for a meal
export async function deleteAllIngredients(mealId: number): Promise<number> {
  const result = await execute("DELETE FROM meal_ingredients WHERE mealId = ?", [mealId]);
  return result.changes;
}

// Reorder ingredients
export async function reorderIngredients(
  mealId: number,
  orderedIds: number[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await execute(
      "UPDATE meal_ingredients SET order_index = ? WHERE id = ? AND mealId = ?",
      [i, orderedIds[i], mealId]
    );
  }
}

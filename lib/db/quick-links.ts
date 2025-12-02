import { execute, query, queryOne } from "./index";

export interface QuickLinkCategory {
  id: number;
  userId: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuickLink {
  id: number;
  userId: string;
  category_id: number;
  title: string;
  url: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuickLinkCategoryWithLinks extends QuickLinkCategory {
  links: QuickLink[];
}

/**
 * Get all categories with their links for a user
 */
export async function getUserQuickLinks(userId: string): Promise<QuickLinkCategoryWithLinks[]> {
  const categories = await query<QuickLinkCategory>(
    `SELECT * FROM quick_link_categories
     WHERE userId = ?
     ORDER by order_index ASC`,
    [userId]
  );

  return Promise.all(categories.map(async (category) => {
    const links = await query<QuickLink>(
      `SELECT * FROM quick_links
       WHERE category_id = ? AND userId = ?
       ORDER BY order_index ASC`,
      [category.id, userId]
    );

    return {
      ...category,
      links,
    };
  }));
}

/**
 * Create a new category
 */
export async function createCategory(
  userId: string,
  name: string,
  orderIndex?: number
): Promise<QuickLinkCategory> {
  // If no order specified, add to end
  if (orderIndex === undefined) {
    const maxOrder = await queryOne<{ max_order: number }>(
      "SELECT COALESCE(MAX(order_index), -1) as max_order FROM quick_link_categories WHERE userId = ?",
      [userId]
    );
    orderIndex = (maxOrder?.max_order ?? -1) + 1;
  }

  const result = await execute(
    "INSERT INTO quick_link_categories (userId, name, order_index) VALUES (?, ?, ?)",
    [userId, name, orderIndex]
  );

  const category = await getCategoryById(Number(result.lastInsertRowid), userId);
  if (!category) {
    throw new Error("Failed to create category");
  }

  return category;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number, userId: string): Promise<QuickLinkCategory | undefined> {
  return await queryOne<QuickLinkCategory>(
    "SELECT * FROM quick_link_categories WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update category
 */
export async function updateCategory(
  id: number,
  userId: string,
  updates: Partial<Pick<QuickLinkCategory, "name" | "order_index">>
): Promise<boolean> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    params.push(updates.name);
  }

  if (updates.order_index !== undefined) {
    fields.push("order_index = ?");
    params.push(updates.order_index);
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id, userId);
  const sql = `UPDATE quick_link_categories SET ${fields.join(", ")} WHERE id = ? AND userId = ?`;
  const result = await execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete category and all its links
 */
export async function deleteCategory(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM quick_link_categories WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Reorder categories
 */
export async function reorderCategories(userId: string, categoryIds: number[]): Promise<void> {
  // Execute updates sequentially
  for (let index = 0; index < categoryIds.length; index++) {
    await execute(
      "UPDATE quick_link_categories SET order_index = ? WHERE id = ? AND userId = ?",
      [index, categoryIds[index], userId]
    );
  }
}

/**
 * Create a new link
 */
export async function createLink(
  userId: string,
  categoryId: number,
  title: string,
  url: string,
  icon: string = "link",
  orderIndex?: number
): Promise<QuickLink> {
  // If no order specified, add to end of category
  if (orderIndex === undefined) {
    const maxOrder = await queryOne<{ max_order: number }>(
      "SELECT COALESCE(MAX(order_index), -1) as max_order FROM quick_links WHERE category_id = ? AND userId = ?",
      [categoryId, userId]
    );
    orderIndex = (maxOrder?.max_order ?? -1) + 1;
  }

  const result = await execute(
    "INSERT INTO quick_links (userId, category_id, title, url, icon, order_index) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, categoryId, title, url, icon, orderIndex]
  );

  const link = await getLinkById(Number(result.lastInsertRowid), userId);
  if (!link) {
    throw new Error("Failed to create link");
  }

  return link;
}

/**
 * Get link by ID
 */
export async function getLinkById(id: number, userId: string): Promise<QuickLink | undefined> {
  return await queryOne<QuickLink>(
    "SELECT * FROM quick_links WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update link
 */
export async function updateLink(
  id: number,
  userId: string,
  updates: Partial<Pick<QuickLink, "title" | "url" | "icon" | "order_index" | "category_id">>
): Promise<boolean> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }

  if (updates.url !== undefined) {
    fields.push("url = ?");
    params.push(updates.url);
  }

  if (updates.icon !== undefined) {
    fields.push("icon = ?");
    params.push(updates.icon);
  }

  if (updates.order_index !== undefined) {
    fields.push("order_index = ?");
    params.push(updates.order_index);
  }

  if (updates.category_id !== undefined) {
    fields.push("category_id = ?");
    params.push(updates.category_id);
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id, userId);
  const sql = `UPDATE quick_links SET ${fields.join(", ")} WHERE id = ? AND userId = ?`;
  const result = await execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete link
 */
export async function deleteLink(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM quick_links WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Reorder links within a category
 */
export async function reorderLinks(userId: string, categoryId: number, linkIds: number[]): Promise<void> {
  // Execute updates sequentially
  for (let index = 0; index < linkIds.length; index++) {
    await execute(
      "UPDATE quick_links SET order_index = ? WHERE id = ? AND userId = ? AND category_id = ?",
      [index, linkIds[index], userId, categoryId]
    );
  }
}

/**
 * Initialize default quick links for a new user
 */
export async function initializeDefaultQuickLinks(userId: string): Promise<void> {
  // Create Development category
  const devCat = await createCategory(userId, "Development", 0);
  await createLink(userId, devCat.id, "GitHub", "https://github.com", "github", 0);
  await createLink(userId, devCat.id, "Stack Overflow", "https://stackoverflow.com", "layers", 1);
  await createLink(userId, devCat.id, "MDN Web Docs", "https://developer.mozilla.org", "book-open", 2);
  await createLink(userId, devCat.id, "npm", "https://www.npmjs.com", "package", 3);

  // Create Social category
  const socialCat = await createCategory(userId, "Social", 1);
  await createLink(userId, socialCat.id, "Twitter/X", "https://twitter.com", "twitter", 0);
  await createLink(userId, socialCat.id, "Reddit", "https://reddit.com", "message-circle", 1);
  await createLink(userId, socialCat.id, "LinkedIn", "https://linkedin.com", "linkedin", 2);

  // Create Tools category
  const toolsCat = await createCategory(userId, "Tools", 2);
  await createLink(userId, toolsCat.id, "ChatGPT", "https://chat.openai.com", "bot", 0);
  await createLink(userId, toolsCat.id, "Claude", "https://claude.ai", "sparkles", 1);
  await createLink(userId, toolsCat.id, "Figma", "https://figma.com", "figma", 2);
  await createLink(userId, toolsCat.id, "Vercel", "https://vercel.com", "triangle", 3);

  // Create Entertainment category
  const entertainmentCat = await createCategory(userId, "Entertainment", 3);
  await createLink(userId, entertainmentCat.id, "YouTube", "https://youtube.com", "youtube", 0);
  await createLink(userId, entertainmentCat.id, "Netflix", "https://netflix.com", "tv", 1);
  await createLink(userId, entertainmentCat.id, "Spotify", "https://spotify.com", "music", 2);
}

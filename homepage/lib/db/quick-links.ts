import { execute, query, queryOne, getDatabase } from "./index";

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
export function getUserQuickLinks(userId: string): QuickLinkCategoryWithLinks[] {
  const categories = query<QuickLinkCategory>(
    `SELECT * FROM quick_link_categories
     WHERE userId = ?
     ORDER BY order_index ASC`,
    [userId]
  );

  return categories.map((category) => {
    const links = query<QuickLink>(
      `SELECT * FROM quick_links
       WHERE category_id = ? AND userId = ?
       ORDER BY order_index ASC`,
      [category.id, userId]
    );

    return {
      ...category,
      links,
    };
  });
}

/**
 * Create a new category
 */
export function createCategory(
  userId: string,
  name: string,
  orderIndex?: number
): QuickLinkCategory {
  // If no order specified, add to end
  if (orderIndex === undefined) {
    const maxOrder = queryOne<{ max_order: number }>(
      "SELECT COALESCE(MAX(order_index), -1) as max_order FROM quick_link_categories WHERE userId = ?",
      [userId]
    );
    orderIndex = (maxOrder?.max_order ?? -1) + 1;
  }

  const result = execute(
    "INSERT INTO quick_link_categories (userId, name, order_index) VALUES (?, ?, ?)",
    [userId, name, orderIndex]
  );

  const category = getCategoryById(Number(result.lastInsertRowid), userId);
  if (!category) {
    throw new Error("Failed to create category");
  }

  return category;
}

/**
 * Get category by ID
 */
export function getCategoryById(id: number, userId: string): QuickLinkCategory | undefined {
  return queryOne<QuickLinkCategory>(
    "SELECT * FROM quick_link_categories WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update category
 */
export function updateCategory(
  id: number,
  userId: string,
  updates: Partial<Pick<QuickLinkCategory, "name" | "order_index">>
): boolean {
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
  const result = execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete category and all its links
 */
export function deleteCategory(id: number, userId: string): boolean {
  const result = execute(
    "DELETE FROM quick_link_categories WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Reorder categories
 */
export function reorderCategories(userId: string, categoryIds: number[]): void {
  const db = getDatabase();
  const transaction = db.transaction(() => {
    categoryIds.forEach((categoryId, index) => {
      execute(
        "UPDATE quick_link_categories SET order_index = ? WHERE id = ? AND userId = ?",
        [index, categoryId, userId]
      );
    });
  });

  transaction();
}

/**
 * Create a new link
 */
export function createLink(
  userId: string,
  categoryId: number,
  title: string,
  url: string,
  icon: string = "link",
  orderIndex?: number
): QuickLink {
  // If no order specified, add to end of category
  if (orderIndex === undefined) {
    const maxOrder = queryOne<{ max_order: number }>(
      "SELECT COALESCE(MAX(order_index), -1) as max_order FROM quick_links WHERE category_id = ? AND userId = ?",
      [categoryId, userId]
    );
    orderIndex = (maxOrder?.max_order ?? -1) + 1;
  }

  const result = execute(
    "INSERT INTO quick_links (userId, category_id, title, url, icon, order_index) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, categoryId, title, url, icon, orderIndex]
  );

  const link = getLinkById(Number(result.lastInsertRowid), userId);
  if (!link) {
    throw new Error("Failed to create link");
  }

  return link;
}

/**
 * Get link by ID
 */
export function getLinkById(id: number, userId: string): QuickLink | undefined {
  return queryOne<QuickLink>(
    "SELECT * FROM quick_links WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

/**
 * Update link
 */
export function updateLink(
  id: number,
  userId: string,
  updates: Partial<Pick<QuickLink, "title" | "url" | "icon" | "order_index" | "category_id">>
): boolean {
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
  const result = execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete link
 */
export function deleteLink(id: number, userId: string): boolean {
  const result = execute(
    "DELETE FROM quick_links WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Reorder links within a category
 */
export function reorderLinks(userId: string, categoryId: number, linkIds: number[]): void {
  const db = getDatabase();
  const transaction = db.transaction(() => {
    linkIds.forEach((linkId, index) => {
      execute(
        "UPDATE quick_links SET order_index = ? WHERE id = ? AND userId = ? AND category_id = ?",
        [index, linkId, userId, categoryId]
      );
    });
  });

  transaction();
}

/**
 * Initialize default quick links for a new user
 */
export function initializeDefaultQuickLinks(userId: string): void {
  const db = getDatabase();
  const transaction = db.transaction(() => {
    // Create Development category
    const devCat = createCategory(userId, "Development", 0);
    createLink(userId, devCat.id, "GitHub", "https://github.com", "github", 0);
    createLink(userId, devCat.id, "Stack Overflow", "https://stackoverflow.com", "layers", 1);
    createLink(userId, devCat.id, "MDN Web Docs", "https://developer.mozilla.org", "book-open", 2);
    createLink(userId, devCat.id, "npm", "https://www.npmjs.com", "package", 3);

    // Create Social category
    const socialCat = createCategory(userId, "Social", 1);
    createLink(userId, socialCat.id, "Twitter/X", "https://twitter.com", "twitter", 0);
    createLink(userId, socialCat.id, "Reddit", "https://reddit.com", "message-circle", 1);
    createLink(userId, socialCat.id, "LinkedIn", "https://linkedin.com", "linkedin", 2);

    // Create Tools category
    const toolsCat = createCategory(userId, "Tools", 2);
    createLink(userId, toolsCat.id, "ChatGPT", "https://chat.openai.com", "bot", 0);
    createLink(userId, toolsCat.id, "Claude", "https://claude.ai", "sparkles", 1);
    createLink(userId, toolsCat.id, "Figma", "https://figma.com", "figma", 2);
    createLink(userId, toolsCat.id, "Vercel", "https://vercel.com", "triangle", 3);

    // Create Entertainment category
    const entertainmentCat = createCategory(userId, "Entertainment", 3);
    createLink(userId, entertainmentCat.id, "YouTube", "https://youtube.com", "youtube", 0);
    createLink(userId, entertainmentCat.id, "Netflix", "https://netflix.com", "tv", 1);
    createLink(userId, entertainmentCat.id, "Spotify", "https://spotify.com", "music", 2);
  });

  transaction();
}

import { earthboundFetch } from "../api/earthbound";

import {
  type QuickLinkCategory,
  type QuickLink,
  type QuickLinkCategoryWithLinks,
} from "@jmsutorus/earthbound-shared";

export type {
  QuickLinkCategory,
  QuickLink,
  QuickLinkCategoryWithLinks,
};

/**
 * Get all categories with their links for a user
 */
export async function getUserQuickLinks(userId: string): Promise<QuickLinkCategoryWithLinks[]> {
  const res = await earthboundFetch(`/api/quick-links?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Create a new category
 */
export async function createCategory(
  userId: string,
  name: string,
  orderIndex?: number
): Promise<QuickLinkCategory> {
  const res = await earthboundFetch(`/api/quick-links/category?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ name, order_index: orderIndex }),
  });

  if (!res.ok) {
    throw new Error("Failed to create category");
  }

  return await res.json();
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number, userId: string): Promise<QuickLinkCategory | undefined> {
  const res = await earthboundFetch(`/api/quick-links/category/${id}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Update category
 */
export async function updateCategory(
  id: number,
  userId: string,
  updates: Partial<Pick<QuickLinkCategory, "name" | "order_index">>
): Promise<boolean> {
  const res = await earthboundFetch(`/api/quick-links/category/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete category and all its links
 */
export async function deleteCategory(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/quick-links/category/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Reorder categories
 */
export async function reorderCategories(userId: string, categoryIds: number[]): Promise<void> {
  const res = await earthboundFetch(`/api/quick-links/category/reorder?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ categoryIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to reorder categories");
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
  const res = await earthboundFetch(`/api/quick-links/link?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ category_id: categoryId, title, url, icon, order_index: orderIndex }),
  });

  if (!res.ok) {
    throw new Error("Failed to create link");
  }

  return await res.json();
}

/**
 * Get link by ID
 */
export async function getLinkById(id: number, userId: string): Promise<QuickLink | undefined> {
  const res = await earthboundFetch(`/api/quick-links/link/${id}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Update link
 */
export async function updateLink(
  id: number,
  userId: string,
  updates: Partial<Pick<QuickLink, "title" | "url" | "icon" | "order_index" | "category_id">>
): Promise<boolean> {
  const res = await earthboundFetch(`/api/quick-links/link/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete link
 */
export async function deleteLink(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/quick-links/link/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Reorder links within a category
 */
export async function reorderLinks(userId: string, categoryId: number, linkIds: number[]): Promise<void> {
  const res = await earthboundFetch(`/api/quick-links/link/reorder?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ categoryId, linkIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to reorder links");
  }
}

/**
 * Initialize default quick links for a new user
 */
export async function initializeDefaultQuickLinks(userId: string): Promise<void> {
  const res = await earthboundFetch(`/api/quick-links/initialize?userId=${userId}`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error("Failed to initialize default quick links");
  }
}

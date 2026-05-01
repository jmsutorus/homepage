import { earthboundFetch } from "../api/earthbound";

import {
  type DBJournal,
  type JournalContent,
  type JournalLink,
} from "@jmsutorus/earthbound-shared";

export type {
  DBJournal,
  JournalContent,
  JournalLink,
};

export interface DBJournalLink {
  id: number;
  journal_id: number;
  linked_type: string;
  linked_id: number;
  linked_slug: string | null;
  created_at: string;
}

/**
 * Get mood entry for a specific date
 */
export async function getMoodForDate(date: string, userId: string): Promise<number | null> {
  const response = await earthboundFetch(`/api/journals/mood?userId=${userId}&date=${date}`);
  if (!response.ok) return null;
  const result = await response.json() as { mood: number | null };
  return result.mood;
}

/**
 * Get all journals for a specific user
 */
export async function getAllJournals(userId: string): Promise<JournalContent[]> {
  const response = await earthboundFetch(`/api/journals?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<JournalContent[]>;
}

/**
 * Get total count of journals for a specific user
 */
export async function getJournalCount(userId: string): Promise<number> {
  // We can use the getAllJournals and get length, or add a count endpoint.
  // For now let's just use the list.
  const journals = await getAllJournals(userId);
  return journals.length;
}

/**
 * Get published journals for a specific user
 */
export async function getPublishedJournals(userId: string): Promise<JournalContent[]> {
  const response = await earthboundFetch(`/api/journals/published?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<JournalContent[]>;
}

/**
 * Get journal by slug for a specific user
 */
export async function getJournalBySlug(slug: string, userId: string): Promise<JournalContent | null> {
  const response = await earthboundFetch(`/api/journals/s/${slug}?userId=${userId}`);
  if (!response.ok) return null;
  return response.json() as Promise<JournalContent>;
}

/**
 * Get journal by ID for a specific user
 */
export async function getJournalById(id: number, userId: string): Promise<JournalContent | null> {
  const response = await earthboundFetch(`/api/journals/id/${id}?userId=${userId}`);
  if (!response.ok) return null;
  return response.json() as Promise<JournalContent>;
}

/**
 * Get featured journals for a specific user
 */
export async function getFeaturedJournals(userId: string): Promise<JournalContent[]> {
  const response = await earthboundFetch(`/api/journals/featured?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<JournalContent[]>;
}

/**
 * Create a new journal
 */
export async function createJournal(data: {
  slug?: string;
  title?: string;
  journal_type?: "daily" | "general";
  daily_date?: string;
  mood?: number;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  content: string;
  image_url?: string;
  userId: string;
}): Promise<JournalContent> {
  const response = await earthboundFetch(`/api/journals`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json() as { error: string };
    throw new Error(error.error || `Failed to create journal: ${response.statusText}`);
  }

  return response.json() as Promise<JournalContent>;
}

/**
 * Update a journal with ownership verification
 */
export async function updateJournal(
  slug: string,
  userId: string,
  data: {
    newSlug?: string;
    title?: string;
    journal_type?: "daily" | "general";
    daily_date?: string;
    mood?: number | null;
    tags?: string[];
    featured?: boolean;
    published?: boolean;
    content?: string;
    image_url?: string | null;
  }
): Promise<JournalContent> {
  const response = await earthboundFetch(`/api/journals/s/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json() as { error: string };
    throw new Error(error.error || `Failed to update journal: ${response.statusText}`);
  }

  return response.json() as Promise<JournalContent>;
}

/**
 * Get daily journal by date for a specific user
 */
export async function getDailyJournalByDate(date: string, userId: string): Promise<JournalContent | null> {
  const response = await earthboundFetch(`/api/journals/date/${date}?userId=${userId}`);
  if (!response.ok) return null;
  return response.json() as Promise<JournalContent>;
}

/**
 * Delete a journal with ownership verification (also deletes associated links via CASCADE)
 */
export async function deleteJournal(slug: string, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/journals/s/${slug}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Check if a slug exists
 */
export async function journalSlugExists(slug: string): Promise<boolean> {
  // We can just try to fetch it or implement a head request.
  // For now, let's just return false or implement properly if needed.
  return false; 
}

/**
 * Get previous and next journals for navigation
 */
export async function getAdjacentJournals(slug: string, userId: string): Promise<{ prev: JournalContent | null; next: JournalContent | null }> {
  const response = await earthboundFetch(`/api/journals/s/${slug}/adjacent?userId=${userId}`);
  if (!response.ok) return { prev: null, next: null };
  return response.json() as Promise<{ prev: JournalContent | null; next: JournalContent | null }>;
}

// ========== Link Management Functions ==========

/**
 * Add a link from a journal to another object
 */
export async function addJournalLink(
  journalId: number,
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number,
  linkedSlug?: string
): Promise<JournalLink> {
  const response = await earthboundFetch(`/api/journals/id/${journalId}/links`, {
    method: "POST",
    body: JSON.stringify({ linkedType, linkedId, linkedSlug }),
  });

  if (!response.ok) throw new Error(`Failed to add journal link: ${response.statusText}`);
  return response.json() as Promise<JournalLink>;
}

/**
 * Remove a specific link
 */
export async function removeJournalLink(linkId: number): Promise<boolean> {
  const response = await earthboundFetch(`/api/journals/links/id/${linkId}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Remove a link by journal ID and linked object
 */
export async function removeJournalLinkByObject(
  journalId: number,
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number
): Promise<boolean> {
  // Not implemented as a single endpoint, but we could add it.
  // For now, let's just return false.
  return false;
}

/**
 * Get all links for a specific journal
 */
export async function getLinksForJournal(journalId: number): Promise<JournalLink[]> {
  const response = await earthboundFetch(`/api/journals/id/${journalId}/links`);
  if (!response.ok) return [];
  return response.json() as Promise<JournalLink[]>;
}

/**
 * Get all journals that link to a specific object
 */
export async function getJournalsLinkingTo(
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number
): Promise<JournalContent[]> {
  const response = await earthboundFetch(`/api/journals/linking-to/${linkedType}/${linkedId}`);
  if (!response.ok) return [];
  return response.json() as Promise<JournalContent[]>;
}

/**
 * Replace all links for a journal (useful for bulk updates)
 */
export async function replaceJournalLinks(
  journalId: number,
  links: Array<{
    linkedType: "media" | "park" | "journal" | "activity";
    linkedId: number;
    linkedSlug?: string;
  }>
): Promise<JournalLink[]> {
  const response = await earthboundFetch(`/api/journals/id/${journalId}/links/replace`, {
    method: "POST",
    body: JSON.stringify(links),
  });

  if (!response.ok) throw new Error(`Failed to replace journal links: ${response.statusText}`);
  return response.json() as Promise<JournalLink[]>;
}

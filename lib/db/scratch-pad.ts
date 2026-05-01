import { earthboundFetch } from "../api/earthbound";

export interface ScratchPad {
  userId: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get scratch pad for a user (creates empty one if doesn't exist)
 */
export async function getScratchPad(userId: string): Promise<ScratchPad> {
  const res = await earthboundFetch(`/api/scratch-pad?userId=${userId}`);
  if (!res.ok) {
    throw new Error("Failed to get scratch pad");
  }
  return await res.json();
}

/**
 * Update scratch pad content (upsert)
 */
export async function updateScratchPad(
  userId: string,
  content: string
): Promise<ScratchPad> {
  const res = await earthboundFetch(`/api/scratch-pad?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("Failed to update scratch pad");
  }

  return await res.json();
}

/**
 * Delete scratch pad (clears content)
 */
export async function deleteScratchPad(userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/scratch-pad?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

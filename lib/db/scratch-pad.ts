import { execute, queryOne } from "./index";

export interface ScratchPad {
  id: number;
  userId: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get scratch pad for a user (creates empty one if doesn't exist)
 */
export async function getScratchPad(userId: string): Promise<ScratchPad> {
  let scratchPad = await queryOne<ScratchPad>(
    "SELECT * FROM scratch_pads WHERE userId = ?",
    [userId]
  );

  // If no scratch pad exists, create an empty one
  if (!scratchPad) {
    await execute(
      "INSERT INTO scratch_pads (userId, content) VALUES (?, ?)",
      [userId, ""]
    );

    scratchPad = await queryOne<ScratchPad>(
      "SELECT * FROM scratch_pads WHERE userId = ?",
      [userId]
    );

    if (!scratchPad) {
      throw new Error("Failed to create scratch pad");
    }
  }

  return scratchPad;
}

/**
 * Update scratch pad content (upsert)
 */
export async function updateScratchPad(
  userId: string,
  content: string
): Promise<ScratchPad> {
  await execute(
    `INSERT INTO scratch_pads (userId, content)
     VALUES (?, ?)
     ON CONFLICT(userId) DO UPDATE SET
       content = excluded.content,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, content]
  );

  const scratchPad = await queryOne<ScratchPad>(
    "SELECT * FROM scratch_pads WHERE userId = ?",
    [userId]
  );

  if (!scratchPad) {
    throw new Error("Failed to update scratch pad");
  }

  return scratchPad;
}

/**
 * Delete scratch pad (clears content)
 */
export async function deleteScratchPad(userId: string): Promise<boolean> {
  const result = await execute(
    "DELETE FROM scratch_pads WHERE userId = ?",
    [userId]
  );

  return result.changes > 0;
}

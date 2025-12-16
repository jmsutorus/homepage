"use server";

import { auth } from "@/auth";
import { query } from "@/lib/db";
import { getDatabase } from "../db";

export interface ConnectedAccount {
  providerId: string;
  createdAt: number;
  accessTokenExpiresAt?: number;
  accountId?: string;
}

/**
 * Get the list of connected accounts for the current user
 */
export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  try {
    const accounts = await query<ConnectedAccount>(
      "SELECT providerId, createdAt, accessTokenExpiresAt FROM account WHERE userId = ?",
      [session.user.id]
    );

    return accounts.map((account: any) => ({
      providerId: account.providerId,
      createdAt: new Date(account.createdAt).getTime(),
      accessTokenExpiresAt: account.accessTokenExpiresAt
        ? new Date(account.accessTokenExpiresAt).getTime()
        : undefined,
      // For Duolingo, we might want to return the username which is stored in providerAccountId or accessToken?
      // But the schema says accountId is NOT NULL, providerId is NOT NULL.
      // We will store username in 'accountId' for Duolingo.
      accountId: account.providerId === 'duolingo' ? account.accountId : undefined
    }));
  } catch (error) {
    console.error("Failed to fetch connected accounts:", error);
    return [];
  }
}

/**
 * Connect Duolingo account (store username)
 */
export async function connectDuolingo(username: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const db = getDatabase();

    // Check if valid username by fetching profile
    // We import dynamically to avoid circular deps if any
    const { getDuolingoProfile } = await import("@/lib/api/duolingo");
    const profile = await getDuolingoProfile(username);

    if (!profile) {
      return { success: false, error: "Duolingo user not found" };
    }


    const now = Date.now();

    // Using explicit SQL with standard quoting to be safe
    // If userId column is missing, the logs above would reveal it (if we could see them).
    // Assuming standard schema from adapter.ts
    const result = await db.execute(
      `INSERT INTO account (id, userId, accountId, providerId, createdAt, updatedAt)
       VALUES (?, ?, ?, 'duolingo', ?, ?)
       ON CONFLICT(userId, providerId) DO UPDATE SET
       accountId = excluded.accountId,
       updatedAt = excluded.updatedAt`,
      [crypto.randomUUID(), session.user.id, username, now, now]
    );

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/settings");
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Failed to connect Duolingo:", error);
    // Be more descriptive to user
    return { success: false, error: `Connection failed: ${(error as Error).message}` };
  }
}

/**
 * Disconnect Duolingo account
 */
export async function disconnectDuolingo(): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM account WHERE userId = ? AND providerId = 'duolingo'",
      args: [session.user.id]
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/settings");
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Failed to disconnect Duolingo:", error);
    return { success: false, error: "Failed to disconnect account" };
  }
}

/**
 * Toggle Duolingo lesson completion for a given date
 */
export async function toggleDuolingoLessonCompletion(date: string): Promise<{ success: boolean; completed?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { toggleDuolingoCompletion } = await import("@/lib/db/duolingo");
    const completed = await toggleDuolingoCompletion(session.user.id, date);

    // Check for achievements when marking as complete
    if (completed) {
      const { checkAchievement } = await import("@/lib/achievements");
      checkAchievement(session.user.id, 'duolingo').catch(console.error);
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/home");

    return { success: true, completed };
  } catch (error) {
    console.error("Failed to toggle Duolingo completion:", error);
    return { success: false, error: "Failed to update completion status" };
  }
}


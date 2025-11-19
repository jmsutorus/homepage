"use server";

import { auth } from "@/auth";
import { queryOne } from "@/lib/db";
import { syncStravaData } from "@/lib/services/strava-sync";
import { revalidatePath } from "next/cache";

export interface SyncState {
  success: boolean;
  message: string;
  activitiesSynced?: number;
}

export async function syncStravaActivities(): Promise<SyncState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" };
    }

    // Get Strava access token from account table
    const account = queryOne<{ accessToken: string; refreshToken: string }>(
      "SELECT accessToken, refreshToken FROM account WHERE userId = ? AND providerId = 'strava'",
      [session.user.id]
    );

    if (!account?.accessToken) {
      return { success: false, message: "Strava account not connected" };
    }

    // Perform sync
    // Note: In a production app, we should handle token refresh here if needed,
    // but NextAuth usually handles this if configured correctly or we might need a manual refresh flow.
    // For now, we assume the token is valid or NextAuth keeps it fresh.
    const result = await syncStravaData(account.accessToken);

    if (!result.success) {
      return { success: false, message: result.error || "Failed to sync" };
    }

    revalidatePath("/exercise");
    return {
      success: true,
      message: "Sync completed successfully",
      activitiesSynced: result.activitiesSynced,
    };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

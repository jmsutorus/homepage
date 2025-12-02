"use server";

import { auth } from "@/auth";
import { syncStravaData } from "@/lib/services/strava-sync";
import { getValidStravaToken } from "@/lib/auth/strava-token";
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

    // Get valid Strava access token (refreshes if needed)
    let accessToken: string;
    try {
      accessToken = await getValidStravaToken(session.user.id);
    } catch (error) {
      console.error("Token retrieval error:", error);
      return { 
        success: false, 
        message: "Failed to authenticate with Strava. Please reconnect your account in Settings." 
      };
    }

    // Perform sync
    const result = await syncStravaData(accessToken, session.user.id);

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

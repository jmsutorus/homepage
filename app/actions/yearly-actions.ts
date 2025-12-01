"use server";

import { requireAuth } from "@/lib/auth/server";
import { syncYearlySteamData } from "@/lib/data/yearly-data";
import { revalidatePath } from "next/cache";

export async function syncSteamDataAction(year: number) {
  const session = await requireAuth();

  try {
    await syncYearlySteamData(session.user.id, year);
    revalidatePath(`/year/${year}`);
    return { success: true };
  } catch (error) {
    console.error("Steam sync action failed:", error);
    return { success: false, error: "Failed to sync Steam data" };
  }
}

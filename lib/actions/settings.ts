"use server";

import { auth } from "@/auth";
import { query } from "@/lib/db";

export interface ConnectedAccount {
  providerId: string;
  createdAt: number;
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
    const accounts = query<ConnectedAccount>(
      "SELECT providerId, createdAt FROM account WHERE userId = ?",
      [session.user.id]
    );

    return accounts;
  } catch (error) {
    console.error("Failed to fetch connected accounts:", error);
    return [];
  }
}

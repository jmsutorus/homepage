"use server";

import { auth } from "@/auth";
import { query } from "@/lib/db";

export interface ConnectedAccount {
  providerId: string;
  createdAt: number;
  accessTokenExpiresAt?: number;
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
    }));
  } catch (error) {
    console.error("Failed to fetch connected accounts:", error);
    return [];
  }
}

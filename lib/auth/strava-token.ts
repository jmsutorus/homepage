import { queryOne, execute } from "@/lib/db";

interface TokenResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

interface AccountTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

/**
 * Get the current Strava tokens for a user from the database
 */
export async function getStravaTokens(userId: string): Promise<AccountTokens | null> {
  const account = await queryOne<AccountTokens>(
    "SELECT accessToken, refreshToken, accessTokenExpiresAt FROM account WHERE userId = ? AND providerId = 'strava'",
    [userId]
  );

  if (!account?.accessToken || !account?.refreshToken) {
    return null;
  }

  return account;
}

/**
 * Update Strava tokens in the database
 */
export async function updateStravaTokens(userId: string, tokens: TokenResponse): Promise<void> {
  await execute(
    `UPDATE account
     SET accessToken = ?, refreshToken = ?, accessTokenExpiresAt = ?, updatedAt = ?
     WHERE userId = ? AND providerId = 'strava'`,
    [
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_at,
      Math.floor(Date.now() / 1000),
      userId,
    ]
  );
}

/**
 * Refresh the Strava access token using the refresh token
 */
export async function refreshStravaToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.AUTH_STRAVA_ID;
  const clientSecret = process.env.AUTH_STRAVA_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Strava client ID or secret not configured");
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh Strava token: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get a valid Strava access token, refreshing it if necessary
 */
export async function getValidStravaToken(userId: string): Promise<string> {
  const tokens = await getStravaTokens(userId);

  if (!tokens) {
    throw new Error("Strava account not connected");
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const isExpired = tokens.accessTokenExpiresAt && tokens.accessTokenExpiresAt < now + 300;

  if (!isExpired) {
    return tokens.accessToken;
  }

  try {
    console.log("Refreshing Strava token for user", userId);
    const newTokens = await refreshStravaToken(tokens.refreshToken);
    await updateStravaTokens(userId, newTokens);
    return newTokens.access_token;
  } catch (error) {
    console.error("Error refreshing Strava token:", error);
    // If refresh fails, we might want to throw a specific error so the UI can prompt re-auth
    throw new Error("Failed to refresh Strava token. Please reconnect your account.");
  }
}

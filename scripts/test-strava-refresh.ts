import { config } from "dotenv";
config({ path: ".env.local" });
import { getDatabase, queryOne, execute } from "../lib/db";
import { getValidStravaToken } from "../lib/auth/strava-token";

async function main() {
  const db = getDatabase();

  // 1. Find a user with a Strava account
  const account = await queryOne<{ userId: string; accessToken: string; refreshToken: string; accessTokenExpiresAt: number }>(
    "SELECT userId, accessToken, refreshToken, accessTokenExpiresAt FROM account WHERE providerId = 'strava' LIMIT 1"
  );

  if (!account) {
    console.log("No Strava account found to test with.");
    return;
  }

  console.log(`Found Strava account for user: ${account.userId}`);
  console.log(`Current expiresAt: ${account.accessTokenExpiresAt} (${new Date(account.accessTokenExpiresAt * 1000).toISOString()})`);

  // 2. Manually expire the token (set expiresAt to 1 hour ago)
  const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
  await execute(
    "UPDATE account SET accessTokenExpiresAt = ? WHERE userId = ? AND providerId = 'strava'",
    [oneHourAgo, account.userId]
  );
  console.log(`Manually expired token to: ${oneHourAgo} (${new Date(oneHourAgo * 1000).toISOString()})`);

  // 3. Attempt to get a valid token (should trigger refresh)
  console.log("Attempting to get valid token...");
  try {
    const newToken = await getValidStravaToken(account.userId);
    console.log("Successfully retrieved token.");

    // 4. Verify the token was updated in the DB
    const updatedAccount = await queryOne<{ accessToken: string; accessTokenExpiresAt: number }>(
      "SELECT accessToken, accessTokenExpiresAt FROM account WHERE userId = ? AND providerId = 'strava'",
      [account.userId]
    );

    if (!updatedAccount) {
      console.error("Failed to retrieve updated account.");
      return;
    }

    console.log(`New expiresAt: ${updatedAccount.accessTokenExpiresAt} (${new Date(updatedAccount.accessTokenExpiresAt * 1000).toISOString()})`);

    if (updatedAccount.accessTokenExpiresAt > Math.floor(Date.now() / 1000)) {
      console.log("✅ Token was successfully refreshed and updated in DB.");
    } else {
      console.error("❌ Token expiration was not updated.");
    }

    if (newToken === updatedAccount.accessToken) {
      console.log("✅ Returned token matches DB token.");
    } else {
      console.error("❌ Returned token does not match DB token.");
    }

  } catch (error) {
    console.error("❌ Failed to refresh token:", error);
  }
}

main().catch(console.error);

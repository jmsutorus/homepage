import { getDatabase } from "../lib/db";

async function applyMigration() {
  console.log("Applying migration: Add userId column to api_cache table");

  const db = getDatabase();

  try {
    // Check if userId column already exists
    const tableInfo = await db.execute("PRAGMA table_info(api_cache)");
    const hasUserId = tableInfo.rows.some((row: any) => row.name === "userId");

    if (hasUserId) {
      console.log("✓ userId column already exists in api_cache table");
      return;
    }

    console.log("Adding userId column to api_cache table...");
    await db.execute("ALTER TABLE api_cache ADD COLUMN userId TEXT");
    console.log("✓ Added userId column");

    console.log("Creating index for userId lookups...");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_api_cache_userId ON api_cache(userId)");
    console.log("✓ Created idx_api_cache_userId index");

    console.log("Creating composite index for userId + key lookups...");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_api_cache_userId_key ON api_cache(userId, key)");
    console.log("✓ Created idx_api_cache_userId_key index");

    console.log("Clearing old cache entries without userId...");
    const result = await db.execute("DELETE FROM api_cache WHERE userId IS NULL");
    console.log(`✓ Deleted ${result.rowsAffected} old cache entries`);

    console.log("\n✅ Migration applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyMigration();

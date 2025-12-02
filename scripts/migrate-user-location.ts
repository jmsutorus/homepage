import { getDatabase } from "@/lib/db";

/**
 * Migration script to add the 'location' column to the user table
 * Run this with: npx tsx scripts/migrate-user-location.ts
 */
async function migrate() {
  try {
    const db = getDatabase();

    console.log(
      "Starting migration: Adding 'location' column to user table..."
    );

    // Try to get table info to check if column exists
    try {
      const result = await db.execute(
        "SELECT location FROM user LIMIT 1"
      );
      console.log(
        "✓ Column 'location' already exists. Migration not needed."
      );
      return;
    } catch (error) {
      // Column doesn't exist, continue with migration
      console.log("Column 'location' doesn't exist, proceeding with migration...");
    }

    // Add the location column
    await db.execute("ALTER TABLE user ADD COLUMN location TEXT");

    // Create index for performance
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_user_location ON user(location)"
    );

    console.log("✓ Successfully added 'location' column to user table.");
    console.log("✓ Successfully created index on location column.");
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();

#!/usr/bin/env tsx
/**
 * Add the positions column to the intimacy_entries table
 * Usage: tsx scripts/add-positions-column.ts
 */

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function addPositionsColumn() {
  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl) {
    console.error("❌ Missing DATABASE_URL environment variable");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const db = createClient({
    url: dbUrl,
    authToken: dbAuthToken || undefined,
  });

  try {
    console.log("📝 Adding positions column to intimacy_entries table...");

    await db.execute(`
      ALTER TABLE intimacy_entries ADD COLUMN positions TEXT
    `);

    console.log("✅ Successfully added positions column!");

    // Verify the column was added
    console.log("\n🔍 Verifying column addition...");
    const result = await db.execute(`
      SELECT COUNT(*) as count FROM intimacy_entries
    `);

    console.log(`✅ intimacy_entries table has ${result.rows[0].count} rows`);
    console.log("✨ Migration completed successfully!");

  } catch (error: any) {
    if (error.message?.includes("duplicate column name")) {
      console.log("⚠ Column 'positions' already exists - no action needed");
    } else {
      console.error("\n❌ Migration failed:", error);
      process.exit(1);
    }
  }
}

// Run migration
addPositionsColumn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

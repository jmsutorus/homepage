#!/usr/bin/env tsx
/**
 * Run migration to add time_spent field to media_content table
 * Usage: tsx scripts/add-media-time-spent.ts
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl || !dbAuthToken) {
    console.error("❌ Missing DATABASE_URL or DATABASE_AUTH_TOKEN environment variables");
    console.error("   Make sure your .env.local file is configured correctly");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const db = createClient({
    url: dbUrl,
    authToken: dbAuthToken,
  });

  try {
    // Read and execute the migration file
    const migrationPath = path.join(process.cwd(), "lib/db/migrations/008_add_media_time_spent.sql");

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    console.log("📄 Reading migration file...");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      try {
        await db.execute(statement);
        console.log(`✓ Executed: ${statement.substring(0, 80)}...`);
      } catch (error: any) {
        // Ignore "duplicate column" or "already exists" errors
        if (
          error.message?.includes("duplicate column") ||
          error.message?.includes("already exists")
        ) {
          console.log(`⚠ Skipped (already exists): ${statement.substring(0, 80)}...`);
        } else {
          throw error;
        }
      }
    }

    // Verify the column was added
    console.log("\n🔍 Verifying column addition...");
    const result = await db.execute(
      "SELECT time_spent FROM media_content LIMIT 1"
    );

    console.log("✅ time_spent column exists in media_content table");

    // Check current data
    const countResult = await db.execute(
      "SELECT COUNT(*) as count FROM media_content"
    );
    const count = countResult.rows[0]?.count || 0;
    console.log(`✅ media_content table has ${count} row(s)`);

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

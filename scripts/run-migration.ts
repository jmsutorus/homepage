#!/usr/bin/env tsx
/**
 * Run a specific database migration on the Turso database
 * Usage: tsx scripts/run-migration.ts <migration-file>
 * Example: tsx scripts/run-migration.ts 002_add_positions_column.sql
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error("❌ Please specify a migration file");
    console.error("   Usage: tsx scripts/run-migration.ts <migration-file>");
    console.error("   Example: tsx scripts/run-migration.ts 002_add_positions_column.sql");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl) {
    console.error("❌ Missing DATABASE_URL environment variable");
    console.error("   Make sure your .env.local file is configured correctly");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const db = createClient({
    url: dbUrl,
    authToken: dbAuthToken || undefined,
  });

  try {
    // Build the full migration path
    const migrationPath = path.join(process.cwd(), "lib/db/migrations", migrationFile);

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Executing ${statements.length} SQL statement(s)...\n`);

    for (const statement of statements) {
      try {
        await db.execute(statement);
        console.log(`✓ Executed: ${statement.substring(0, 80)}...`);
      } catch (error: any) {
        // Ignore "already exists" or "duplicate column" errors
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate column name")
        ) {
          console.log(`⚠ Skipped (already exists): ${statement.substring(0, 80)}...`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

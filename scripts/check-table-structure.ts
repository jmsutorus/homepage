#!/usr/bin/env tsx
/**
 * Check the structure of the intimacy_entries table
 * Usage: tsx scripts/check-table-structure.ts
 */

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function checkTableStructure() {
  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl) {
    console.error("❌ Missing DATABASE_URL environment variable");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  console.log(`   URL: ${dbUrl}\n`);

  const db = createClient({
    url: dbUrl,
    authToken: dbAuthToken || undefined,
  });

  try {
    // Get table info
    console.log("📋 Checking intimacy_entries table structure...\n");
    const result = await db.execute(`PRAGMA table_info(intimacy_entries)`);

    console.log("Columns in intimacy_entries table:");
    console.log("─".repeat(80));
    result.rows.forEach((row: any) => {
      console.log(`${row.name.padEnd(25)} | ${row.type.padEnd(15)} | ${row.notnull ? 'NOT NULL' : 'NULL'}`);
    });
    console.log("─".repeat(80));

    // Check if positions column exists
    const hasPositions = result.rows.some((row: any) => row.name === 'positions');

    if (hasPositions) {
      console.log("\n✅ 'positions' column EXISTS in the table");
    } else {
      console.log("\n❌ 'positions' column DOES NOT EXIST in the table");
    }

  } catch (error: any) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// Run check
checkTableStructure()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

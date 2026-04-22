#!/usr/bin/env tsx
/**
 * Run the budget migration (031_add_budget.sql)
 * Usage: npx tsx scripts/run-budget-migration.ts
 */

import { createClient } from "@libsql/client";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runMigration() {
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

  const statements = [
    // Budget Income
    `CREATE TABLE IF NOT EXISTS budget_income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      label TEXT DEFAULT 'Primary',
      effective_date TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_budget_income_userId ON budget_income(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_budget_income_effective_date ON budget_income(effective_date)`,

    `CREATE TRIGGER IF NOT EXISTS update_budget_income_timestamp
    AFTER UPDATE ON budget_income
    BEGIN
      UPDATE budget_income SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,

    // Budget Fixed Costs
    `CREATE TABLE IF NOT EXISTS budget_fixed_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'other'
        CHECK(category IN ('housing', 'utilities', 'groceries', 'transportation',
                            'insurance', 'healthcare', 'childcare', 'phone',
                            'internet', 'other')),
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_budget_fixed_costs_userId ON budget_fixed_costs(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_budget_fixed_costs_category ON budget_fixed_costs(category)`,

    `CREATE TRIGGER IF NOT EXISTS update_budget_fixed_costs_timestamp
    AFTER UPDATE ON budget_fixed_costs
    BEGIN
      UPDATE budget_fixed_costs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,
  ];

  try {
    console.log(`📝 Executing ${statements.length} SQL statement(s)...\n`);

    for (const statement of statements) {
      try {
        await db.execute(statement);
        const preview = statement.replace(/\s+/g, " ").substring(0, 80);
        console.log(`✓ ${preview}...`);
      } catch (error: any) {
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate column name")
        ) {
          const preview = statement.replace(/\s+/g, " ").substring(0, 80);
          console.log(`⚠ Skipped (already exists): ${preview}...`);
        } else {
          throw error;
        }
      }
    }

    // Verify
    console.log("\n🔍 Verifying tables...");
    const tables = ["budget_income", "budget_fixed_costs"];
    for (const table of tables) {
      const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
      if (result.rows.length > 0) {
        console.log(`✓ Table '${table}' exists`);
      } else {
        console.error(`✗ Table '${table}' NOT found`);
      }
    }

    console.log("\n✨ Budget migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });

#!/usr/bin/env tsx
/**
 * Run the finances migration (030_add_finances.sql)
 * Handles multi-statement SQL including triggers with embedded semicolons
 * 
 * Usage: npx tsx scripts/run-finances-migration.ts
 */

import { createClient } from "@libsql/client";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runMigration() {
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

  // Define each SQL statement individually to avoid semicolon-splitting issues with triggers
  const statements = [
    // ==================== Subscriptions ====================
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      website TEXT,
      icon_url TEXT,
      price REAL NOT NULL,
      cycle TEXT NOT NULL DEFAULT 'monthly'
        CHECK(cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
      currency TEXT NOT NULL DEFAULT 'USD',
      active INTEGER DEFAULT 1,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(active)`,
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_cycle ON subscriptions(cycle)`,

    `CREATE TRIGGER IF NOT EXISTS update_subscriptions_timestamp
    AFTER UPDATE ON subscriptions
    BEGIN
      UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,

    // ==================== Savings Accounts ====================
    `CREATE TABLE IF NOT EXISTS savings_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      institution TEXT,
      account_type TEXT DEFAULT 'savings'
        CHECK(account_type IN ('savings', 'checking', 'money_market', 'cd', 'investment', 'other')),
      currency TEXT NOT NULL DEFAULT 'USD',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_savings_accounts_userId ON savings_accounts(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_savings_accounts_account_type ON savings_accounts(account_type)`,

    `CREATE TRIGGER IF NOT EXISTS update_savings_accounts_timestamp
    AFTER UPDATE ON savings_accounts
    BEGIN
      UPDATE savings_accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,

    // ==================== Savings Balances ====================
    `CREATE TABLE IF NOT EXISTS savings_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      balance REAL NOT NULL,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accountId) REFERENCES savings_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_savings_balances_accountId ON savings_balances(accountId)`,
    `CREATE INDEX IF NOT EXISTS idx_savings_balances_userId ON savings_balances(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_savings_balances_date ON savings_balances(date)`,

    // ==================== Debts ====================
    `CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'other'
        CHECK(category IN ('mortgage', 'car', 'student_loan', 'credit_card', 'personal', 'medical', 'other')),
      original_amount REAL NOT NULL,
      current_balance REAL NOT NULL,
      interest_rate REAL DEFAULT 0,
      monthly_payment REAL NOT NULL,
      extra_payment REAL DEFAULT 0,
      start_date TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_debts_userId ON debts(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_debts_category ON debts(category)`,

    `CREATE TRIGGER IF NOT EXISTS update_debts_timestamp
    AFTER UPDATE ON debts
    BEGIN
      UPDATE debts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END`,

    // ==================== Debt Payments ====================
    `CREATE TABLE IF NOT EXISTS debt_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debtId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (debtId) REFERENCES debts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_debt_payments_debtId ON debt_payments(debtId)`,
    `CREATE INDEX IF NOT EXISTS idx_debt_payments_userId ON debt_payments(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_debt_payments_date ON debt_payments(date)`,
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

    // Verify tables were created
    console.log("\n🔍 Verifying tables...");
    const tables = ["subscriptions", "savings_accounts", "savings_balances", "debts", "debt_payments"];
    for (const table of tables) {
      const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
      if (result.rows.length > 0) {
        console.log(`✓ Table '${table}' exists`);
      } else {
        console.error(`✗ Table '${table}' NOT found`);
      }
    }

    console.log("\n✨ Finances migration completed successfully!");
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

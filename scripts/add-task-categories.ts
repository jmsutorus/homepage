import { getDatabase } from "../lib/db/index";

/**
 * Migration script to add category support to tasks
 * Adds:
 * - category column to tasks table
 * - task_categories table for user-defined categories
 * - Initial default categories
 */

function migrateTaskCategories() {
  const db = getDatabase();

  console.log("Starting task categories migration...");

  try {
    // Add category column to tasks table
    console.log("Adding category column to tasks table...");
    db.exec(`
      ALTER TABLE tasks ADD COLUMN category TEXT;
    `);

    // Create task_categories table
    console.log("Creating task_categories table...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS task_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, name),
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      );
    `);

    // Create index for faster lookups
    console.log("Creating indexes...");
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_task_categories_userId ON task_categories(userId);
      CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    `);

    // Insert default categories for existing users
    console.log("Inserting default categories...");
    const users = db.prepare("SELECT DISTINCT userId FROM tasks").all() as { userId: string }[];

    const defaultCategories = ["House", "Chore", "Work", "Buy"];
    const insertStmt = db.prepare(
      "INSERT OR IGNORE INTO task_categories (userId, name) VALUES (?, ?)"
    );

    for (const user of users) {
      for (const category of defaultCategories) {
        insertStmt.run(user.userId, category);
      }
    }

    console.log(`✓ Migration completed successfully!`);
    console.log(`  - Added category column to tasks table`);
    console.log(`  - Created task_categories table`);
    console.log(`  - Added default categories for ${users.length} user(s)`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate column name")) {
      console.log("⚠ Category column already exists, skipping...");
    } else {
      console.error("Migration failed:", error);
      throw error;
    }
  }
}

// Run migration
migrateTaskCategories();

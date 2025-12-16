
import { getDatabase } from "../lib/db/index";

/**
 * Migration script to add category support to tasks
 * Adds:
 * - category column to tasks table
 * - task_categories table for user-defined categories
 * - Initial default categories
 */

async function migrateTaskCategories() {
  const db = getDatabase();

  console.log("Starting task categories migration...");

  try {
    // Add category column to tasks table
    console.log("Adding category column to tasks table...");
    try {
      await db.execute(`
        ALTER TABLE tasks ADD COLUMN category TEXT;
      `);
    } catch (error) {
       if (error instanceof Error && error.message.includes("duplicate column name")) {
         console.log("⚠ Category column already exists, skipping...");
       } else {
         throw error;
       }
    }

    // Create task_categories table
    console.log("Creating task_categories table...");
    await db.execute(`
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
    await db.execute("CREATE INDEX IF NOT EXISTS idx_task_categories_userId ON task_categories(userId);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);");

    // Insert default categories for existing users
    console.log("Inserting default categories...");
    const result = await db.execute("SELECT DISTINCT userId FROM tasks");
    const users = result.rows as unknown as { userId: string }[];

    const defaultCategories = [
      "Work",
      "Personal",
      "Family",
      "Home",
      "Shopping",
      "Finance",
      "Health",
      "Travel"
    ];

    for (const user of users) {
      for (const category of defaultCategories) {
        await db.execute({
          sql: "INSERT OR IGNORE INTO task_categories (userId, name) VALUES (?, ?)",
          args: [user.userId, category]
        });
      }
    }

    console.log(`✓ Migration completed successfully!`);
    console.log(`  - Added category column to tasks table`);
    console.log(`  - Created task_categories table`);
    console.log(`  - Added default categories for ${users.length} user(s)`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  (async () => {
    try {
      await migrateTaskCategories();
      process.exit(0);
    } catch (error) {
      console.error("❌ Error migrating task categories:", error);
      process.exit(1);
    }
  })();
}

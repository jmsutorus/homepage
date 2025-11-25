import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

console.log("Running migration: create-user-roles-table");

try {
  // 1. Create the table and related objects
  const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Extract the user_roles part from schema (or just hardcode it here to be safe and independent)
  // Hardcoding ensures this script works even if schema.sql changes later in unexpected ways for this specific migration
  db.exec(`
    -- User Roles Table
    CREATE TABLE IF NOT EXISTS user_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
      UNIQUE(userId)
    );

    -- Indexes for user_roles
    CREATE INDEX IF NOT EXISTS idx_user_roles_userId ON user_roles(userId);
    CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

    -- Trigger to update updated_at timestamp on user_roles
    CREATE TRIGGER IF NOT EXISTS update_user_roles_timestamp
    AFTER UPDATE ON user_roles
    BEGIN
      UPDATE user_roles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log("Table 'user_roles' created (if not exists).");

  // 2. Backfill existing users
  const users = db.prepare("SELECT id, email FROM user").all() as { id: string; email: string }[];
  console.log(`Found ${users.length} users to check.`);

  const insertRole = db.prepare(`
    INSERT OR IGNORE INTO user_roles (userId, role) VALUES (?, 'user')
  `);

  let updatedCount = 0;
  for (const user of users) {
    const result = insertRole.run(user.id);
    if (result.changes > 0) {
      updatedCount++;
      console.log(`Added default role for user: ${user.email}`);
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} users.`);

} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}

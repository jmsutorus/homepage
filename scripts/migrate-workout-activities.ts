
import { createClient } from "@libsql/client";

async function migrate() {
  console.log("Starting migration (attempt 2)...");
  try {
    const db = createClient({
      url: "file:data/homepage.db",
    });

    // Check if _old table already exists (from failed previous run)
    const oldTableCheck = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='workout_activities_old'");
    const oldTableExists = oldTableCheck.rows.length > 0;

    if (!oldTableExists) {
        console.log("Renaming existing table...");
        await db.execute("ALTER TABLE workout_activities RENAME TO workout_activities_old");
    } else {
        console.log("workout_activities_old already exists. Assuming previous rename succeeded.");
        // We might need to drop the partially created new table if it exists
        await db.execute("DROP TABLE IF EXISTS workout_activities");
    }

    // 2. Create new table with correct schema 
    console.log("Creating new table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workout_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        length INTEGER NOT NULL,
        distance REAL DEFAULT 0,
        difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard', 'very hard')) DEFAULT 'moderate',
        type TEXT CHECK(type IN ('run', 'cardio', 'strength', 'flexibility', 'sports', 'mixed', 'other')) DEFAULT 'other',
        exercises TEXT NOT NULL,
        notes TEXT,
        completed BOOLEAN DEFAULT 0,
        completed_at TIMESTAMP,
        completion_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )
    `);

    // 3. Create indexes
    console.log("Creating indexes...");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_userId ON workout_activities(userId)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_date ON workout_activities(date)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_type ON workout_activities(type)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_completed ON workout_activities(completed)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_difficulty ON workout_activities(difficulty)");

    // 4. Copy data with smart selection
    console.log("Copying data...");
    
    // Check columns in old table to see if distance exists
    const columnsResult = await db.execute("PRAGMA table_info(workout_activities_old)");
    const columns = columnsResult.rows.map(r => r.name);
    const hasDistance = columns.includes("distance");
    
    // Construct SELECT part based on available columns
    const selectDistance = hasDistance ? "distance" : "0 as distance";
    
    await db.execute(`
      INSERT INTO workout_activities (
        id, userId, date, time, length, distance, difficulty, type, exercises, notes, 
        completed, completed_at, completion_notes, created_at, updated_at
      )
      SELECT 
        id, userId, date, time, length, ${selectDistance}, difficulty, type, exercises, notes, 
        completed, completed_at, completion_notes, created_at, updated_at
      FROM workout_activities_old
      WHERE userId IS NOT NULL AND userId IN (SELECT id FROM user)
    `);

    // 5. Drop old table
    console.log("Dropping old table...");
    await db.execute("DROP TABLE workout_activities_old");

    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();


import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables immediately
config({ path: resolve(process.cwd(), ".env.local") });

async function migrate() {
  // Dynamically import database to ensure env vars are loaded first
  const { getDatabase, closeDatabase } = await import("@/lib/db");
  
  const db = getDatabase();
  console.log("Starting migration: Merging Strava activities into Workouts...");

  try {
    // 1. Create temporary new table with desired schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workout_activities_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
        time TEXT NOT NULL, -- Time in HH:MM format
        length INTEGER NOT NULL, -- Duration in minutes
        distance REAL DEFAULT 0, -- Distance in miles (for runs/cardio)
        difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard', 'very hard')) DEFAULT 'moderate',
        type TEXT CHECK(type IN ('run', 'cardio', 'strength', 'flexibility', 'sports', 'mixed', 'other')) DEFAULT 'other',
        exercises TEXT NOT NULL, -- JSON array of exercise objects with reps/sets/description
        notes TEXT,
        completed BOOLEAN DEFAULT 0,
        completed_at TIMESTAMP,
        completion_notes TEXT, -- Post-activity notes when marked complete
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      );
    `);

    // 2. Copy existing workout activities to new table
    console.log("Copying existing workout activities...");
    await db.execute(`
      INSERT INTO workout_activities_new (
        id, userId, date, time, length, difficulty, type, exercises, notes, 
        completed, completed_at, completion_notes, created_at, updated_at
      )
      SELECT 
        id, userId, date, time, length, difficulty, type, exercises, notes,
        completed, completed_at, completion_notes, created_at, updated_at
      FROM workout_activities;
    `);

    // 3. Migrate Strava activities
    console.log("Migrating Strava activities...");
    // Check if strava_activities table exists
    const stravaTableExists = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='strava_activities'");
    
    if (stravaTableExists.rows.length > 0) {
      const stravaActivities = await db.execute("SELECT * FROM strava_activities");
      console.log(`Found ${stravaActivities.rows.length} Strava activities to migrate.`);

      for (const activity of stravaActivities.rows) {
        // Map Strava activity to Workout activity
        // Strava distance is in meters, convert to miles (1 meter = 0.000621371 miles)
        const distanceMiles = (Number(activity.distance) || 0) * 0.000621371;
        
        // Map type
        let type = 'other';
        if (String(activity.type) === 'Run') type = 'run';
        else if (String(activity.type) === 'Ride') type = 'cardio';
        else if (String(activity.type) === 'Swim') type = 'cardio';
        else if (String(activity.type) === 'Walk') type = 'cardio';
        else if (String(activity.type) === 'WeightTraining') type = 'strength';
        
        // Create exercises JSON
        const exercises = JSON.stringify([{
          description: `Strava Import: ${activity.name}`,
          duration: Math.round((Number(activity.moving_time) || 0) / 60),
          pace: null
        }]);

        // Date and Time
        const startDate = new Date(String(activity.start_date));
        const dateStr = startDate.toISOString().split('T')[0];
        const timeStr = startDate.toTimeString().slice(0, 5);

        // Length in minutes
        const length = Math.round((Number(activity.moving_time) || 0) / 60);

        await db.execute({
          sql: `INSERT INTO workout_activities_new (
            userId, date, time, length, distance, difficulty, type, exercises, notes, 
            completed, completed_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            activity.userId,
            dateStr,
            timeStr,
            length,
            distanceMiles,
            'moderate', // Default difficulty
            type,
            exercises,
            String(activity.name), // Note
            1, // Completed
            String(activity.start_date), // Completed at
            String(activity.start_date), // Created at
            String(activity.start_date)  // Updated at
          ]
        });
      }
      console.log("Strava activities migrated.");
    } else {
      console.log("No Strava activities table found, skipping Strava migration.");
    }

    // 4. Swap tables
    console.log("Swapping tables...");
    await db.execute("DROP TABLE workout_activities");
    await db.execute("ALTER TABLE workout_activities_new RENAME TO workout_activities");

    // 5. Create indexes
    console.log("Recreating indexes...");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_userId ON workout_activities(userId)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_date ON workout_activities(date)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_type ON workout_activities(type)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_completed ON workout_activities(completed)");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_workout_activities_difficulty ON workout_activities(difficulty)");

    // 6. Drop Strava tables
    console.log("Dropping old Strava tables...");
    await db.execute("DROP TABLE IF EXISTS strava_activities");
    await db.execute("DROP TABLE IF EXISTS strava_athlete");

    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    if (closeDatabase) closeDatabase();
  }
}

migrate();

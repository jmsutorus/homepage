const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'homepage.db');
const db = new Database(dbPath);

try {
  // Check if column already exists
  const columns = db.prepare("PRAGMA table_info(workout_activities)").all();
  const hasCompletionNotes = columns.some(col => col.name === 'completion_notes');

  if (!hasCompletionNotes) {
    console.log('Adding completion_notes column to workout_activities table...');
    db.prepare('ALTER TABLE workout_activities ADD COLUMN completion_notes TEXT').run();
    console.log('✓ Migration completed successfully');
  } else {
    console.log('✓ Column completion_notes already exists');
  }
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}

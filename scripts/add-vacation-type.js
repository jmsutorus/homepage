const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'homepage.db');
const db = new Database(dbPath);

console.log('Starting vacation type migration...');

try {
  // Check if the type column already exists
  const tableInfo = db.prepare("PRAGMA table_info(vacations)").all();
  const typeColumnExists = tableInfo.some(col => col.name === 'type');
  
  if (typeColumnExists) {
    console.log('✓ Type column already exists, skipping migration');
  } else {
    // Add the type column to the vacations table
    console.log('Adding type column to vacations table...');
    db.prepare(`
      ALTER TABLE vacations 
      ADD COLUMN type TEXT CHECK(type IN ('beach', 'ski', 'cruise', 'road-trip', 'city', 'camping', 'adventure', 'cultural', 'theme-park', 'festival', 'business', 'staycation', 'other')) DEFAULT 'other'
    `).run();
    
    console.log('✓ Type column added successfully');
    
    // Set default value 'other' for all existing vacations
    const result = db.prepare(`
      UPDATE vacations 
      SET type = 'other' 
      WHERE type IS NULL
    `).run();
    
    console.log(`✓ Updated ${result.changes} existing vacation(s) with default type 'other'`);
  }
  
  // Verify the migration
  const updatedTableInfo = db.prepare("PRAGMA table_info(vacations)").all();
  const typeColumn = updatedTableInfo.find(col => col.name === 'type');
  
  if (typeColumn) {
    console.log('✓ Migration verified - type column exists');
    console.log(`  Column details: ${JSON.stringify(typeColumn)}`);
  } else {
    console.error('✗ Migration verification failed - type column not found');
    process.exit(1);
  }
  
  console.log('\n✓ Vacation type migration completed successfully!');
} catch (error) {
  console.error('✗ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}

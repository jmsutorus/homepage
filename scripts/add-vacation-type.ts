import { execute, query } from '../lib/db/index';

async function migrateVacationType() {
  console.log('Starting vacation type migration...');

  try {
    // Check if the type column already exists
    const tableInfo = await query<{ name: string }>(`PRAGMA table_info(vacations)`);
    const typeColumnExists = tableInfo.some((col: any) => col.name === 'type');
    
    if (typeColumnExists) {
      console.log('✓ Type column already exists, skipping migration');
    } else {
      // Add the type column to the vacations table
      console.log('Adding type column to vacations table...');
      await execute(`
        ALTER TABLE vacations 
        ADD COLUMN type TEXT CHECK(type IN ('beach', 'ski', 'cruise', 'road-trip', 'city', 'camping', 'adventure', 'cultural', 'theme-park', 'festival', 'business', 'staycation', 'other')) DEFAULT 'other'
      `);
      
      console.log('✓ Type column added successfully');
      
      // Set default value 'other' for all existing vacations
      const result = await execute(`
        UPDATE vacations 
        SET type = 'other' 
        WHERE type IS NULL
      `);
      
      console.log(`✓ Updated ${result.changes} existing vacation(s) with default type 'other'`);
    }
    
    // Verify the migration
    const updatedTableInfo = await query<{ name: string; type: string; dflt_value: string }>(`PRAGMA table_info(vacations)`);
    const typeColumn = updatedTableInfo.find((col: any) => col.name === 'type');
    
    if (typeColumn) {
      console.log('✓ Migration verified - type column exists');
      console.log(`  Column details:`, typeColumn);
    } else {
      console.error('✗ Migration verification failed - type column not found');
      process.exit(1);
    }
    
    console.log('\n✓ Vacation type migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateVacationType();

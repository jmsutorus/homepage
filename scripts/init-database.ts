import { getDatabase } from '@/lib/db/index';

console.log('🔄 Initializing database...\n');

try {
  // This will create and initialize the database with the schema
  const db = getDatabase();

  // Verify media_content table was created
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='media_content'
  `).all() as Array<{ name: string }>;

  if (tables.length > 0) {
    console.log('✅ media_content table created successfully\n');

    // Check columns
    const columns = db.prepare("PRAGMA table_info(media_content)").all() as Array<{
      name: string;
      type: string;
    }>;

    console.log('Columns in media_content table:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    // Check if creator column exists
    const hasCreator = columns.some(col => col.name === 'creator');
    if (hasCreator) {
      console.log('\n✅ creator column is present and ready to use!');
    } else {
      console.log('\n⚠️  creator column is missing from the schema');
    }
  } else {
    console.log('❌ media_content table was not created');
  }

  console.log('\n✨ Database initialization complete!');
} catch (error) {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
}

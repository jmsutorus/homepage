import { getDatabase } from '@/lib/db/index';

const db = getDatabase();

console.log('🔍 Checking media_content table structure...\n');

// Get current table info
const columns = db.prepare("PRAGMA table_info(media_content)").all() as Array<{
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}>;

console.log('Current columns:');
columns.forEach(col => {
  console.log(`  - ${col.name} (${col.type})`);
});

// Check if creator column exists
const hasCreatorColumn = columns.some(col => col.name === 'creator');

if (hasCreatorColumn) {
  console.log('\n✅ creator column already exists. No changes needed.');
} else {
  console.log('\n⚠️  creator column is missing. Adding it now...\n');

  try {
    // Add the creator column
    db.exec(`
      ALTER TABLE media_content
      ADD COLUMN creator TEXT;
    `);

    console.log('✅ Successfully added creator column to media_content table\n');

    // Verify the column was added
    const updatedColumns = db.prepare("PRAGMA table_info(media_content)").all() as Array<{
      name: string;
    }>;

    console.log('Updated columns:');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    console.log('\n✨ Migration complete! You can now import media files with creator information.');
  } catch (error) {
    console.error('❌ Error adding creator column:', error);
    process.exit(1);
  }
}

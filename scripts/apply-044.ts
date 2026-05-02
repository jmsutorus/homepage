
import fs from 'fs';
import path from 'path';

console.log(`Current Working Directory: ${process.cwd()}`);

// Manual env loading for Turso
const envLocalPath = path.resolve(process.cwd(), '.env.local');
console.log(`Looking for .env.local at: ${envLocalPath}`);

if (fs.existsSync(envLocalPath)) {
  console.log('Found .env.local');
  const envLocal = fs.readFileSync(envLocalPath, 'utf8');
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
      if (key === 'DATABASE_URL') console.log(`Set DATABASE_URL to: ${value}`);
    }
  });
} else {
    console.log('.env.local NOT found');
}

// Set this to skip env validation if it's causing issues
process.env.SKIP_ENV_VALIDATION = 'true';

import { getDatabase } from '../lib/db/index';

async function applyMigration(migrationFile: string) {
  console.log(`🔄 Applying migration: ${migrationFile}...`);
  
  const db = getDatabase();
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
      console.log(`Executing: ${statement}`);
      await db.execute(statement);
    }
    console.log('✅ Migration applied successfully!');
  } catch (error: any) {
    if (error.message && (error.message.includes('duplicate column name') || error.message.includes('already exists'))) {
        console.log('⚠️ Columns already exist, skipping...');
    } else {
        console.error('❌ Error applying migration:', error);
        process.exit(1);
    }
  }
}

const migrationPath = path.join(process.cwd(), 'lib/db/migrations/044_add_published_featured_to_drinks_events.sql');
applyMigration(migrationPath);

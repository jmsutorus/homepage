
import fs from 'fs';
import path from 'path';

// Manual env loading for Turso
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocal = fs.readFileSync(envLocalPath, 'utf8');
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

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

const migrationPath = path.join(process.cwd(), 'lib/db/migrations/045_add_published_featured_to_meals.sql');
applyMigration(migrationPath);

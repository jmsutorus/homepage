
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getDatabase } from '../lib/db/index';
import fs from 'fs';

async function applyMigration(migrationFile: string) {
  console.log(`🔄 Applying migration: ${migrationFile}...`);
  console.log(`📡 DATABASE_URL: ${process.env.DATABASE_URL ? 'Defined' : 'UNDEFINED'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not defined. Check .env.local');
    process.exit(1);
  }

  const db = getDatabase();
  const sql = fs.readFileSync(migrationFile, 'utf8');

  try {
    // split by ; but careful with strings, simplified for now
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
      await db.execute(statement);
    }
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

const migrationPath = path.join(process.cwd(), 'lib/db/migrations/043_add_user_public_slug.sql');
applyMigration(migrationPath);

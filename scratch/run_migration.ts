
import { execute } from './lib/db/index';

async function runMigration() {
  try {
    console.log('Running migration...');
    await execute('ALTER TABLE drinks ADD COLUMN body_feel TEXT');
    console.log('Added body_feel');
    await execute('ALTER TABLE drinks ADD COLUMN serving_temp TEXT');
    console.log('Added serving_temp');
    await execute('ALTER TABLE drinks ADD COLUMN pairings TEXT');
    console.log('Added pairings');
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed (maybe columns already exist?):', error);
  }
}

runMigration();

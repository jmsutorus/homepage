
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

async function checkMeals() {
  const db = getDatabase();
  const userId = 'GbVDvSgQp2dIMo1d68D02yQP0862';

  try {
    const total = await db.execute({
      sql: "SELECT COUNT(*) as count FROM meals WHERE userId = ?",
      args: [userId]
    });
    console.log(`Total meals: ${total.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error checking meals:", error);
  }
}

checkMeals();

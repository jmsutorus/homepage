
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

async function featureItems() {
  const db = getDatabase();
  const userId = 'GbVDvSgQp2dIMo1d68D02yQP0862';

  console.log(`Setting featured items for user: ${userId}`);

  try {
    // Feature an event
    await db.execute({
      sql: "UPDATE events SET featured = 1, published = 1 WHERE userId = ? LIMIT 1",
      args: [userId]
    });
    console.log("✅ Featured an event");

    // Feature a drink
    await db.execute({
      sql: "UPDATE drinks SET featured = 1, published = 1 WHERE userId = ? LIMIT 1",
      args: [userId]
    });
    console.log("✅ Featured a drink");

  } catch (error) {
    console.error("❌ Error updating items:", error);
  }
}

featureItems();

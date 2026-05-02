
import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const url = process.env.DATABASE_URL;
    const token = process.env.DATABASE_AUTH_TOKEN;

    if (!url) {
        console.error("DATABASE_URL is missing");
        process.exit(1);
    }

    const client = createClient({ url, authToken: token });

    const migrationFile = path.resolve(process.cwd(), 'lib/db/migrations/043_add_user_public_slug.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
        console.log(`Executing: ${statement}`);
        await client.execute(statement);
    }

    console.log("✅ Migration complete");
    client.close();
}

run();

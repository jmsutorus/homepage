
import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const url = process.env.DATABASE_URL!;
    const token = process.env.DATABASE_AUTH_TOKEN;
    const client = createClient({ url, authToken: token });

    const tables = ["drinks", "events"];

    for (const table of tables) {
        console.log(`Checking columns for table: ${table}`);
        const res = await client.execute(`PRAGMA table_info(${table})`);
        const columns = res.rows.map(r => r.name);
        console.log(`Columns:`, columns);
        
        const hasPublished = columns.includes('published');
        const hasFeatured = columns.includes('featured');
        
        console.log(`- hasPublished: ${hasPublished}`);
        console.log(`- hasFeatured: ${hasFeatured}`);
    }

    client.close();
}

run();

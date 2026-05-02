
import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const url = process.env.DATABASE_URL!;
    const token = process.env.DATABASE_AUTH_TOKEN;
    const client = createClient({ url, authToken: token });

    const result = await client.execute("PRAGMA table_info(user)");
    console.log(JSON.stringify(result.rows, null, 2));
    client.close();
}

run();


import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const url = process.env.DATABASE_URL!;
    const token = process.env.DATABASE_AUTH_TOKEN;
    const client = createClient({ url, authToken: token });

    const userId = "GbVDvSgQp2dIMo1d68D02yQP0862";
    const tables = [
        "events",
        "workout_activities",
        "media_content",
        "vacations",
        "goals",
        "journals",
        "drinks",
        "restaurants",
        "meals"
    ];

    console.log(`Checking counts for userId: ${userId}`);
    for (const table of tables) {
        const res = await client.execute({
            sql: `SELECT 
                    COUNT(*) as total, 
                    SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published,
                    SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured
                  FROM ${table} WHERE userId = ?`,
            args: [userId]
        });
        console.log(`${table}:`, res.rows[0]);
    }

    client.close();
}

run();

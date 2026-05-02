
import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
}

async function run() {
    const url = process.env.DATABASE_URL!;
    const token = process.env.DATABASE_AUTH_TOKEN;
    const client = createClient({ url, authToken: token });

    const result = await client.execute("SELECT id, name FROM user");
    const users = result.rows;

    for (const user of users) {
        const id = user.id as string;
        const name = user.name as string || 'user';
        const idHash = id.substring(0, 8);
        const slug = `${slugify(name)}+${idHash}`;

        console.log(`Updating user ${id} (${name}) with slug ${slug}`);
        await client.execute({
            sql: "UPDATE user SET public_slug = ? WHERE id = ?",
            args: [slug, id]
        });
    }

    console.log("✅ All users updated");
    client.close();
}

run();

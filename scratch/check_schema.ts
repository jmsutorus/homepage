
import { getDatabase } from "./lib/db/index";

async function checkSchema() {
    try {
        const db = getDatabase();
        const result = await db.execute("PRAGMA table_info(workout_activities)");
        console.log("Schema for workout_activities:");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    }
}

checkSchema();

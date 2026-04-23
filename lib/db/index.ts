import { createClient, Client } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";
import { env } from "@/lib/env";

// Database instance (singleton)
let db: Client | null = null;

/**
 * Get the database instance (creates if doesn't exist)
 */
export function getDatabase(): Client {
  if (!db) {
    // Check if using remote Turso database or local file
    // const isRemote = env.DATABASE_URL.startsWith("libsql://") || env.DATABASE_URL.startsWith("https://");

    // if (isRemote) {
    //   // Create remote Turso connection
    //   db = createClient({
    //     url: env.DATABASE_URL,
    //     authToken: env.DATABASE_AUTH_TOKEN,
    //   });
    // } else {
    //   // Create local file connection
    //   const dbPath = env.DATABASE_URL.replace("file:", "");
    //   db = createClient({
    //     url: `file:${dbPath}`,
    //   });
    // }

    db = createClient({
        url: env.DATABASE_URL!,
        authToken: env.DATABASE_AUTH_TOKEN,
      });

    // Run migrations
    // initializeDatabase(db);
  }

  return db;
}

/**
 * Initialize database with schema
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function initializeDatabase(database: Client) {
  // Read schema SQL file
  const schemaPath = join(process.cwd(), "lib", "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Execute schema (split by semicolons for individual statements)
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await database.execute(statement);
  }

  console.log("✅ Database initialized successfully");
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("Database connection closed");
  }
}

/**
 * Execute a query with parameters
 */
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const database = getDatabase();
  const result = await database.execute({
    sql,
    args: params,
  });
  
  // Convert Row objects to plain JavaScript objects to ensure they can be 
  // passed from Server Components to Client Components.
  // Using JSON.parse(JSON.stringify()) is a reliable way to strip any 
  // non-serializable properties or methods from the database driver's Row objects.
  return JSON.parse(JSON.stringify(result.rows)) as T[];
}

/**
 * Execute a query that returns a single row
 */
export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  const database = getDatabase();
  const result = await database.execute({
    sql,
    args: params,
  });
  
  if (result.rows.length === 0) return undefined;
  
  // Convert to plain object for Next.js serialization
  return JSON.parse(JSON.stringify(result.rows[0])) as T;
}

/**
 * Execute an insert/update/delete query
 */
export async function execute(sql: string, params: any[] = []) {
  const database = getDatabase();
  const result = await database.execute({
    sql,
    args: params,
  });
  return {
    changes: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid ?? 0,
  };
}

// Handle cleanup on process exit
if (typeof process !== "undefined") {
  process.on("exit", closeDatabase);
  process.on("SIGINT", () => {
    closeDatabase();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    closeDatabase();
    process.exit(0);
  });
}

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";
import { env } from "@/lib/env";

// Database instance (singleton)
let db: Database.Database | null = null;

/**
 * Get the database instance (creates if doesn't exist)
 */
export function getDatabase(): Database.Database {
  if (!db) {
    // Extract file path from DATABASE_URL
    const dbPath = env.DATABASE_URL.replace("file:", "");

    // Create database instance
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
    });

    // Enable foreign keys and WAL mode for better performance
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");

    // Run migrations
    initializeDatabase(db);
  }

  return db;
}

/**
 * Initialize database with schema
 */
function initializeDatabase(database: Database.Database) {
  // Read schema SQL file
  const schemaPath = join(process.cwd(), "lib", "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  // Execute schema
  database.exec(schema);

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
export function query<T>(sql: string, params: unknown[] = []): T[] {
  const database = getDatabase();
  const statement = database.prepare(sql);
  return statement.all(...params) as T[];
}

/**
 * Execute a query that returns a single row
 */
export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const database = getDatabase();
  const statement = database.prepare(sql);
  return statement.get(...params) as T | undefined;
}

/**
 * Execute an insert/update/delete query
 */
export function execute(sql: string, params: unknown[] = []): Database.RunResult {
  const database = getDatabase();
  const statement = database.prepare(sql);
  return statement.run(...params);
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

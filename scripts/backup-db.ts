/**
 * backup-db.ts
 *
 * Creates a full SQL dump of the Turso database and writes it to the
 * backups/ directory at the project root.
 *
 * Usage:
 *   npx tsx scripts/backup-db.ts
 *
 * The output file is named: backups/homepage-YYYY-MM-DD.sql
 * An existing backup for the same day will be overwritten.
 */

import { createClient } from '@libsql/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env.local for local runs
dotenv.config({ path: join(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────

const db = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
});

/** Escape a string value for safe embedding in SQL */
function escapeString(value: string): string {
  return value.replace(/'/g, "''");
}

/** Format a column value as a SQL literal */
function toLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${escapeString(String(value))}'`;
}

async function backup() {
  const startTime = Date.now();
  console.log('🔄  Starting database backup...\n');

  const lines: string[] = [];

  lines.push('-- ============================================================');
  lines.push(`-- Homepage DB Backup`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Source:    ${DATABASE_URL}`);
  lines.push('-- ============================================================');
  lines.push('');
  lines.push('PRAGMA foreign_keys = OFF;');
  lines.push('BEGIN TRANSACTION;');
  lines.push('');

  // ── 1. Get all user-defined tables (excluding sqlite internals) ──────────
  const tablesResult = await db.execute(`
    SELECT name FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);

  const tables = (tablesResult.rows as unknown as Array<{ name: string }>).map(
    (r) => r.name
  );

  console.log(`📋  Found ${tables.length} tables to back up`);

  let totalRows = 0;

  // ── 2. Dump each table ───────────────────────────────────────────────────
  for (const table of tables) {
    // Get the original CREATE TABLE statement
    const ddlResult = await db.execute(
      `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`,
      [table]
    );
    const ddl = (ddlResult.rows[0] as unknown as { sql: string })?.sql;

    if (!ddl) {
      console.warn(`  ⚠️  Skipping ${table} — no DDL found`);
      continue;
    }

    lines.push(`-- ── Table: ${table} ──`);
    lines.push(`DROP TABLE IF EXISTS "${table}";`);
    lines.push(`${ddl};`);
    lines.push('');

    // Get all rows
    const rowsResult = await db.execute(`SELECT * FROM "${table}"`);
    const rows = rowsResult.rows as unknown[];

    if (rows.length === 0) {
      console.log(`  ✅  ${table}: 0 rows`);
      continue;
    }

    // Column names come from the result set columns
    const columns = rowsResult.columns;
    const colList = columns.map((c) => `"${c}"`).join(', ');

    for (const row of rows as Record<string, unknown>[]) {
      const values = columns.map((col) => toLiteral(row[col])).join(', ');
      lines.push(`INSERT INTO "${table}" (${colList}) VALUES (${values});`);
    }

    lines.push('');
    totalRows += rows.length;
    console.log(`  ✅  ${table}: ${rows.length} rows`);
  }

  // ── 3. Dump indexes and triggers ─────────────────────────────────────────
  const extrasResult = await db.execute(`
    SELECT type, name, sql FROM sqlite_master
    WHERE type IN ('index', 'trigger')
      AND sql IS NOT NULL
      AND name NOT LIKE 'sqlite_%'
    ORDER BY type, name
  `);

  const extras = extrasResult.rows as unknown as Array<{
    type: string;
    name: string;
    sql: string;
  }>;

  if (extras.length > 0) {
    lines.push('-- ── Indexes & Triggers ──');
    for (const extra of extras) {
      lines.push(`DROP ${extra.type.toUpperCase()} IF EXISTS "${extra.name}";`);
      lines.push(`${extra.sql};`);
      lines.push('');
    }
  }

  lines.push('COMMIT;');
  lines.push('PRAGMA foreign_keys = ON;');
  lines.push('');

  // ── 4. Write to file ──────────────────────────────────────────────────────
  const backupDir = join(process.cwd(), 'backups');
  mkdirSync(backupDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `homepage-${date}.sql`;
  const filepath = join(backupDir, filename);

  writeFileSync(filepath, lines.join('\n'), 'utf-8');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`
✨  Backup complete!
   Tables:   ${tables.length}
   Rows:     ${totalRows}
   File:     backups/${filename}
   Duration: ${elapsed}s
`);
}

backup().catch((err) => {
  console.error('❌  Backup failed:', err);
  process.exit(1);
});

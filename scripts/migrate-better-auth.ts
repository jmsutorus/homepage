import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

// Drop existing tables if they exist to recreate with correct schema
db.exec(`DROP TABLE IF EXISTS verification;`);
db.exec(`DROP TABLE IF EXISTS account;`);
db.exec(`DROP TABLE IF EXISTS session;`);
db.exec(`DROP TABLE IF EXISTS user;`);

// Create better-auth tables with correct schema
db.exec(`
  CREATE TABLE user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    emailVerified INTEGER DEFAULT 0,
    name TEXT,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
  );

  CREATE TABLE account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user (id) ON DELETE CASCADE
  );

  CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER,
    updatedAt INTEGER
  );

  CREATE INDEX idx_session_userId ON session(userId);
  CREATE INDEX idx_session_token ON session(token);
  CREATE INDEX idx_account_userId ON account(userId);
  CREATE INDEX idx_account_accountId ON account(accountId);
  CREATE INDEX idx_verification_identifier ON verification(identifier);
`);

console.log("✅ Better-auth database tables created successfully");
db.close();

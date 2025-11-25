import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "@auth/core/adapters";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { populateUserColorsFromDefaults } from "../db/calendar-colors";

export function SQLiteAdapter(dbPath: string): Adapter {
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  return {
    async createUser(user) {
      const id = randomUUID();
      const now = Date.now();

      const stmt = db.prepare(`
        INSERT INTO user (id, email, emailVerified, name, image, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        user.email,
        user.emailVerified ? 1 : 0,
        user.name || null,
        user.image || null,
        now,
        now
      );

      // Populate default calendar colors for the new user
      try {
        populateUserColorsFromDefaults(id);
      } catch (error) {
        console.error("Failed to populate default calendar colors for user:", id, error);
        // Don't fail user creation if color population fails
      }

      // Add default role
      try {
        const roleStmt = db.prepare("INSERT INTO user_roles (userId, role) VALUES (?, 'user')");
        roleStmt.run(id);
      } catch (error) {
        console.error("Failed to create user role:", error);
      }

      return {
        id,
        email: user.email,
        emailVerified: user.emailVerified || null,
        name: user.name || null,
        image: user.image || null,
      } as AdapterUser;
    },

    async getUser(id) {
      const stmt = db.prepare(`
        SELECT u.*, ur.role 
        FROM user u 
        LEFT JOIN user_roles ur ON u.id = ur.userId 
        WHERE u.id = ?
      `);
      const user = stmt.get(id) as any;

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        name: user.name,
        image: user.image,
        role: user.role || 'user',
      } as AdapterUser & { role: string };
    },

    async getUserByEmail(email) {
      const stmt = db.prepare(`
        SELECT u.*, ur.role 
        FROM user u 
        LEFT JOIN user_roles ur ON u.id = ur.userId 
        WHERE u.email = ?
      `);
      const user = stmt.get(email) as any;

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        name: user.name,
        image: user.image,
        role: user.role || 'user',
      } as AdapterUser & { role: string };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const stmt = db.prepare(`
        SELECT u.*, ur.role 
        FROM user u
        JOIN account a ON u.id = a.userId
        LEFT JOIN user_roles ur ON u.id = ur.userId
        WHERE a.accountId = ? AND a.providerId = ?
      `);
      const user = stmt.get(providerAccountId, provider) as any;

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        name: user.name,
        image: user.image,
        role: user.role || 'user',
      } as AdapterUser & { role: string };
    },

    async updateUser(user) {
      const stmt = db.prepare(`
        UPDATE user
        SET email = ?, emailVerified = ?, name = ?, image = ?, updatedAt = ?
        WHERE id = ?
      `);

      stmt.run(
        user.email!,
        user.emailVerified ? 1 : 0,
        user.name || null,
        user.image || null,
        Date.now(),
        user.id
      );

      return this.getUser!(user.id) as Promise<AdapterUser>;
    },

    async deleteUser(userId) {
      const stmt = db.prepare("DELETE FROM user WHERE id = ?");
      stmt.run(userId);
    },

    async linkAccount(account) {
      const id = randomUUID();
      const now = Date.now();

      const stmt = db.prepare(`
        INSERT INTO account (
          id, userId, accountId, providerId, accessToken, refreshToken,
          accessTokenExpiresAt, refreshTokenExpiresAt, scope, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        account.userId,
        account.providerAccountId,
        account.provider,
        account.access_token || null,
        account.refresh_token || null,
        account.expires_at ? account.expires_at * 1000 : null,
        null,
        account.scope || null,
        now,
        now
      );

      return account as AdapterAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const stmt = db.prepare(`
        DELETE FROM account
        WHERE accountId = ? AND providerId = ?
      `);
      stmt.run(providerAccountId, provider);
    },

    async createSession(session) {
      const id = randomUUID();
      const now = Date.now();

      const stmt = db.prepare(`
        INSERT INTO session (id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        session.userId,
        session.sessionToken,
        new Date(session.expires).getTime(),
        null,
        null,
        now,
        now
      );

      return {
        id,
        userId: session.userId,
        sessionToken: session.sessionToken,
        expires: session.expires,
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const stmt = db.prepare(`
        SELECT s.*, u.*, ur.role 
        FROM session s
        JOIN user u ON s.userId = u.id
        LEFT JOIN user_roles ur ON u.id = ur.userId
        WHERE s.token = ?
      `);
      const result = stmt.get(sessionToken) as any;

      if (!result) return null;

      const session: AdapterSession = {
        sessionToken: result.token,
        userId: result.userId,
        expires: new Date(result.expiresAt),
      };

      const user: AdapterUser & { role: string } = {
        id: result.userId,
        email: result.email,
        emailVerified: result.emailVerified ? new Date(result.emailVerified) : null,
        name: result.name,
        image: result.image,
        role: result.role || 'user',
      };

      return { session, user };
    },

    async updateSession(session) {
      const stmt = db.prepare(`
        UPDATE session
        SET expiresAt = ?, updatedAt = ?
        WHERE token = ?
      `);

      stmt.run(
        new Date(session.expires!).getTime(),
        Date.now(),
        session.sessionToken
      );

      return session as AdapterSession;
    },

    async deleteSession(sessionToken) {
      const stmt = db.prepare("DELETE FROM session WHERE token = ?");
      stmt.run(sessionToken);
    },

    async createVerificationToken(token) {
      const id = randomUUID();
      const now = Date.now();

      const stmt = db.prepare(`
        INSERT INTO verification (id, identifier, value, expiresAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        token.identifier,
        token.token,
        new Date(token.expires).getTime(),
        now,
        now
      );

      return token as VerificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const stmt = db.prepare(`
        SELECT * FROM verification
        WHERE identifier = ? AND value = ?
      `);
      const result = stmt.get(identifier, token) as any;

      if (!result) return null;

      const deleteStmt = db.prepare("DELETE FROM verification WHERE id = ?");
      deleteStmt.run(result.id);

      return {
        identifier: result.identifier,
        token: result.value,
        expires: new Date(result.expiresAt),
      } as VerificationToken;
    },
  };
}

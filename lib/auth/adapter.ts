import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "@auth/core/adapters";
import { randomUUID } from "crypto";
import { populateUserColorsFromDefaults } from "../db/calendar-colors";
import { getDatabase } from "../db";

export function SQLiteAdapter(): Adapter {
  return {
    async createUser(user) {
      const db = getDatabase();
      const id = randomUUID();
      const now = Date.now();

      await db.execute({
        sql: `
          INSERT INTO user (id, email, emailVerified, name, image, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          user.email,
          user.emailVerified ? 1 : 0,
          user.name || null,
          user.image || null,
          now,
          now
        ]
      });

      // Populate default calendar colors for the new user
      try {
        await populateUserColorsFromDefaults(id);
      } catch (error) {
        console.error("Failed to populate default calendar colors for user:", id, error);
        // Don't fail user creation if color population fails
      }

      // Add default role
      try {
        await db.execute({
          sql: "INSERT INTO user_roles (userId, role) VALUES (?, 'user')",
          args: [id]
        });
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
      const db = getDatabase();
      const result = await db.execute({
        sql: `
          SELECT u.*, ur.role
          FROM user u
          LEFT JOIN user_roles ur ON u.id = ur.userId
          WHERE u.id = ?
        `,
        args: [id]
      });

      const user = result.rows[0] as any;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified as number) : null,
        name: user.name,
        image: user.image,
        role: user.role || 'user',
      } as AdapterUser & { role: string };
    },

    async getUserByEmail(email) {
      const db = getDatabase();
      const result = await db.execute({
        sql: `
          SELECT u.*, ur.role
          FROM user u
          LEFT JOIN user_roles ur ON u.id = ur.userId
          WHERE u.email = ?
        `,
        args: [email]
      });

      const user = result.rows[0] as any;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified as number) : null,
        name: user.name,
        image: user.image,
        role: user.role || 'user',
      } as AdapterUser & { role: string };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const db = getDatabase();
      const result = await db.execute({
        sql: `
          SELECT u.*, ur.role
          FROM user u
          JOIN account a ON u.id = a.userId
          LEFT JOIN user_roles ur ON u.id = ur.userId
          WHERE a.accountId = ? AND a.providerId = ?
        `,
        args: [providerAccountId, provider]
      });

      const user = result.rows[0] as any;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified as number) : null,
        name: user.name,
        image: user.image,
        role: user.role || 'user',
      } as AdapterUser & { role: string };
    },

    async updateUser(user) {
      const db = getDatabase();
      await db.execute({
        sql: `
          UPDATE user
          SET email = ?, emailVerified = ?, name = ?, image = ?, updatedAt = ?
          WHERE id = ?
        `,
        args: [
          user.email!,
          user.emailVerified ? 1 : 0,
          user.name || null,
          user.image || null,
          Date.now(),
          user.id
        ]
      });

      return this.getUser!(user.id) as Promise<AdapterUser>;
    },

    async deleteUser(userId) {
      const db = getDatabase();
      await db.execute({
        sql: "DELETE FROM user WHERE id = ?",
        args: [userId]
      });
    },

    async linkAccount(account) {
      const db = getDatabase();
      const id = randomUUID();
      const now = Date.now();

      await db.execute({
        sql: `
          INSERT INTO account (
            id, userId, accountId, providerId, accessToken, refreshToken,
            accessTokenExpiresAt, refreshTokenExpiresAt, scope, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
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
        ]
      });

      return account as AdapterAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const db = getDatabase();
      await db.execute({
        sql: `
          DELETE FROM account
          WHERE accountId = ? AND providerId = ?
        `,
        args: [providerAccountId, provider]
      });
    },

    async createSession(session) {
      const db = getDatabase();
      const id = randomUUID();
      const now = Date.now();

      await db.execute({
        sql: `
          INSERT INTO session (id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          session.userId,
          session.sessionToken,
          new Date(session.expires).getTime(),
          null,
          null,
          now,
          now
        ]
      });

      return {
        id,
        userId: session.userId,
        sessionToken: session.sessionToken,
        expires: session.expires,
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const db = getDatabase();
      const result = await db.execute({
        sql: `
          SELECT s.*, u.*, ur.role
          FROM session s
          JOIN user u ON s.userId = u.id
          LEFT JOIN user_roles ur ON u.id = ur.userId
          WHERE s.token = ?
        `,
        args: [sessionToken]
      });

      const row = result.rows[0] as any;
      if (!row) return null;

      const session: AdapterSession = {
        sessionToken: row.token,
        userId: row.userId,
        expires: new Date(row.expiresAt as number),
      };

      const user: AdapterUser & { role: string } = {
        id: row.userId,
        email: row.email,
        emailVerified: row.emailVerified ? new Date(row.emailVerified as number) : null,
        name: row.name,
        image: row.image,
        role: row.role || 'user',
      };

      return { session, user };
    },

    async updateSession(session) {
      const db = getDatabase();
      await db.execute({
        sql: `
          UPDATE session
          SET expiresAt = ?, updatedAt = ?
          WHERE token = ?
        `,
        args: [
          new Date(session.expires!).getTime(),
          Date.now(),
          session.sessionToken
        ]
      });

      return session as AdapterSession;
    },

    async deleteSession(sessionToken) {
      const db = getDatabase();
      await db.execute({
        sql: "DELETE FROM session WHERE token = ?",
        args: [sessionToken]
      });
    },

    async createVerificationToken(token) {
      const db = getDatabase();
      const id = randomUUID();
      const now = Date.now();

      await db.execute({
        sql: `
          INSERT INTO verification (id, identifier, value, expiresAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          token.identifier,
          token.token,
          new Date(token.expires).getTime(),
          now,
          now
        ]
      });

      return token as VerificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const db = getDatabase();
      const result = await db.execute({
        sql: `
          SELECT * FROM verification
          WHERE identifier = ? AND value = ?
        `,
        args: [identifier, token]
      });

      const row = result.rows[0] as any;
      if (!row) return null;

      await db.execute({
        sql: "DELETE FROM verification WHERE id = ?",
        args: [row.id]
      });

      return {
        identifier: row.identifier,
        token: row.value,
        expires: new Date(row.expiresAt as number),
      } as VerificationToken;
    },
  };
}

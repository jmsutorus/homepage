"use server";

import { requireAdmin } from "@/lib/auth/server";
import { query, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: number;
};

export async function getUsers(): Promise<AdminUser[]> {
  await requireAdmin();

  const users = query<AdminUser>(`
    SELECT u.id, u.name, u.email, u.image, u.createdAt, ur.role
    FROM user u
    LEFT JOIN user_roles ur ON u.id = ur.userId
    ORDER BY u.createdAt DESC
  `);

  // Ensure role is never null in the response
  return users.map(user => ({
    ...user,
    role: user.role || 'user'
  }));
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();

  if (!['user', 'admin'].includes(role)) {
    throw new Error("Invalid role");
  }

  execute(`
    INSERT INTO user_roles (userId, role) 
    VALUES (?, ?)
    ON CONFLICT(userId) DO UPDATE SET role = excluded.role, updated_at = CURRENT_TIMESTAMP
  `, [userId, role]);

  revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();

  if (userId === session.user.id) {
    throw new Error("Cannot delete yourself");
  }

  execute("DELETE FROM user WHERE id = ?", [userId]);
  revalidatePath("/admin");
}

export type AllowedUser = {
  email: string;
  created_at: string;
};

export async function getAllowedUsers(): Promise<AllowedUser[]> {
  await requireAdmin();
  return query<AllowedUser>("SELECT * FROM allowed_users ORDER BY created_at DESC");
}

export async function addAllowedUser(email: string) {
  await requireAdmin();
  
  if (!email || !email.includes('@')) {
    throw new Error("Invalid email address");
  }

  try {
    execute("INSERT INTO allowed_users (email) VALUES (?)", [email]);
    revalidatePath("/admin");
  } catch (error) {
    // Ignore duplicate errors
    if ((error as any).code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      throw error;
    }
  }
}

export async function removeAllowedUser(email: string) {
  await requireAdmin();
  execute("DELETE FROM allowed_users WHERE email = ?", [email]);
  revalidatePath("/admin");
}

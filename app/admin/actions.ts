"use server";

import { requireAdmin } from "@/lib/auth/server";
import { query, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GoogleAuth } from "google-auth-library";

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

  const users = await query<AdminUser>(`
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
  return await query<AllowedUser>("SELECT * FROM allowed_users ORDER BY created_at DESC");
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

export type AccessRequest = {
  id: number;
  name: string;
  email: string;
  reason: string | null;
  created_at: string;
};

export async function getAccessRequests(): Promise<AccessRequest[]> {
  await requireAdmin();
  return await query<AccessRequest>("SELECT * FROM beta_access_requests ORDER BY created_at DESC");
}

export async function approveAccessRequest(id: number, email: string) {
  await requireAdmin();
  
  // 1. Add to allowed_users
  await execute("INSERT OR IGNORE INTO allowed_users (email) VALUES (?)", [email]);
  
  // 2. Delete from beta_access_requests
  await execute("DELETE FROM beta_access_requests WHERE id = ?", [id]);
  
  // 3. Invoke Firebase function
  const targetAudience = process.env.FIREBASE_SEND_ACCESS_EMAIL || "https://sendaccessemail-xe2v24bjoq-uc.a.run.app";
  const isProd = process.env.NODE_ENV === "production";
  const isCloudRun = !!process.env.K_SERVICE;

  if (isProd || isCloudRun) {
    try {
      const auth = new GoogleAuth();
      const client = await auth.getIdTokenClient(targetAudience);
      
      const response = await client.request({
        url: `${targetAudience}?email=${encodeURIComponent(email)}`,
        method: "GET",
      });
      
      if (response.status !== 200) {
        console.error(`Failed to invoke Firebase function for ${email}: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`Error invoking Firebase function for ${email}:`, error);
    }
  } else {
    console.log(`Skipping Firebase function invocation for ${email} in development environment`);
  }
  
  revalidatePath("/admin");
}

export async function denyAccessRequest(id: number, email: string, name: string, reason: string) {
  await requireAdmin();
  
  // 1. Add to denied_access_requests
  await execute(
    "INSERT INTO denied_access_requests (name, email, reason) VALUES (?, ?, ?)",
    [name, email, reason || ""]
  );
  
  // 2. Delete from beta_access_requests
  await execute("DELETE FROM beta_access_requests WHERE id = ?", [id]);
  
  revalidatePath("/admin");
}

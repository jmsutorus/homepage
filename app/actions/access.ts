"use server";

import { execute, queryOne } from "@/lib/db";

export async function submitAccessRequest(formData: { name: string; email: string; reason: string }) {
  try {
    if (!formData.email || !formData.name) {
      return { success: false, error: "Name and email are required." };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { success: false, error: "Please enter a valid email format." };
    }



    // 1. Check if user is in allowed_users
    // Wait! allowed_users might not exist if no users seeded. Graceful degradation.
    let isAllowed = false;
    try {
      const allowed = await queryOne<{ email: string }>(
        "SELECT email FROM allowed_users WHERE email = ?",
        [formData.email]
      );
      if (allowed) isAllowed = true;
    } catch (e) {
      console.warn("allowed_users table not found or query error");
    }

    if (isAllowed) {
      return { success: true, status: "allowed" };
    }

    // 2. Check if user is in denied_access_requests
    const isDenied = await queryOne<{ id: number }>(
      "SELECT id FROM denied_access_requests WHERE email = ? LIMIT 1",
      [formData.email]
    );

    if (isDenied) {
      return { success: true, status: "denied" };
    }

    // 3. Check if user already in beta_access_requests
    const alreadySubmitted = await queryOne<{ id: number }>(
      "SELECT id FROM beta_access_requests WHERE email = ? LIMIT 1",
      [formData.email]
    );

    if (alreadySubmitted) {
      return { success: true, status: "submitted" };
    }

    // 4. Insert into beta_access_requests
    await execute(
      "INSERT INTO beta_access_requests (name, email, reason) VALUES (?, ?, ?)",
      [formData.name, formData.email, formData.reason || ""]
    );

    return { success: true, status: "submitted" };
  } catch (error) {
    console.error("Error processing access request:", error);
    return { success: false, error: "Failed to process request." };
  }
}

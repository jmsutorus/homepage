import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { UserActivityUpdatePayload } from "@/types/user-activity";

/**
 * Updates a user's activity metrics, location metadata, and login state in Firestore.
 * Calculates the consecutive daily activity streak safely.
 */
export async function recordLoginState(userId: string, payload: UserActivityUpdatePayload) {
  if (!userId) {
    throw new Error("UserId is required to record user activity");
  }

  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();
  
  const updateData: Record<string, any> = {
    lastActiveAt: FieldValue.serverTimestamp(),
  };

  if (payload.isLogin) {
    updateData.lastLoginAt = FieldValue.serverTimestamp();
    
    let currentStreak = 1;
    if (userDoc.exists) {
      const data = userDoc.data();
      const lastLoginAt = data?.lastLoginAt?.toDate?.() || data?.lastLoginAt;
      const currentStreakStored = data?.activityStreak || 0;

      if (lastLoginAt instanceof Date || (lastLoginAt && typeof lastLoginAt === "object" && "seconds" in lastLoginAt)) {
        // Resolve date comparison
        const lastLoginDate = lastLoginAt instanceof Date 
          ? lastLoginAt 
          : new Date((lastLoginAt as any).seconds * 1000);
          
        const now = new Date();
        const tz = payload.timezone || "UTC";
        
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });

          const lastLoginStr = formatter.format(lastLoginDate);
          const nowStr = formatter.format(now);
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const yesterdayStr = formatter.format(yesterday);

          if (lastLoginStr === nowStr) {
            currentStreak = currentStreakStored || 1;
          } else if (lastLoginStr === yesterdayStr) {
            currentStreak = (currentStreakStored || 0) + 1;
          } else {
            currentStreak = 1;
          }
        } catch {
          const lastLoginStrUTC = lastLoginDate.toISOString().split("T")[0];
          const nowStrUTC = now.toISOString().split("T")[0];
          const yesterdayUTC = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

          if (lastLoginStrUTC === nowStrUTC) {
            currentStreak = currentStreakStored || 1;
          } else if (lastLoginStrUTC === yesterdayUTC) {
            currentStreak = (currentStreakStored || 0) + 1;
          } else {
            currentStreak = 1;
          }
        }
      }
    }
    updateData.activityStreak = currentStreak;
  }

  if (payload.country) {
    updateData["location.country"] = payload.country;
  }

  if (payload.timezone) {
    updateData["location.timezone"] = payload.timezone;
  }

  if (payload.preferredLanguage) {
    updateData.preferredLanguage = payload.preferredLanguage;
  }

  await userRef.set(updateData, { merge: true });
}

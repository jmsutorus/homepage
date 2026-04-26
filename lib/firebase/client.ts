import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { env } from "@/lib/env";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket:
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? `gs://${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`
      : undefined),
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// Initialize Firebase (prevent multiple instances)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firebase instances
export const auth = getAuth(app);
export const storage = getStorage(app);

export const getClientMessaging = async () => {
  if (typeof window === "undefined") return null;
  const { getMessaging } = await import("firebase/messaging");
  return getMessaging(app);
};


export default app;


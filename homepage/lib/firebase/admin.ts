import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App;

// Initialize Firebase Admin (prevent multiple instances)
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle newlines in private key from environment variable
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} else {
  app = getApps()[0];
}

// Get Firebase Admin Auth instance
export const adminAuth = getAuth(app);

export default app;

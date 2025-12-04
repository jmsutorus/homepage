import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getRemoteConfig, type RemoteConfig } from "firebase-admin/remote-config";

let app: App | undefined;

/**
 * Lazy initialization of Firebase Admin
 * Only initializes when credentials are available and needed
 */
function getFirebaseAdmin(): App {
  // Return existing app if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Check if we have the required credentials
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  // Initialize Firebase Admin with proper private key formatting
  // Private keys from Secret Manager may have escaped newlines (\n as string)
  // or actual newlines - handle both cases
  const formattedPrivateKey = privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;

  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw new Error(
      `Firebase Admin initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Lazy getters that initialize on first access
export const getAdminAuth = (): Auth => {
  return getAuth(getFirebaseAdmin());
};

export const getRemoteConfigInstance = (): RemoteConfig => {
  return getRemoteConfig(getFirebaseAdmin());
};

// For backwards compatibility, export these as getters that throw helpful errors
export const adminAuth = new Proxy({} as Auth, {
  get(target, prop) {
    return getAdminAuth()[prop as keyof Auth];
  },
});

export const remoteConfig = new Proxy({} as RemoteConfig, {
  get(target, prop) {
    return getRemoteConfigInstance()[prop as keyof RemoteConfig];
  },
});

export default getFirebaseAdmin;

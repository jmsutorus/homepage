"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

/**
 * Hook to listen to Firebase auth state changes
 * Syncs Firebase auth with Auth.js session
 */
export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

/**
 * Sign out from both Firebase and Auth.js
 */
export async function signOut() {
  try {
    // Sign out from Firebase
    await firebaseSignOut(auth);

    // Sign out from Auth.js
    await fetch("/api/auth/signout", {
      method: "POST",
    });

    // Redirect to sign-in page
    window.location.href = "/sign-in";
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

"use client";

import { useEffect, useState } from "react";

/**
 * Network Status Hook
 *
 * Tracks online/offline status and provides utilities for
 * handling network state changes.
 */

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean; // True if was offline and just came back online
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with actual online status
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true; // Default to online during SSR
  });
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return;
    }

    // Handle online event
    const handleOnline = () => {
      console.log("🌐 Network: Back online");
      setIsOnline(true);
      setWasOffline(true);

      // Reset wasOffline flag after a brief moment
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);
    };

    // Handle offline event
    const handleOffline = () => {
      console.log("📵 Network: Gone offline");
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

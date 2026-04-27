"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Passive monitoring node recording standard analytics payloads.
 */
export function UserActivityTracker() {
  const { user, isAuthenticated } = useAuth();
  const hasLoggedLoginRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const reportActivity = async (isLogin: boolean) => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const preferredLanguage = navigator.language;

        await fetch("/api/user/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timezone,
            preferredLanguage,
            isLogin,
          }),
        });
      } catch (error) {
        console.error("Failed to transmit user activity heartbeat:", error);
      }
    };

    // Run login state confirmation once per initialization
    if (!hasLoggedLoginRef.current) {
      reportActivity(true);
      hasLoggedLoginRef.current = true;
    }

    // Provision periodic intervals (heartbeats recorded every 10 minutes)
    const heartbeatTimer = setInterval(() => {
      reportActivity(false);
    }, 10 * 60 * 1000);

    return () => clearInterval(heartbeatTimer);
  }, [isAuthenticated, user?.id]);

  return null;
}

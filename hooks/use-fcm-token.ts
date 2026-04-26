import { useEffect, useState } from "react";
import app from "@/lib/firebase/client";

export function useFCMToken() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (permission !== "granted") return;

    const registerFCMToken = async () => {
      try {
        const { getMessaging, isSupported } = await import("firebase/messaging");
        const supported = await isSupported();
        if (!supported) {
          console.warn("FCM Messaging is not supported in this browser context.");
          return;
        }

        const messaging = getMessaging(app);

        // Use the public VAPID key
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing. Skipping token registration.");
          return;
        }

        const { getToken, onMessage } = await import("firebase/messaging");

        // Use the existing main PWA service worker if available to avoid duplicate scope loops
        let swRegistration: ServiceWorkerRegistration | undefined;
        if ("serviceWorker" in navigator) {
          // 1. Clean up old standalone firebase-messaging-sw.js registrations if they exist.
          const allRegistrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of allRegistrations) {
            const scriptUrl = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
            if (scriptUrl.includes("firebase-messaging-sw.js")) {
              console.log("🗑️ Unregistering duplicate standalone FCM service worker...");
              await reg.unregister();
            }
          }

          // 2. Fetch the primary PWA service worker (typically /sw.js)
          swRegistration = await navigator.serviceWorker.getRegistration();

          if (!swRegistration) {
            // Fallback: register standard messaging-sw if no PWA worker exists (e.g., in development)
            swRegistration = await navigator.serviceWorker.register(
              "/firebase-messaging-sw.js"
            );
          }

          // Await activation if a worker is currently installing or waiting
          const sw =
            swRegistration.installing ??
            swRegistration.waiting ??
            swRegistration.active;

          if (sw && sw.state !== "activated") {
            await new Promise<void>((resolve) => {
              sw.addEventListener("statechange", function handler(e) {
                if ((e.target as ServiceWorker).state === "activated") {
                  sw.removeEventListener("statechange", handler);
                  resolve();
                }
              });
            });
          }
        }

        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: swRegistration,
        });

        if (token) {
          await fetch("/api/notifications/register-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              platform: "web",
              userAgent: navigator.userAgent,
            }),
          });
          console.log("FCM token registered successfully.");

          onMessage(messaging, (payload) => {
            const title = payload.notification?.title ?? "Notification";
            const body = payload.notification?.body ?? "";
            const icon = payload.notification?.icon ?? "/favicon-96x96.png";
            if (Notification.permission === "granted") {
              new Notification(title, { body, icon });
            }
          });
        } else {
          console.warn("FCM returned no token.");
        }
      } catch (error) {
        console.error("Failed to register FCM token:", error);
      }
    };

    registerFCMToken();
  }, [permission]);

  const requestPermission = async () => {
    if (typeof window === "undefined") return "default";
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "default";
    }
  };

  return { permission, requestPermission };
}


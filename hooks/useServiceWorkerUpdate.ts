"use client";

import { useEffect, useState } from "react";

export function useServiceWorkerUpdate() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Function to check for updates
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Check for updates manually
          await registration.update();
        }
      } catch (error) {
        console.error("Error checking for service worker updates:", error);
      }
    };

    // Listen for service worker updates
    const handleControllerChange = () => {
      console.log("🔄 Service worker controller changed - reloading page");
      window.location.reload();
    };

    const handleStateChange = (worker: ServiceWorker) => () => {
      if (worker.state === "installed") {
        console.log("✅ New service worker installed and waiting");
      } else if (worker.state === "activated") {
        console.log("✅ New service worker activated");
      }
    };

    const setupServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();

        if (!registration) {
          console.log("No service worker registration found");
          return;
        }

        // Check if there's a worker waiting to activate
        if (registration.waiting) {
          console.log("📦 Service worker update is waiting");
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
        }

        // Listen for new service worker installing
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("📦 New service worker found, installing...");

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log("✅ New service worker installed, update available");
                  setWaitingWorker(newWorker);
                  setIsUpdateAvailable(true);
                } else {
                  // First time install
                  console.log("✅ Service worker installed for the first time");
                }
              }
            });
          }
        });

        // Listen for controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleControllerChange
        );
      } catch (error) {
        console.error("Error setting up service worker listener:", error);
      }
    };

    setupServiceWorker();

    // Check for updates periodically (every 60 seconds)
    const updateInterval = setInterval(checkForUpdates, 60000);

    // Check for updates when page gains focus
    const handleFocus = () => {
      checkForUpdates();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener("focus", handleFocus);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  const updateServiceWorker = () => {
    if (!waitingWorker) {
      console.warn("No waiting service worker to update");
      return;
    }

    setIsUpdating(true);

    // Tell the waiting service worker to skip waiting
    waitingWorker.postMessage({ type: "SKIP_WAITING" });

    // The controllerchange event will trigger a reload
    console.log("📤 Sent SKIP_WAITING message to service worker");
  };

  const checkForUpdate = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking for updates:", error);
      return false;
    }
  };

  return {
    isUpdateAvailable,
    isUpdating,
    updateServiceWorker,
    checkForUpdate,
  };
}

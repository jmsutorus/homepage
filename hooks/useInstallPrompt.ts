"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");

      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);

      console.log("📱 PWA install prompt available");
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("✅ PWA installed successfully");
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) {
      console.warn("Install prompt not available");
      return false;
    }

    try {
      // Show the install prompt
      await installPrompt.prompt();

      // Wait for user response
      const { outcome } = await installPrompt.userChoice;

      console.log(`User response: ${outcome}`);

      if (outcome === "accepted") {
        console.log("✅ User accepted the install prompt");
        setCanInstall(false);
        setInstallPrompt(null);
        return true;
      } else {
        console.log("❌ User dismissed the install prompt");
        return false;
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
      return false;
    }
  };

  return {
    installPrompt,
    canInstall,
    isInstalled,
    isStandalone,
    promptInstall,
  };
}

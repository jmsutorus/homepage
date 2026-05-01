"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { AchievementToastListener } from "@/components/widgets/achievements/achievement-toast-listener";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { UpdatePrompt } from "@/components/pwa/update-prompt";
import { SyncStatus } from "@/components/pwa/sync-status";
import { IOSPwaPushPrompt } from "@/components/pwa/ios-pwa-push-prompt";

import { useFCMToken } from "@/hooks/use-fcm-token";
import { UserActivityTracker } from "@/components/user-activity-tracker";
import { Session } from "next-auth";

export function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode;
  session?: Session | null;
}) {
  useFCMToken();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const offsetMinutes = new Date().getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const remainingMinutes = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes > 0 ? "-" : "+"; // getTimezoneOffset returns positive for behind UTC
      const offsetStr = `${sign}${String(offsetHours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
      document.cookie = `timezone-offset=${offsetStr}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
        <AchievementToastListener />
        <InstallPrompt />
        <UpdatePrompt />
        <SyncStatus />
        <IOSPwaPushPrompt />
        <UserActivityTracker />
      </ThemeProvider>
    </SessionProvider>
  );
}

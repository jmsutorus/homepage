"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Achievement } from "@/lib/achievements";
import { Trophy } from "lucide-react";

export function AchievementToastListener() {
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/achievements/notifications");
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          data.notifications.forEach((achievement: Achievement) => {
            toast.success(
              <div className="flex flex-col gap-1">
                <span className="font-bold flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  Achievement Unlocked!
                </span>
                <span className="font-semibold">{achievement.title}</span>
                <span className="text-xs text-muted-foreground">{achievement.description}</span>
              </div>,
              {
                duration: 5000,
              }
            );
          });
        }
      } catch (error) {
        console.error("Failed to check achievement notifications", error);
      }
    };

    // Check immediately on mount
    checkNotifications();

    // Poll every 30 seconds
    const interval = setInterval(checkNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

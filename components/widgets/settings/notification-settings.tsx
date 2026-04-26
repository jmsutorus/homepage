"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { useFCMToken } from "@/hooks/use-fcm-token";

export function NotificationSettings() {
  const { permission, isSupported, optedOut, optIn, optOut } = useFCMToken();
  const [loading, setLoading] = useState(false);

  if (!isSupported) {
    return (
      <div className="flex items-center justify-between p-4 bg-media-surface border border-media-outline-variant/30 rounded-lg opacity-60">
        <div className="flex items-center gap-3">
          <div className="bg-media-primary/10 p-2 rounded-lg text-media-primary">
            <BellOff className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-media-on-surface">
              Push Notifications
            </span>
            <span className="text-media-on-surface-variant text-xs hidden sm:block">
              Not supported on this browser or device
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isChecked = permission === "granted" && !optedOut;

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled) {
        if (permission === "denied") {
          toast.error("Notifications are blocked. Please enable them in your device settings.");
          setLoading(false);
          return;
        }
        
        const result = await optIn();
        if (result === "granted") {
          toast.success("Notifications enabled successfully!");
        } else if (result === "denied") {
          toast.error("Notifications blocked. You can enable them in device settings.");
        }
      } else {
        await optOut();
        toast.success("Notifications turned off on this device.");
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error("An error occurred while updating settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-media-surface border border-media-outline-variant/30 rounded-lg transition-all hover:border-media-primary/30">
      <div className="flex items-center gap-3">
        <div className="bg-media-primary/10 p-2 rounded-lg text-media-primary">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="notification-mode" className="font-bold text-media-on-surface cursor-pointer">
            Push Notifications
          </Label>
          <span className="text-media-on-surface-variant text-xs hidden sm:block">
            Receive real-time alerts and reminders on this device
          </span>
        </div>
      </div>
      <Switch
        id="notification-mode"
        checked={isChecked}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="data-[state=checked]:bg-media-primary"
      />
    </div>
  );
}

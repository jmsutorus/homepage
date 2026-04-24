"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateHapticPreference } from "@/lib/actions/settings";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";

export function HapticSettings() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  // Default to true if not set
  const hapticEnabled = session?.user?.haptic ?? true;

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      const result = await updateHapticPreference(enabled);
      if (result.success) {
        // Update the local session to reflect the change immediately
        await update({ haptic: enabled });
        toast.success(`Haptic feedback ${enabled ? "enabled" : "disabled"}`);
      } else {
        toast.error(result.error || "Failed to update preference");
      }
    } catch (error) {
      console.error("Haptic toggle error:", error);
      toast.error("An error occurred while updating haptic settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-media-surface border border-media-outline-variant/30 rounded-lg transition-all hover:border-media-primary/30">
      <div className="flex items-center gap-3">
        <div className="bg-media-primary/10 p-2 rounded-lg text-media-primary">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="haptic-mode" className="font-bold text-media-on-surface cursor-pointer">
            Haptic Feedback
          </Label>
          <span className="text-media-on-surface-variant text-xs hidden sm:block">
            Vibration responses for interactions and achievements
          </span>
        </div>
      </div>
      <Switch
        id="haptic-mode"
        checked={hapticEnabled}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="data-[state=checked]:bg-media-primary"
      />
    </div>
  );
}

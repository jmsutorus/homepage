"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ExerciseSettingsModalProps {
  initialRunningEnabled: boolean;
  initialWeightsEnabled: boolean;
}

export function ExerciseSettingsModal({ initialRunningEnabled, initialWeightsEnabled }: ExerciseSettingsModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [enableRunning, setEnableRunning] = useState(initialRunningEnabled);
  const [enableWeights, setEnableWeights] = useState(initialWeightsEnabled);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/exercise/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enable_running_prs: enableRunning,
          enable_weights_prs: enableWeights
        })
      });

      if (res.ok) {
        toast.success("Settings saved");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Exercise Settings">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Exercise Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exercise Settings</DialogTitle>
          <DialogDescription>
            Configure your exercise tracking preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none">Personal Records</h4>
            
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base">Running PRs</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Track your fastest times over different distances.
                </p>
              </div>
              <Switch
                checked={enableRunning}
                onCheckedChange={setEnableRunning}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base">Weightlifting PRs</Label>
                <p className="text-[0.8rem] text-muted-foreground">
                  Track your heaviest lifts and rep maxes.
                </p>
              </div>
              <Switch
                checked={enableWeights}
                onCheckedChange={setEnableWeights}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

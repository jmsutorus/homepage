"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cake, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export function BirthdayManager() {
  const [birthday, setBirthday] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBirthday();
  }, []);

  const fetchBirthday = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings/birthday");

      if (response.ok) {
        const data = await response.json();
        setBirthday(data.birthday || "");
      }
    } catch (error) {
      console.error("Failed to fetch birthday:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!birthday.trim()) {
      toast.error("Birthday cannot be empty");
      return;
    }

    const birthdayDate = new Date(birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthdayDate >= today) {
      toast.error("Birthday must be in the past");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/settings/birthday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ birthday: birthday.trim() }),
      });

      if (response.ok) {
        toast.success("Birthday updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || errorData.error);
      }
    } catch (error) {
      console.error("Failed to save birthday:", error);
      toast.error("Failed to save birthday");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-20 animate-pulse bg-media-surface/50 rounded-lg" />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
          Birthday
        </label>
        {birthday && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-6 text-[10px] font-bold uppercase tracking-widest"
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update"}
          </Button>
        )}
      </div>
      <div className="relative">
        <input
          className="w-full bg-media-surface border border-media-outline-variant/40 rounded-lg p-4 text-media-on-surface focus:ring-2 focus:ring-media-primary/20 focus:border-media-primary outline-none appearance-none"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          disabled={isSaving}
          max={new Date().toISOString().split('T')[0]}
        />
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-media-on-surface-variant pointer-events-none" />
      </div>
    </div>
  );
}


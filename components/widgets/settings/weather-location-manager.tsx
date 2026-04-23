"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function WeatherLocationManager() {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings/location");
      if (response.ok) {
        const data = await response.json();
        setLocation(data.location || "");
      }
    } catch (error) {
      console.error("Failed to fetch location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/settings/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: location.trim() }),
      });

      if (response.ok) {
        toast.success("Location updated successfully!");
      } else {
        toast.error("Failed to update location");
      }
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-20 animate-pulse bg-media-surface/50 rounded-lg" />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest text-media-primary/70">
          Location
        </label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-6 text-[10px] font-bold uppercase tracking-widest"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update"}
        </Button>
      </div>
      <div className="relative">
        <input
          className="w-full bg-media-surface border border-media-outline-variant/40 rounded-lg p-4 text-media-on-surface focus:ring-2 focus:ring-media-primary/20 focus:border-media-primary outline-none"
          placeholder="Oslo, Norway"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSaving}
        />
        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-media-on-surface-variant pointer-events-none" />
      </div>
    </div>
  );
}

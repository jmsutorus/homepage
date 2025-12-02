"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const response = await fetch("/api/weather/location");

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
    if (!location.trim()) {
      toast.error("Location cannot be empty");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/weather/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: location.trim() }),
      });

      if (response.ok) {
        toast.success("Weather location updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || errorData.error);
      }
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Weather Location
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Weather Location
        </CardTitle>
        <CardDescription>
          Set your location for weather updates. US locations only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Denver, CO"
            disabled={isSaving}
          />
          <p className="text-sm text-muted-foreground">
            Format: City, State (e.g., Denver, CO or New York, NY)
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Location
        </Button>
      </CardContent>
    </Card>
  );
}

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
import { Cake, Loader2 } from "lucide-react";
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

    // Client-side validation: ensure birthday is in the past
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Birthday
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
          <Cake className="h-5 w-5" />
          Birthday
        </CardTitle>
        <CardDescription>
          Set your birthday for personalized features and birthday reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="birthday">Date of Birth</Label>
          <Input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            disabled={isSaving}
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-sm text-muted-foreground">
            Your birthday is private and will only be used for personalized features.
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Birthday
        </Button>
      </CardContent>
    </Card>
  );
}

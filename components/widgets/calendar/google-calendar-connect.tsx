"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, ExternalLink } from "lucide-react";
import { useState } from "react";

interface GoogleCalendarConnectProps {
  isConnected?: boolean;
  userEmail?: string;
}

export function GoogleCalendarConnect({ isConnected = false, userEmail }: GoogleCalendarConnectProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Redirect to better-auth Google OAuth endpoint
    // Better-auth uses /api/auth/oauth/google for OAuth flow
    window.location.href = "/api/auth/oauth/google";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Google Calendar</CardTitle>
          </div>
          {isConnected && (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-500">
              <Check className="h-4 w-4" />
              Connected
            </div>
          )}
        </div>
        <CardDescription>
          Connect your Google Calendar to schedule and track workouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-muted-foreground">
                Connected as: <span className="font-medium text-foreground">{userEmail}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-500" />
                <span>Create workout events in your calendar</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-500" />
                <span>Receive email and mobile push reminders</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-500" />
                <span>Sync across all your devices</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Open Google Calendar
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Connect your Google Calendar to:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Schedule workouts with automatic reminders</li>
                <li>Get email and mobile push notifications</li>
                <li>Sync workout plans across all devices</li>
                <li>View workouts in your existing calendar</li>
              </ul>
            </div>
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Connect Google Calendar
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be redirected to Google to authorize calendar access. We only request permission
              to create and manage workout events.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { toast } from "sonner";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pwa-install-prompt-dismissed";
const PAGE_VIEWS_KEY = "pwa-page-views";
const MIN_PAGE_VIEWS = 2;

export function InstallPrompt() {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();
  const [shouldShow, setShouldShow] = useState(false);


  const showInstallToast = () => {
    toast.custom(
      (t) => (
        <div className="flex w-full max-w-md items-start gap-3 rounded-lg border bg-card p-4 shadow-lg">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Install Homepage</p>
              <p className="text-sm text-muted-foreground">
                Install this app on your device for quick access and a better
                experience.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  const installed = await promptInstall();
                  if (installed) {
                    toast.dismiss(t);
                    toast.success("App installed successfully!");
                  }
                }}
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  toast.dismiss(t);
                }}
              >
                Not now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  localStorage.setItem(STORAGE_KEY, "true");
                  toast.dismiss(t);
                }}
              >
                Don&apos;t show again
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={() => toast.dismiss(t)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
      {
        duration: 30000, // 30 seconds
        position: "bottom-center",
      }
    );
  };

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled) {
      return;
    }

    // Check if user has dismissed the prompt permanently
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (isDismissed) {
      return;
    }

    // Track page views
    const pageViews = parseInt(
      localStorage.getItem(PAGE_VIEWS_KEY) || "0",
      10
    );
    const newPageViews = pageViews + 1;
    localStorage.setItem(PAGE_VIEWS_KEY, newPageViews.toString());

    // Only show after minimum page views and if install prompt is available
    if (canInstall && newPageViews >= MIN_PAGE_VIEWS) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShouldShow(true);
        showInstallToast();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  // This component doesn't render anything - it just manages the toast
  return null;
}

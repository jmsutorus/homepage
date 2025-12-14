"use client";

import { useEffect, useRef } from "react";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { toast } from "sonner";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpdatePrompt() {
  const { isUpdateAvailable, isUpdating, updateServiceWorker } =
    useServiceWorkerUpdate();
  const toastShownRef = useRef(false);


  const showUpdateToast = () => {
    toast.custom(
      (t) => (
        <div className="flex w-full max-w-md items-start gap-3 rounded-lg border bg-card p-4 shadow-lg">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <RefreshCw className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Update Available</p>
              <p className="text-sm text-muted-foreground">
                A new version of Homepage is available. Reload to get the latest
                features and improvements.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  toast.dismiss(t);
                  updateServiceWorker();
                }}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Now
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  toast.dismiss(t);
                }}
              >
                Later
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
        duration: Infinity, // Don't auto-dismiss
        position: "top-center",
        id: "sw-update", // Prevent duplicates
      }
    );
  };

  useEffect(() => {
    // Only show toast once when update becomes available
    if (isUpdateAvailable && !toastShownRef.current) {
      toastShownRef.current = true;
      showUpdateToast();
    }
  }, [isUpdateAvailable]);

  // This component doesn't render anything - it just manages the toast
  return null;
}

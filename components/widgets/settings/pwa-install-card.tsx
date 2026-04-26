"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { PWAStatus } from "@/components/pwa/pwa-status";
import { Button } from "@/components/ui/button";
import { useFCMToken } from "@/hooks/use-fcm-token";
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PWAInstallCard() {
  const { canInstall, isInstalled, isStandalone, promptInstall } = useInstallPrompt();
  const { isUpdateAvailable, updateServiceWorker, checkForUpdate } = useServiceWorkerUpdate();
  const { permission, requestPermission, isSupported } = useFCMToken();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const installed = await promptInstall();
    if (installed) {
      toast.success("App installed successfully!");
    } else {
      toast.error("Installation was cancelled");
    }
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateServiceWorker();
    toast.info("Updating app...");
  };

  return (
    <div className="space-y-3">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-media-surface border border-media-outline-variant/20 hover:border-media-primary/40 transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-media-surface-variant rounded-full">
            <Download className="h-5 w-5 text-media-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-media-on-surface text-sm">PWA Installation</span>
            <span className="text-xs text-media-on-surface-variant">
              {isStandalone ? "Running in standalone mode" : "Install for offline access"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canInstall && !isStandalone && (
            <Button 
              size="sm" 
              onClick={handleInstall}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-media-primary text-media-on-primary hover:bg-media-primary/90"
            >
              Install
            </Button>
          )}
          {isUpdateAvailable && (
            <Button 
              size="sm" 
              onClick={handleUpdate}
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-media-primary text-media-on-primary"
            >
              Update
            </Button>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 rounded-lg bg-media-surface-variant/30 border border-media-outline-variant/10 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className={cn("h-5 w-5 mt-0.5", (isInstalled || isStandalone) ? "text-green-500" : "text-media-on-surface-variant/40")} />
            <div>
              <p className="font-bold text-media-on-surface">Installation Status</p>
              <p className="text-xs text-media-on-surface-variant">
                {(isInstalled || isStandalone) ? "App is installed and ready for offline use." : "App is not installed. You can install it for a better experience."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded border border-media-outline-variant/20 bg-media-surface/50">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4 text-media-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Desktop</span>
              </div>
              <p className="text-[11px] text-media-on-surface-variant">
                Click the install icon in the address bar (Chrome/Edge/Safari).
              </p>
            </div>
            <div className="p-3 rounded border border-media-outline-variant/20 bg-media-surface/50">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-media-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Mobile</span>
              </div>
              <p className="text-[11px] text-media-on-surface-variant">
                Use &quot;Add to Home Screen&quot; from your browser menu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4 border-t border-media-outline-variant/10">
            <span className="material-symbols-outlined text-media-primary h-5 w-5 mt-0.5">notifications</span>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-media-on-surface">Push Notifications</p>
                <p className="text-xs text-media-on-surface-variant">
                  {permission === "granted" 
                    ? "Notifications are enabled for this device." 
                    : permission === "denied"
                      ? "Notifications are blocked. Please enable them in your browser settings."
                      : !isSupported
                        ? "Push notifications are not supported by this browser. On iOS, you must add the app to your Home Screen first."
                        : "Stay updated with alerts and reminders."}
                </p>
              </div>
              {isSupported && permission === "default" && (
                <Button 
                  size="sm" 
                  onClick={async (e) => {
                    e.stopPropagation();
                    const result = await requestPermission();
                    if (result === "granted") {
                      toast.success("Notifications enabled!");
                    } else if (result === "denied") {
                      toast.error("Notifications blocked");
                    }
                  }}
                  className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-media-secondary text-media-on-secondary hover:bg-media-secondary/90 shrink-0"
                >
                  Enable
                </Button>
              )}
              {permission === "granted" && (
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Enabled</span>
                </div>
              )}
            </div>
          </div>

          {isStandalone && <PWAStatus />}
        </div>
      )}
    </div>
  );
}


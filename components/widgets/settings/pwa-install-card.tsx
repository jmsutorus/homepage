"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { PWAStatus } from "@/components/pwa/pwa-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export function PWAInstallCard() {
  const { canInstall, isInstalled, isStandalone, promptInstall } =
    useInstallPrompt();
  const { isUpdateAvailable, updateServiceWorker, checkForUpdate } =
    useServiceWorkerUpdate();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      toast.success("App installed successfully!");
    } else {
      toast.error("Installation was cancelled");
    }
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    const checked = await checkForUpdate();

    if (checked) {
      // Wait a bit for the update to be detected
      setTimeout(() => {
        setIsCheckingUpdate(false);
        if (!isUpdateAvailable) {
          toast.success("You're running the latest version!");
        }
      }, 1000);
    } else {
      setIsCheckingUpdate(false);
      toast.error("Unable to check for updates");
    }
  };

  const handleUpdate = () => {
    updateServiceWorker();
    toast.info("Updating app...");
  };

  // Detect platform for instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Install App
            </CardTitle>
            <CardDescription>
              Install Homepage as a desktop or mobile app
            </CardDescription>
            {isStandalone && <PWAStatus />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
        {/* Installation Status */}
        {isInstalled || isStandalone ? (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  App Installed
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  You&apos;re currently running Homepage as an installed app
                </p>
              </div>
            </div>
          </div>
        ) : canInstall ? (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Install Homepage on your device for quick access, offline
                support, and a native app experience.
              </p>
            </div>
            <Button onClick={handleInstall} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Installation is not available in your current browser. Try using
              Chrome, Edge, or Safari.
            </p>
          </div>
        )}

        {/* Platform-specific instructions */}
        {!isStandalone && (
          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-medium">Installation Instructions</h4>

            {/* Desktop Instructions */}
            {!isMobile && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Desktop (Chrome/Edge)
                  </span>
                </div>
                <ol className="ml-6 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>
                    Click the install icon (⊕ or <Download className="inline h-3 w-3" />) in the
                    address bar
                  </li>
                  <li>Click &quot;Install&quot; in the popup</li>
                  <li>The app will open in a new window</li>
                </ol>
              </div>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">iOS (Safari)</span>
                </div>
                <ol className="ml-6 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>
                    Tap the Share button{" "}
                    <ExternalLink className="inline h-3 w-3" /> in Safari
                  </li>
                  <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                  <li>Tap &quot;Add&quot; to confirm</li>
                  <li>Find the app icon on your home screen</li>
                </ol>
              </div>
            )}

            {/* Android Instructions */}
            {isAndroid && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Android (Chrome)
                  </span>
                </div>
                <ol className="ml-6 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Tap the menu (⋮) in the top right</li>
                  <li>Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;</li>
                  <li>Tap &quot;Install&quot; to confirm</li>
                  <li>Find the app icon in your app drawer</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">App Features</p>
          <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
            <li>Quick access from your desktop or home screen</li>
            <li>Offline support - view content without internet</li>
            <li>Native app experience with no browser UI</li>
            <li>Fast loading with intelligent caching</li>
            <li>Background sync for offline changes</li>
          </ul>
        </div>

        {/* App Updates */}
        {(isInstalled || isStandalone) && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium">App Updates</h4>
            {isUpdateAvailable ? (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-400">
                        Update Available
                      </p>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                        A new version is ready to install
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleUpdate}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                <div>
                  <p className="text-sm font-medium">
                    You&apos;re running the latest version
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updates are checked automatically
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                >
                  {isCheckingUpdate ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check for Updates
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
}

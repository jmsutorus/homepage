"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { CheckCircle2, Monitor, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PWAStatus() {
  const { isInstalled, isStandalone } = useInstallPrompt();

  if (!isStandalone) {
    return null;
  }

  // Detect device type
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <Badge variant="secondary" className="gap-1.5">
      <CheckCircle2 className="h-3 w-3" />
      <span>Running as app</span>
      {isMobile ? (
        <Smartphone className="h-3 w-3" />
      ) : (
        <Monitor className="h-3 w-3" />
      )}
    </Badge>
  );
}

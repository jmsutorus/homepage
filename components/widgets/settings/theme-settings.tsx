"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Forest Night (Dark) */}
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "group relative flex flex-col items-start p-4 rounded-lg transition-all h-full text-left",
          theme === "dark"
            ? "bg-media-surface border-2 border-media-primary ring-2 ring-media-primary/10"
            : "bg-media-surface border border-media-outline-variant/30 hover:border-media-primary/50"
        )}
      >
        <div className="w-full h-24 mb-4 rounded bg-[#03170b] border border-media-outline-variant/20 flex flex-col p-2 gap-1 overflow-hidden">
          <div className="w-1/2 h-2 bg-white/20 rounded"></div>
          <div className="w-3/4 h-2 bg-white/10 rounded"></div>
          <div className="mt-auto w-full h-8 bg-[#192e20] rounded-sm"></div>
        </div>
        <span className={cn(
          "font-bold",
          theme === "dark" ? "text-media-on-surface" : "text-media-on-surface-variant"
        )}>
          Forest Night
        </span>
        <span className="text-media-on-surface-variant text-xs">
          {theme === "dark" ? "Selected" : "Midnight deep greens"}
        </span>
        {theme === "dark" && (
          <div className="absolute top-2 right-2 bg-media-primary text-media-on-primary rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        )}
      </button>

      {/* Mist Morning (Light) */}
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "group relative flex flex-col items-start p-4 rounded-lg transition-all h-full text-left",
          theme === "light"
            ? "bg-media-surface border-2 border-media-primary ring-2 ring-media-primary/10"
            : "bg-media-surface border border-media-outline-variant/30 hover:border-media-primary/50"
        )}
      >
        <div className="w-full h-24 mb-4 rounded bg-white border border-media-outline-variant/10 flex flex-col p-2 gap-1 overflow-hidden">
          <div className="w-1/2 h-2 bg-media-surface-variant rounded"></div>
          <div className="w-3/4 h-2 bg-media-surface-container rounded"></div>
          <div className="mt-auto w-full h-8 bg-media-surface-container-low rounded-sm"></div>
        </div>
        <span className={cn(
          "font-bold",
          theme === "light" ? "text-media-on-surface" : "text-media-on-surface-variant"
        )}>
          Mist Morning
        </span>
        <span className="text-media-on-surface-variant text-xs">
          {theme === "light" ? "Selected" : "Soft natural light"}
        </span>
        {theme === "light" && (
          <div className="absolute top-2 right-2 bg-media-primary text-media-on-primary rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        )}
      </button>
    </div>
  );
}


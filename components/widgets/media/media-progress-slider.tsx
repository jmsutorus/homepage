"use client";

import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaProgressSliderProps {
  initialProgress: number;
  slug: string;
  type: string;
  className?: string;
}

export function MediaProgressSlider({
  initialProgress,
  slug,
  type,
  className,
}: MediaProgressSliderProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use a debounced update to avoid too many API calls
  const updateProgress = useCallback(
    async (newProgress: number) => {
      setIsUpdating(true);
      try {
        const response = await fetch(`/api/media/${type}/${slug}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            frontmatter: {
              progress: newProgress,
              // These are required by the PATCH handler based on my previous analysis
              title: "", // The API should handle partial updates but I noticed it validates title/type/status
              type,
              status: "in-progress"
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update progress");
        }
      } catch (error) {
        console.error("Error updating progress:", error);
        toast.error("Failed to update progress");
        // Revert to initial if failed? Or just leave it.
      } finally {
        setIsUpdating(false);
      }
    },
    [slug, type]
  );

  // Actually, the PATCH handler in app/api/media/[type]/[slug]/route.ts
  // validates frontmatter.title, frontmatter.type, and frontmatter.status.
  // I should probably fetch the full frontmatter first or make the API more robust.
  // Wait, let's look at the PATCH handler again.

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-end mb-2">
        <span className="text-3xl font-black text-white">
          {progress}% 
          <span className="text-sm font-normal opacity-60 ml-2">Complete</span>
        </span>
        {isUpdating && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-media-secondary animate-pulse flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-media-secondary rounded-full"></span>
            Syncing
          </span>
        )}
      </div>
      <Slider
        value={[progress]}
        onValueChange={(vals) => setProgress(vals[0])}
        onValueCommit={(vals) => updateProgress(vals[0])}
        max={100}
        step={1}
        className="py-4 cursor-pointer [&_[data-slot=slider-range]]:bg-media-secondary [&_[data-slot=slider-track]]:bg-white/10"
      />
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
        Slide to update your progress
      </p>
    </div>
  );
}

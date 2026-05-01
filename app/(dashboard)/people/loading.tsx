"use client";

import { TreeRingLoader } from "@/components/ui/tree-ring-loader";

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-8 p-6">
      <TreeRingLoader size={120} />
      
      <div className="flex flex-col items-center text-center gap-3 max-w-xs">
        <h2 className="text-2xl font-bold font-lexend text-media-primary tracking-tight">
          Gathering the guild
        </h2>
        <p className="text-media-on-surface-variant text-base leading-relaxed opacity-70">
          Connecting with your companions...
        </p>
      </div>

      <div className="flex items-center gap-1.5 pt-4">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="size-1.5 rounded-full bg-media-secondary/40 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

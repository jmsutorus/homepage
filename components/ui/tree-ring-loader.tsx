"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TreeRingLoaderProps {
  className?: string;
  size?: number;
}

/**
 * A premium loading animation that mimics tree rings,
 * matching the site's organic earth-toned aesthetic.
 * This component uses an external SVG file for optimal browser caching.
 */
export function TreeRingLoader({ 
  className, 
  size = 120 
}: TreeRingLoaderProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center pointer-events-none select-none", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      {/* 
        Using an img tag with a static path ensures the browser caches the SVG 
        and the CSS animations run efficiently outside of the main JS thread.
      */}
      <img
        src="/tree-ring-loader.svg"
        alt=""
        width={size}
        height={size}
        className="w-full h-full object-contain transition-opacity duration-300"
      />
    </div>
  );
}

"use client";

import React from "react";
import { TreeRingLoader } from "@/components/ui/tree-ring-loader";

export default function LoaderDemo() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <h1 className="text-3xl font-bold mb-8 font-lexend">Tree Ring Loader Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Small (64px)</p>
          <TreeRingLoader size={64} />
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Medium (120px)</p>
          <TreeRingLoader size={120} />
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Large (240px)</p>
          <TreeRingLoader size={240} />
        </div>
      </div>

      <div className="mt-16 max-w-2xl text-center space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          This loader is designed to match the site&apos;s organic earth-toned aesthetic. 
          It uses an optimized SVG with embedded CSS animations, making it extremely lightweight and easy for browsers to cache.
        </p>
        <p className="text-xs text-muted-foreground opacity-50">
          The rings rotate at varying speeds and directions to mimic the organic growth of a tree.
          It also supports system-level dark mode automatically.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="bg-media-surface text-media-on-surface font-lexend antialiased min-h-[80vh] flex flex-col justify-center items-center p-6 md:p-12 selection:bg-media-secondary/20 relative rounded-3xl overflow-hidden my-8 mx-4 md:mx-8 border border-media-outline-variant/30">
      <main className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24 relative z-10">
        {/* Illustration Side */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
          <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden bg-media-surface-container-low dark:bg-white/80 isolate">
            <Image
              alt="Broken bridge illustration"
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
              src="/images/error-illustration.png"
              fill
              priority
            />
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2">
          <span className="text-sm uppercase tracking-[0.05em] text-media-secondary font-semibold mb-4">
            Something went wrong
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-media-primary leading-tight mb-6">
            The Bridge is Out...
          </h1>
          <p className="text-lg md:text-xl text-media-on-surface-variant max-w-md mb-10 leading-relaxed">
            {"It looks like the path ahead is blocked by an unexpected error. Don't worry, we've been notified and are working on clearing the trail."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={reset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-media-primary hover:bg-media-primary/90 text-media-on-primary px-8 py-4 rounded-lg font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                refresh
              </span>
              Try the Path Again
            </button>
            
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-media-surface-container hover:bg-media-surface-container-high text-media-on-surface px-8 py-4 rounded-lg font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[20px]">
                explore
              </span>
              Back to Base Camp
            </Link>
          </div>
        </div>
      </main>

      {/* Subtle Background Texture/Gradients to avoid flatness */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-media-error-container/20 via-transparent to-transparent opacity-50"></div>
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-media-primary-container/10 via-transparent to-transparent opacity-50"></div>
    </div>
  );
}

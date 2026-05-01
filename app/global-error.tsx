"use client";

import { useEffect } from "react";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-font-lexend",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" className={lexend.variable}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="font-lexend antialiased bg-media-surface text-media-on-surface">
        <div className="min-h-screen flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden">
          <main className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24 relative z-10">
            {/* Illustration Side */}
            <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
              <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden bg-media-surface-container-low dark:bg-white/80 isolate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Broken bridge illustration"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
                  src="/images/error-illustration.png"
                />
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2">
              <span className="text-sm uppercase tracking-[0.05em] text-media-secondary font-semibold mb-4">
                Critical System Error
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-media-primary leading-tight mb-6">
                Trail Blocked.
              </h1>
              <p className="text-lg md:text-xl text-media-on-surface-variant max-w-md mb-10 leading-relaxed">
                {"A serious error has occurred that we couldn't recover from automatically. We're working on fixing the foundations."}
              </p>

              <button
                onClick={reset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-media-primary hover:bg-media-primary/90 text-media-on-primary px-8 py-4 rounded-lg font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  refresh
                </span>
                Rebuild the Bridge
              </button>
            </div>
          </main>

          {/* Subtle Background Texture/Gradients */}
          <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-media-error-container/30 via-transparent to-transparent opacity-50"></div>
          <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-media-primary-container/20 via-transparent to-transparent opacity-50"></div>
        </div>
      </body>
    </html>
  );
}

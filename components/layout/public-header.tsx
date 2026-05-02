"use client";

import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="bg-media-surface/80 backdrop-blur-xl font-lexend tracking-tight font-medium top-0 sticky z-50 border-b border-media-primary/5">
      <div className="flex justify-between items-center px-8 py-6 w-full max-w-screen-2xl mx-auto">
        <Link href="/">
          <div className="text-2xl font-black tracking-tighter text-media-primary cursor-pointer">Earthbound</div>
        </Link>
        <div className="flex items-center">
          <Link href="/sign-in">
            <button className="cursor-pointer bg-media-secondary text-media-on-secondary px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm">
              Login
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

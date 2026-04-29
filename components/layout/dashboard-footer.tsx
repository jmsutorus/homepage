"use client";

import Link from "next/link";
import { Target } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="px-8 py-24 border-t border-media-outline-variant/10 flex flex-col items-center shrink-0">
      <div className="w-14 h-14 bg-media-secondary/5 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Target className="text-media-secondary h-7 w-7" />
      </div>
      <p className="text-[10px] text-media-on-surface-variant uppercase tracking-[0.4em] font-black">Homepage</p>
      <div className="mt-10 flex flex-wrap justify-center gap-10 text-[10px] uppercase font-black tracking-widest text-media-secondary/60">
        <Link className="cursor-pointer hover:text-media-secondary transition-colors" href="/about">About</Link>
        <Link className="cursor-pointer hover:text-media-secondary transition-colors" href="/terms">Terms of Service</Link>
        <Link className="cursor-pointer hover:text-media-secondary transition-colors" href="/privacy">Privacy Policy</Link>
        <Link className="cursor-pointer hover:text-media-secondary transition-colors" href="https://buymeacoffee.com/homepage_sutorus" target="_blank">Buy me a coffee</Link>
        <Link className="cursor-pointer hover:text-media-secondary transition-colors" href="/contact">Support</Link>
        <Link className="cursor-pointer hover:text-media-secondary transition-colors" href="https://docs.myterra.app">Docs</Link>
      </div>
    </footer>
  );
}

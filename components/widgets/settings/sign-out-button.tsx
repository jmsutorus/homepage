"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="w-full group flex items-center justify-center gap-3 p-4 bg-media-surface hover:bg-media-error/5 text-media-on-surface-variant hover:text-media-error border border-media-outline-variant/40 rounded-lg transition-all active:scale-95"
    >
      <LogOut className="h-5 w-5" />
      <span className="font-bold tracking-tight">Sign Out</span>
    </button>
  );
}

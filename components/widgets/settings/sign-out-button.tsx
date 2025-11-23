"use client";

import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Sign Out
        </h3>
        <p className="text-sm text-muted-foreground">
          Sign out of your account
        </p>
      </div>
      <div className="p-6 pt-0">
        <Button variant="destructive" onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

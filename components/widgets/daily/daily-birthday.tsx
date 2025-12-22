"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake } from "lucide-react";

export function DailyBirthday() {
  return (
    <Card className="overflow-hidden relative">
      {/* Festive gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-yellow-500/5 pointer-events-none" />

      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-pink-500">
          <Cake className="h-5 w-5" />
          Birthday Celebration
        </CardTitle>
        <CardDescription>
          It&apos;s your special day!
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center space-y-2">
          <p className="text-2xl">🎂</p>
          <p className="text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
            Happy Birthday!
          </p>
          <p className="text-sm text-muted-foreground">
            Have a wonderful day filled with joy and celebration! 🎉
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

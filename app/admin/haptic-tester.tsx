"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHaptic, type HapticPattern } from "@/hooks/use-haptic";
import { Zap, Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";

const HAPTIC_OPTIONS: { label: string; pattern: HapticPattern; icon: any; variant: "default" | "outline" | "secondary" | "destructive" }[] = [
  { label: "Light Tap", pattern: "light", icon: Info, variant: "outline" },
  { label: "Medium Press", pattern: "medium", icon: Activity, variant: "secondary" },
  { label: "Heavy Impact", pattern: "heavy", icon: Zap, variant: "default" },
  { label: "Success", pattern: "success", icon: CheckCircle, variant: "default" },
  { label: "Error", pattern: "error", icon: AlertTriangle, variant: "destructive" },
];

export function HapticTester() {
  const { trigger, isEnabled } = useHaptic();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haptic Feedback Test</CardTitle>
        <CardDescription>
          Test the different haptic patterns available in the application. 
          {!isEnabled && (
            <span className="text-destructive block mt-1 font-medium">
              Note: Haptic feedback is currently disabled (requires mobile device, session setting enabled, and browser support).
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {HAPTIC_OPTIONS.map((option) => (
          <Button
            key={option.pattern}
            variant={option.variant}
            onClick={() => trigger(option.pattern)}
            className="flex items-center gap-2"
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

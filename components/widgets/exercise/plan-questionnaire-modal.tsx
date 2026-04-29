"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHaptic } from "@/hooks/use-haptic";
import { toast } from "sonner";
import { Sparkles, Loader2, Dumbbell, ShieldAlert, Heart, Calendar } from "lucide-react";

interface PlanQuestionnaireModalProps {
  children?: React.ReactNode;
  onPlanGenerated: (plan: any) => void;
}

export function PlanQuestionnaireModal({ children, onPlanGenerated }: PlanQuestionnaireModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const haptic = useHaptic();

  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [primaryGoal, setPrimaryGoal] = useState("general");
  const [equipment, setEquipment] = useState("none");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [limitations, setLimitations] = useState("");

  const handleOpen = (val: boolean) => {
    if (val) haptic.trigger("light");
    setOpen(val);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptic.trigger("heavy");
    setLoading(true);

    try {
      const answers = {
        fitnessLevel,
        primaryGoal,
        equipment,
        daysPerWeek: parseInt(daysPerWeek, 10),
        limitations: limitations.trim() || undefined,
      };

      const res = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");
      
      onPlanGenerated(data.plan);
      toast.success("Personalized workout plan generated!");
      setOpen(false);
      haptic.trigger("success");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
      haptic.trigger("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <div onClick={() => handleOpen(true)} className="contents">
          {children || (
            <Button 
              variant="outline" 
              className="rounded-xl border-border/40 font-bold hover:bg-muted/50"
              onClick={() => haptic.trigger("light")}
            >
              Customize Plan (New/Beginner)
            </Button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-border/40 p-6 md:p-8 overflow-hidden">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20"
             style={{ background: "#059669" }} />
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20"
             style={{ background: "#a3e635" }} />

        <DialogHeader>
          <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
            Build Your Plan
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Answer a few questions to help Gemini design the perfect custom plan for you.
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 pt-6 relative z-10">
          
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Current Fitness Level
            </Label>
            <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-muted/40 font-semibold tracking-tight">
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="beginner">Beginner (Just starting out)</SelectItem>
                <SelectItem value="intermediate">Intermediate (Active a few months)</SelectItem>
                <SelectItem value="advanced">Advanced (Work out regularly)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Primary Fitness Goal
            </Label>
            <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-muted/40 font-semibold tracking-tight">
                <SelectValue placeholder="What are you aiming for?" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="weight-loss">Lose Weight & Burn Fat</SelectItem>
                <SelectItem value="muscle-gain">Build Muscle & Strength</SelectItem>
                <SelectItem value="endurance">Improve Cardio & Endurance</SelectItem>
                <SelectItem value="general">Stay Active & Balanced Health</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
              Equipment Available
            </Label>
            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-muted/40 font-semibold tracking-tight">
                <SelectValue placeholder="What can you use?" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">Bodyweight / No Equipment</SelectItem>
                <SelectItem value="basic">Dumbbells & Resistance Bands</SelectItem>
                <SelectItem value="gym">Full Gym Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Workout Frequency (Days/Week)
            </Label>
            <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-muted/40 font-semibold tracking-tight">
                <SelectValue placeholder="How many days can you commit?" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="4">4 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="6">6 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Limitations or Injuries (Optional)
            </Label>
            <Input
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="e.g. Bad knee, avoid squats..."
              className="h-12 rounded-xl bg-muted/40 font-medium tracking-tight focus-visible:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col items-center pt-4 gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl h-12 text-base font-black tracking-tight bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white shadow-md transition-all hover:scale-[1.02] border-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {loading ? "Generating..." : "Generate Custom Plan"}
            </Button>
            <p className="text-xs text-muted-foreground/80 font-medium text-center leading-relaxed">
              ⚡ Plan creation takes about 2-3 minutes. You can safely close this window while it processes in the background!
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/use-haptic";
import { CalendarPlus, CheckCircle2, X, Dumbbell, Activity, Moon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function parseDurationToMinutes(timeStr: any): number {
  if (!timeStr) return 0;
  if (typeof timeStr === 'number') return timeStr;
  
  const str = String(timeStr).toLowerCase().trim();
  
  if (str.includes(':')) {
    const parts = str.split(':').map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      return (h * 60) + m + (s / 60);
    } else if (parts.length === 2) {
      const [m, s] = parts;
      return m + (s / 60);
    }
  }
  
  let value = 0;
  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    value = parseFloat(numMatch[1]);
  } else {
    return 0;
  }
  
  if (str.includes('hour') || str.includes('hr')) {
    value = value * 60;
  } else if (str.includes('second') || str.includes('sec')) {
    value = value / 60;
  }
  
  if (str.includes('per side')) {
    value = value * 2;
  }
  
  return Math.round(value * 10) / 10;
}

export function GeneratedPlanModal({ plan, children, onAdded }: { plan: any; children: React.ReactNode; onAdded?: () => void; }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addedDays, setAddedDays] = useState<number[]>(() => {
    if (!plan?.days) return [];
    return plan.days
      .map((day: any, idx: number) => (day.added ? idx : -1))
      .filter((idx: number) => idx !== -1);
  });
  const haptic = useHaptic();

  const handleOpen = (val: boolean) => {
    if (val) haptic.trigger("light");
    setOpen(val);
  };

  const handleAddDay = async (dayIndex: number, dayData: any, customDate?: string) => {
    haptic.trigger("medium");
    setAdding(true);
    try {
      let dateStr = customDate;
      if (!dateStr) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayIndex);
        dateStr = targetDate.toISOString().split("T")[0];
      }

      const mappedExercises = dayData.exercises ? dayData.exercises.map((ex: any) => ({
        description: ex.name,
        reps: ex.reps ? Number(ex.reps) : 0,
        sets: ex.sets ? Number(ex.sets) : 0,
        muscle: ex.muscle || "",
        time: parseDurationToMinutes(ex.time || ex.duration)
      })) : [];
      
      let estimatedLength = 45;
      if (dayData.type === "strength") estimatedLength = 60;
      if (dayData.type === "cardio") estimatedLength = 30;

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          time: "08:00",
          length: estimatedLength,
          difficulty: "moderate",
          type: dayData.type === "rest" ? "other" : dayData.type,
          exercises: mappedExercises,
          notes: dayData.description,
          completed: false
        })
      });

      if (!response.ok) throw new Error("Failed to add activity");

      // Update Firestore added state
      await fetch("/api/workouts/added", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber: dayData.dayNumber })
      });

      setAddedDays(prev => [...prev, dayIndex]);
      haptic.trigger("success");
      toast.success(`Day ${dayData.dayNumber} scheduled!`);
      if (onAdded) onAdded();
    } catch (e) {
      console.error(e);
      haptic.trigger("error");
      toast.error("Failed to schedule workout");
    } finally {
      setAdding(false);
    }
  };

  const handleCommitAll = async () => {
    haptic.trigger("heavy");
    for (let i = 0; i < (plan?.days?.length || 0); i++) {
      if (!addedDays.includes(i) && plan.days[i].type !== "rest") {
        await handleAddDay(i, plan.days[i]);
      }
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <div onClick={() => handleOpen(true)} className="contents">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="p-0 border-none sm:max-w-6xl overflow-hidden bg-background rounded-xl flex flex-col md:flex-row max-h-[90vh] shadow-2xl">
        {/* Asymmetric Editorial Sidebar */}
        <aside className="hidden md:flex md:w-1/3 bg-[#061b0e] p-8 md:p-12 flex-col justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="mb-8">
              <span className="text-[#819986] text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                Premium Experience
              </span>
              <h1 className="text-[#faf9f6] font-black text-4xl md:text-5xl leading-tight tracking-tighter">
                Forest <br /> Pulse
              </h1>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-1 bg-[#9f402d] rounded-full"></div>
              <p className="text-[#819986] font-medium leading-relaxed text-sm">
                {plan?.summary || "This 7-day 'Forest Pulse' plan is tailored for sustainable growth, balancing high-intensity output with mindful recovery to align with your goals."}
              </p>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#061b0e] to-[#1b3022] pointer-events-none -z-10"></div>
          <div className="mt-12 opacity-40 grayscale contrast-125 z-0">
             <img 
               className="w-full aspect-[4/3] object-cover rounded-lg" 
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBWnzwcP10PUHC_uR03b0MQiqPUWFJsHbOPJ5CX0-4CiIgsWMqxAolX8qScjy80XjonvCxuiWQ40YXgULNSBnHI76nmMgTNuPiLUAFGAWazM1kDExqj3R-uTu3-5JnozrYILqHtSQ-9zvHUYzivb1idtAv48wkGT8Ddw8R-MmZmbzJdrtT913a6yUoL_u_3UIcZv7lHHuTF-rwpqVXMuWlxq0mFti8MuqnugnUd_vPgE8rmiYagQALgLfuz9t0VlIPzHgZzjZ9dAQ" 
               alt="abstract moody forest mist" 
             />
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto bg-muted/30 p-6 md:p-12 relative">
          <div className="max-w-2xl mx-auto">
            <header className="flex justify-between items-start mb-10">
              <div>
                <DialogTitle asChild>
                  <h2 className="text-primary font-black text-2xl tracking-tight">Custom Movement Plan</h2>
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-muted-foreground text-sm mt-1 font-medium">Generated specifically for your current baseline</p>
                </DialogDescription>
              </div>
              <button 
                onClick={() => handleOpen(false)}
                className="cursor-pointer text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 font-medium mb-8">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>AI-generated content can be incorrect. Consult a healthcare provider before starting any physical fitness routine.</span>
            </div>

            <div className="space-y-12">
              {plan?.days?.map((day: any, i: number) => {
                const isAdded = addedDays.includes(i);
                
                return (
                  <div key={i} className="relative group">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#9f402d] opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-none">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                          day.type === "rest" 
                            ? "border-2 border-[#061b0e]/20 text-[#061b0e]/60 dark:border-[#faf9f6]/20 dark:text-[#faf9f6]/60" 
                            : "bg-[#061b0e] text-[#faf9f6]"
                        )}>
                          {day.dayNumber}
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-primary font-black text-xl tracking-tight">{day.title}</h3>
                            <p className="text-muted-foreground text-sm font-medium mt-1">{day.description}</p>
                          </div>
                          {day.type !== "rest" && (
                            <div className="flex flex-col items-end gap-2">
                              {!isAdded && (
                                <input 
                                  type="date"
                                  defaultValue={new Date(new Date().setDate(new Date().getDate() + i)).toISOString().split("T")[0]}
                                  id={`date-${i}`}
                                  className="text-[10px] px-2 py-1.5 rounded-md bg-muted border border-border/50 w-[110px] font-bold text-muted-foreground focus:ring-1 focus:ring-lime-500 outline-none uppercase tracking-wider"
                                />
                              )}
                              <Button 
                                size="sm" 
                                variant={isAdded ? "secondary" : "default"}
                                disabled={isAdded || adding}
                                className={cn(
                                  "rounded-lg font-bold text-xs uppercase tracking-widest gap-1.5 h-9",
                                  !isAdded && "bg-[#9f402d] hover:bg-[#802918] text-white"
                                )}
                                onClick={() => {
                                  const dateInput = document.getElementById(`date-${i}`) as HTMLInputElement;
                                  const selectedDateStr = dateInput ? dateInput.value : undefined;
                                  handleAddDay(i, day, selectedDateStr);
                                }}
                              >
                                {isAdded ? (
                                  <><CheckCircle2 className="h-3.5 w-3.5" /> Added</>
                                ) : (
                                  <><CalendarPlus className="h-3.5 w-3.5" /> Add</>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Exercise Details depending on type */}
                        {day.type === "rest" ? (
                           <div className="p-6 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-center mt-2 bg-background/50">
                             <Moon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                             <p className="text-muted-foreground text-sm italic font-medium">Recovery is where the growth happens.</p>
                           </div>
                        ) : day.type === "cardio" || day.type === "run" ? (
                          <div className="space-y-3 mt-2">
                            {day.exercises?.map((ex: any, idx: number) => {
                              const isSingleExercise = day.exercises.length === 1;
                              if (isSingleExercise) {
                                return (
                                  <div key={idx} className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="bg-muted p-3 rounded-lg flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Distance</span>
                                      <span className="text-primary font-bold">{ex.distance || "N/A"} {ex.distanceUnit || 'mi'}</span>
                                    </div>
                                    <div className="bg-muted p-3 rounded-lg flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Time</span>
                                      <span className="text-primary font-bold">{ex.time || "N/A"}</span>
                                    </div>
                                    <div className="bg-muted p-3 rounded-lg flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Intensity</span>
                                      <span className="text-lime-600 dark:text-lime-400 font-bold capitalize">{ex.intensity || "Moderate"}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={idx} className="bg-background p-4 rounded-xl border-l-4 border-primary shadow-sm">
                                  <span className="text-primary font-bold block mb-3 text-lg">{ex.name}</span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {ex.distance && (
                                      <div className="bg-muted p-3 rounded-lg flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Distance</span>
                                        <span className="text-primary font-bold">{ex.distance} {ex.distanceUnit || 'mi'}</span>
                                      </div>
                                    )}
                                    {ex.time && (
                                      <div className="bg-muted p-3 rounded-lg flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Time</span>
                                        <span className="text-primary font-bold">{ex.time}</span>
                                      </div>
                                    )}
                                    {ex.intensity && (
                                      <div className="bg-muted p-3 rounded-lg flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Intensity</span>
                                        <span className="text-lime-600 dark:text-lime-400 font-bold capitalize">{ex.intensity}</span>
                                      </div>
                                    )}
                                    {ex.elevation && (
                                      <div className="bg-muted p-3 rounded-lg flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mb-1">Elevation</span>
                                        <span className="text-primary font-bold">{ex.elevation}m</span>
                                      </div>
                                    )}
                                  </div>
                                  {ex.description && <p className="text-muted-foreground text-xs mt-3 font-medium">{ex.description}</p>}
                                </div>
                              );
                            })}
                          </div>
                        ) : day.type === "flexibility" ? (
                          <div className="space-y-2 mt-2">
                            {day.exercises?.map((ex: any, idx: number) => (
                              <div key={idx} className="bg-primary/10 p-4 rounded-lg flex items-center gap-3">
                                <Activity className="w-5 h-5 text-primary shrink-0" />
                                <span className="text-primary font-medium italic">
                                  {ex.name}
                                  {(ex.sets || ex.reps || ex.time) ? ` — ${[ex.sets ? `${ex.sets} Sets` : null, ex.reps ? `${ex.reps} Reps` : null, ex.time].filter(Boolean).join(" / ")}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {day.exercises?.map((ex: any, idx: number) => (
                              <div key={idx} className="bg-background p-4 rounded-xl flex flex-col border-l-2 border-primary/30 gap-2 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex w-10 h-10 bg-muted rounded-full items-center justify-center text-primary shrink-0">
                                      <Dumbbell className="w-5 h-5" />
                                    </div>
                                    <span className="text-primary font-bold block">{ex.name}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm whitespace-nowrap self-start sm:self-auto ml-14 sm:ml-0">
                                    <div className="flex gap-3">
                                      {ex.sets && <span className="text-primary"><b className="font-bold">{ex.sets}</b> Sets</span>}
                                      {ex.reps && <span className="text-primary"><b className="font-bold">{ex.reps}</b> Reps</span>}
                                      {(!ex.sets && !ex.reps && (ex.time || ex.duration)) && (
                                        <span className="text-primary font-bold">{ex.time || ex.duration}</span>
                                      )}
                                    </div>
                                    {ex.weight ? <span className="text-lime-600 dark:text-lime-400 font-bold ml-2">{ex.weight}kg</span> : null}
                                  </div>
                                </div>
                                {ex.description && (
                                  <span className="text-muted-foreground text-xs font-medium block ml-14 sm:ml-14 mt-1">{ex.description}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="mt-16 pt-8 border-t border-border/30 flex flex-col sm:flex-row justify-end items-center gap-6">
              
              <div className="flex gap-4 w-full sm:w-auto">
                <Button 
                  variant="ghost"
                  className="rounded-lg font-bold flex-1 sm:flex-none text-[#061b0e] hover:bg-[#061b0e]/5 dark:text-[#faf9f6] dark:hover:bg-white/10 h-11 px-8"
                  onClick={() => handleOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#061b0e] hover:bg-[#061b0e]/90 text-[#faf9f6] rounded-lg font-bold shadow-lg shadow-[#061b0e]/20 hover:-translate-y-0.5 transition-all flex-1 sm:flex-none h-11 px-8"
                  onClick={handleCommitAll}
                  disabled={adding}
                >
                  Commit to Plan
                </Button>
              </div>
            </footer>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

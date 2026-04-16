
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Activity,
  Dumbbell,
  Zap,
  Flame,
  Trophy,
  Timer,
  Share2,
  Trash2,
  Pencil,
  Plus,
  Route,
  Mountain,
  Copy,
  CheckCircle2,
  History,
  TrendingUp,
  Award,
  ChevronRight,
  Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";
import { ExerciseFormModal, type Exercise } from "@/components/widgets/exercise/exercise-form-modal";
import { SplitFormModal, type Split } from "@/components/widgets/exercise/split-form-modal";
import { CopyActivityModal } from "@/components/widgets/exercise/copy-activity-modal";
import { CompleteActivityModal } from "@/components/widgets/exercise/complete-activity-modal";
import { MuscleMap } from "@/components/widgets/exercise/muscle-map";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { DetailCard } from "@/Shared/Components/Cards/DetailCard";
import { HomepageFooter } from "@/Shared/Components/Footers/HomepageFooter";

interface ExerciseDetailClientProps {
  activity: WorkoutActivity;
}

export function ExerciseDetailClient({ activity: initialActivity }: ExerciseDetailClientProps) {
  const router = useRouter();
  const [activity, setActivity] = useState<WorkoutActivity>(initialActivity);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Exercise Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  // Split Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [editingSplitIndex, setEditingSplitIndex] = useState<number | null>(null);

  // Copy Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Complete Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const isRun = activity.type === "run";
  const isStrength = activity.type === "strength";

  // Parse items safely
  const items: (Exercise | Split)[] = useMemo(() => {
    try {
      return typeof activity.exercises === 'string' 
        ? JSON.parse(activity.exercises) 
        : activity.exercises;
    } catch {
      return [];
    }
  }, [activity.exercises]);

  const handleActivityUpdated = () => {
    router.refresh();
    setIsEditModalOpen(false);
  };
  
  const handleActivityCompleted = () => {
    router.refresh();
    toast.success("Workout marked as complete!");
  };

  const updateItems = async (newItems: (Exercise | Split)[]) => {
    try {
      const response = await fetch("/api/activities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activity.id,
          exercises: newItems // The API expects 'exercises' field for the JSON data
        }),
      });

      if (!response.ok) throw new Error("Failed to update items");

      setActivity({ ...activity, exercises: JSON.stringify(newItems) as any });
      toast.success(isRun ? "Splits updated" : "Exercises updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    }
  };

  // ... (Keep existing handlers for Save/Delete/ModalOpeners/etc.)
  // Exercise Handlers
  const handleSaveExercise = async (exercise: Exercise) => {
    const newItems = [...items] as Exercise[];
    if (editingExerciseIndex !== null) {
      newItems[editingExerciseIndex] = exercise;
    } else {
      newItems.push(exercise);
    }
    await updateItems(newItems);
    setEditingExerciseIndex(null);
  };

  const handleDeleteExercise = async (index: number) => {
    if (!confirm("Delete this exercise?")) return;
    const newItems = items.filter((_, i) => i !== index);
    await updateItems(newItems);
  };

  // Split Handlers
  const handleSaveSplit = async (split: Split) => {
    const newItems = [...items] as Split[];
    if (editingSplitIndex !== null) {
      newItems[editingSplitIndex] = split;
    } else {
      newItems.push(split);
    }
    await updateItems(newItems);
    setEditingSplitIndex(null);
  };

  const handleDeleteSplit = async (index: number) => {
    if (!confirm("Delete this split?")) return;
    const newItems = items.filter((_, i) => i !== index);
    await updateItems(newItems);
  };
  
  // Modal Openers
  const openAddItem = () => {
    if (isRun) {
      setEditingSplitIndex(null);
      setIsSplitModalOpen(true);
    } else {
      setEditingExerciseIndex(null);
      setIsExerciseModalOpen(true);
    }
  };

  const openEditItem = (index: number) => {
    if (isRun) {
      setEditingSplitIndex(index);
      setIsSplitModalOpen(true);
    } else {
      setEditingExerciseIndex(index);
      setIsExerciseModalOpen(true);
    }
  };

  const handleDeleteItem = (index: number) => {
    if (isRun) {
      handleDeleteSplit(index);
    } else {
      handleDeleteExercise(index);
    }
  };

  const handleActivityDeleted = () => {
    router.push("/exercise");
    toast.success("Workout deleted");
  };

  const handleCopy = async (date: Date) => {
    try {
      const newActivity = {
        ...activity,
        date: format(date, "yyyy-MM-dd"),
        completed: false,
        completed_at: null,
        completion_notes: null,
      };
      // Remove ID and timestamps to create a new entry
      const { id, created_at, updated_at, ...activityToCreate } = newActivity as any;

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityToCreate),
      });

      if (!res.ok) throw new Error("Failed to copy workout");
      
      const data = await res.json();
      toast.success("Workout copied to " + format(date, "MMM d"));
      router.push(`/exercise/${data.id}`);
    } catch (error) {
      toast.error("Failed to copy workout");
      console.error(error);
    } finally {
      setIsCopyModalOpen(false);
    }
  };

  const activityDate = new Date(activity.date + "T" + (activity.time || "00:00"));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "moderate": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "hard": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "very hard": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getTypeIcon = () => {
    switch (activity.type) {
        case "cardio": return <Activity className="h-6 w-6" />;
        case "strength": return <Dumbbell className="h-6 w-6" />;
        case "flexibility": return <Zap className="h-6 w-6" />;
        case "sports": return <Flame className="h-6 w-6" />;
        case "run": return <Route className="h-6 w-6" />;
        default: return <Activity className="h-6 w-6" />;
    }
  };

  const calculatePace = (time: string, distance: number) => {
    if (!distance) return "-";
    const [minStr, secStr] = time.split(":").map(Number);
    const totalSeconds = (minStr || 0) * 60 + (secStr || 0);
    const paceSeconds = totalSeconds / distance;
    const paceMin = Math.floor(paceSeconds / 60);
    const paceSec = Math.round(paceSeconds % 60);
    return `${paceMin}'${paceSec.toString().padStart(2, "0")}" /mi`;
  };

  const targetedMuscles = useMemo(() => {
    if (isRun) return ["Legs", "Cardio"];
    const muscles = new Set<string>();
    (items as Exercise[]).forEach(item => {
      if (item.muscle) muscles.add(item.muscle);
    });
    return Array.from(muscles);
  }, [items, isRun]);

  // bg-warm-cream

  return (
    <div className="min-h-screen pb-20">
      {/* Header Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/exercise" 
          className="flex items-center text-sm font-bold transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK TO WORKOUTS
        </Link>
        
        <div className="flex items-center gap-2">
            {!activity.completed && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-evergreen hover:bg-evergreen-dark text-white rounded-xl"
                  onClick={() => setIsCompleteModalOpen(true)}
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                </Button>
            )}
           <Button variant="ghost" size="icon" className="hover:bg-evergreen/10" onClick={() => setIsCopyModalOpen(true)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-evergreen/10" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-4">
        {/* Hero Section */}
        <section className="mb-10 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-evergreen to-evergreen-dark p-8 md:p-12 text-white shadow-2xl shadow-evergreen/10">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 text-sm font-semibold tracking-wide border border-white/10 uppercase">
              <Timer className="h-4 w-4" />
              Activity Details
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tighter capitalize">
                  {activity.type === 'run' ? 'Morning Run' : `${activity.type} Workout`}
                </h1>
                <p className="text-white/80 font-medium text-lg">
                  {format(activityDate, "EEEE, MMMM d")} • {format(activityDate, "h:mm a")}
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-burnt-terracotta text-white px-6 py-3 rounded-2xl shadow-lg shadow-black/10">
                <Award className="h-6 w-6" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-80">Status</div>
                  <div className="text-lg font-black leading-tight">
                    {activity.completed ? 'Completed' : 'Planned'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </section>

        {/* Quick Stats Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DetailCard
            icon={<Clock className="h-5 w-5" />}
            name="Duration"
            value={activity.length}
            measurement="min"
          />

          <DetailCard
            icon={isStrength ? <Dumbbell className="h-5 w-5" /> : <Route className="h-5 w-5" />}
            name={isStrength ? "Exercises" : "Distance"}
            value={isStrength ? items.length : (activity.distance || 0)}
            measurement={isStrength ? "" : "mi"}
            iconBgClassName={isStrength ? "bg-evergreen/10" : "bg-burnt-terracotta/10"}
            iconColorClassName={isStrength ? "text-evergreen" : "text-burnt-terracotta"}
          />

          <DetailCard
            icon={isStrength ? <Activity className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            name={isStrength ? "Muscles Worked" : "Est. Pace"}
            value={isStrength ? targetedMuscles.length : (() => {
              const paceDecimal = activity.length / (activity.distance || 1);
              const minutes = Math.floor(paceDecimal);
              const seconds = Math.round((paceDecimal - minutes) * 60);
              return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
            })()}
            measurement={isStrength ? "" : "/mi"}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content: Splits / Exercises text-evergreen-dark*/}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-burnt-terracotta" />
                {isRun ? "Workout Splits" : "Workout Session"}
              </h2>
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold bg-evergreen/10 px-3 py-1 rounded-full uppercase">
                  {items.length} {isRun ? "Laps Total" : "Exercises"}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="rounded-xl border-evergreen/20 hover:bg-evergreen/5"
                  onClick={openAddItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {items.length > 0 ? (
                items.map((item, index) => {
                  const isSplit = 'distance' in item;
                  return (
                    <div 
                      key={index}
                      className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm group transition-colors border border-stone-200/50"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-black text-stone-300 w-6">{(index + 1).toString().padStart(2, '0')}</span>
                        <div>
                          <div className="text-lg font-bold text-evergreen-dark">
                            {isSplit ? (item as Split).time : (item as Exercise).description}
                          </div>
                          <div className="text-xs font-medium text-soft-earth uppercase font-bold tracking-tight">
                            {isSplit ? "Time" : (item as Exercise).muscle || "Exercise"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        {isSplit ? (
                          <>
                            <div className="text-right">
                              <div className="text-lg font-bold text-evergreen-dark">{(item as Split).distance} mi</div>
                              <div className="text-xs font-medium text-soft-earth uppercase font-bold tracking-tight">Distance</div>
                            </div>
                            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className="h-full bg-evergreen rounded-full" 
                                style={{ width: `${Math.min(100, (600 / (parseFloat((item as Split).time.split(':')[0]) * 60 + parseFloat((item as Split).time.split(':')[1]))) * 100)}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-4 text-right">
                            {(item as Exercise).sets && (
                              <div>
                                <div className="text-lg font-bold text-evergreen-dark">{(item as Exercise).sets}</div>
                                <div className="text-[10px] font-bold text-soft-earth uppercase">Sets</div>
                              </div>
                            )}
                            {(item as Exercise).reps && (
                              <div>
                                <div className="text-lg font-bold text-evergreen-dark">{(item as Exercise).reps}</div>
                                <div className="text-[10px] font-bold text-soft-earth uppercase">Reps</div>
                              </div>
                            )}
                             {(item as Exercise).weight && (
                              <div>
                                <div className="text-lg font-bold text-evergreen-dark">{(item as Exercise).weight}</div>
                                <div className="text-[10px] font-bold text-soft-earth uppercase">lbs</div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-soft-earth" onClick={() => openEditItem(index)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteItem(index)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white/50 dark:bg-white/5 border-2 border-dashed border-stone-200 dark:border-white/10 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-300 dark:text-white/40">
                    <Info className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-evergreen-dark dark:text-white mb-1">No activities logged yet</h3>
                  <p className="text-soft-earth dark:text-white/60 text-sm mb-6 font-medium">Add your first split or exercise to see detailed progress.</p>
                  <Button 
                    onClick={openAddItem}
                    className="bg-evergreen dark:bg-white/10 hover:bg-evergreen-dark dark:hover:bg-white/20 text-white rounded-xl px-8"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar: Targeted Muscles */}
          <section className="lg:sticky lg:top-8">
            <h2 className="text-2xl font-black mb-6 tracking-tight flex items-center gap-3">
              <Dumbbell className="h-6 w-6 text-burnt-terracotta" />
              Targeted Muscles
            </h2>
            
            <div className="bg-white dark:bg-[#1b251e] rounded-[2rem] p-8 relative flex flex-col items-center border border-stone-200/50 dark:border-white/5 shadow-sm">
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-warm-cream/50 dark:bg-white/5 backdrop-blur-sm p-4 border border-stone-100 dark:border-white/5 flex items-center justify-center">
                <MuscleMap muscles={targetedMuscles} className="w-full h-full" />
              </div>
              
              <div className="w-full grid grid-cols-2 gap-3">
                {targetedMuscles.length > 0 ? targetedMuscles.slice(0, 4).map((muscle, idx) => (
                  <div key={idx} className="bg-warm-cream/50 dark:bg-white/5 px-4 py-3 rounded-xl border border-evergreen/5 dark:border-white/5">
                    <div className="text-[10px] font-bold text-soft-earth dark:text-white/40 uppercase tracking-tighter">
                      {idx < 2 ? "Primary" : "Secondary"}
                    </div>
                    <div className="font-bold text-sm text-evergreen-dark dark:text-white">{muscle}</div>
                  </div>
                )) : (
                   <div className="col-span-2 text-center py-4 text-soft-earth dark:text-white/40 text-xs font-medium italic">
                    No specific muscles targeted
                  </div>
                )}
              </div>
              
              <div className="absolute top-6 right-6 bg-burnt-terracotta/10 backdrop-blur-md px-3 py-1 rounded-lg border border-burnt-terracotta/20 text-burnt-terracotta font-bold text-[10px] uppercase tracking-widest">
                Intensity: {activity.difficulty}
              </div>
            </div>
          </section>
        </div>

        {/* Recovery Recommendation Footer */}
        <HomepageFooter
          title="Recovery Recommendation"
          description={isRun 
            ? "15 min dynamic stretching focused on lower body." 
            : "Focus on deep breathing and core stability recovery."}
          icon={<History className="h-8 w-8" />}
          buttonText="View Full Plan"
          className="mt-16"
        />
      </main>

      <AddActivityModal 
        editActivity={activity} 
        isOpen={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onActivityAdded={handleActivityUpdated}
        onActivityDeleted={handleActivityDeleted}
      />
      
      <ExerciseFormModal
        isOpen={isExerciseModalOpen}
        onOpenChange={setIsExerciseModalOpen}
        onSave={handleSaveExercise}
        editExercise={editingExerciseIndex !== null ? items[editingExerciseIndex] as Exercise : null}
      />

      <SplitFormModal
        isOpen={isSplitModalOpen}
        onOpenChange={setIsSplitModalOpen}
        onSave={handleSaveSplit}
        editSplit={editingSplitIndex !== null ? items[editingSplitIndex] as Split : null}
      />

      <CopyActivityModal
        isOpen={isCopyModalOpen}
        onOpenChange={setIsCopyModalOpen}
        onCopy={handleCopy}
      />

      <CompleteActivityModal
        activity={activity}
        isOpen={isCompleteModalOpen}
        onOpenChange={setIsCompleteModalOpen}
        onActivityCompleted={handleActivityCompleted}
      />
    </div>
  );
}

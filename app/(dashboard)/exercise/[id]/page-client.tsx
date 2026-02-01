
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
  CheckCircle2
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

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/exercise" 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workouts
        </Link>
        
        <div className="flex items-center gap-2">
            {!activity.completed && (
                <Button variant="default" size="sm" onClick={() => setIsCompleteModalOpen(true)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                </Button>
            )}
          <Button variant="ghost" size="icon" onClick={() => setIsCopyModalOpen(true)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* ... (Keep existing layout) */}
        
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-2">
            <div className={cn("h-2 w-full", getDifficultyColor(activity.difficulty).replace("text-", "bg-").split(" ")[0])} />
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className={cn("p-4 rounded-full mb-4", getDifficultyColor(activity.difficulty))}>
                  {getTypeIcon()}
                </div>
                
                <h1 className="text-2xl font-bold capitalize mb-1">{activity.type} Workout</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Calendar className="h-4 w-4" />
                  <span>{format(activityDate, "EEEE, MMMM d, yyyy")}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Duration</span>
                    <span className="text-xl font-bold">{activity.length} <span className="text-sm font-normal text-muted-foreground">min</span></span>
                  </div>
                  
                  {activity.distance && activity.distance > 0 ? (
                    <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distance</span>
                      <span className="text-xl font-bold">{activity.distance} <span className="text-sm font-normal text-muted-foreground">mi</span></span>
                    </div>
                  ) : (
                     <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time</span>
                      <span className="text-xl font-bold">{activity.time}</span>
                     </div>
                  )}
                </div>

                {(activity.distance || 0) > 0 && (
                   <div className="w-full mt-4 flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Pace</span>
                    <span className="text-xl font-bold">
                        {(() => {
                        const paceDecimal = activity.length / activity.distance!;
                        const minutes = Math.floor(paceDecimal);
                        const seconds = Math.round((paceDecimal - minutes) * 60);
                        return `${minutes}'${seconds.toString().padStart(2, "0")}" /mi`;
                        })()}
                    </span>
                   </div>
                )}
                
                <div className="mt-6 w-full">
                    <Badge variant="outline" className={cn("w-full justify-center py-1 capitalize", getDifficultyColor(activity.difficulty))}>
                        {activity.difficulty} Effort
                    </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Muscle Map Card */}
          <Card>
            <CardContent className="pt-6">
               <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2 justify-center">
                  <Activity className="h-3 w-3" /> Muscles Targeted
               </h3>
               <MuscleMap muscles={targetedMuscles} />
            </CardContent>
          </Card>

           {/* Notes Card */}
           {(activity.notes || activity.completion_notes) && (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {activity.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                <Share2 className="h-3 w-3" /> Notes
                            </h3>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{activity.notes}</p>
                        </div>
                    )}
                    
                    {activity.notes && activity.completion_notes && <Separator />}
                    
                    {activity.completion_notes && (
                        <div>
                             <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                                <Trophy className="h-3 w-3" /> Completion Notes
                            </h3>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed italic text-muted-foreground">{activity.completion_notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
           )}
        </div>

        {/* Right Column: Exercises/Details */}
        <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {isRun ? <Route className="h-5 w-5 text-primary" /> : <Dumbbell className="h-5 w-5 text-primary" />}
                        {isRun ? "Splits" : "Workout Session"}
                    </h2>
                    <Badge variant="secondary">{items.length} {isRun ? "Splits" : "Exercises"}</Badge>
                </div>
                <Button size="sm" onClick={openAddItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    {isRun ? "Add Split" : "Add Exercise"}
                </Button>
            </div>

            {items.length > 0 ? (
                <div className="space-y-4">
                  {isRun ? (
                    // Run Splits View
                    <div className="grid gap-3">
                      {items.map((item, index) => {
                        const split = item as Split;
                        return (
                          <Card key={index} className="overflow-hidden transition-all hover:shadow-md group">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                      {index + 1}
                                   </div>
                                   <div className="grid gap-1">
                                      <div className="flex items-baseline gap-2">
                                         <span className="text-lg font-semibold">{split.distance}</span>
                                         <span className="text-xs text-muted-foreground uppercase">mi</span>
                                      </div>
                                   </div>
                                    <Separator orientation="vertical" className="h-8" />
                                   <div className="grid gap-1">
                                      <div className="flex items-baseline gap-2">
                                         <span className="text-lg font-mono font-medium">{split.time}</span>
                                         <span className="text-xs text-muted-foreground uppercase">time</span>
                                      </div>
                                   </div>
                                   <Separator orientation="vertical" className="h-8 hidden sm:block" />
                                   <div className="hidden sm:grid gap-1">
                                      <div className="flex items-baseline gap-2">
                                         <span className="text-lg font-medium">{calculatePace(split.time, split.distance)}</span>
                                         <span className="text-xs text-muted-foreground uppercase">pace</span>
                                      </div>
                                   </div>
                                    <Separator orientation="vertical" className="h-8 hidden md:block" />
                                   <div className="hidden md:grid gap-1">
                                      <div className="flex items-baseline gap-2">
                                         <div className="flex items-center gap-1">
                                            {split.elevation !== 0 && (
                                                <Mountain className={cn("h-3 w-3", split.elevation > 0 ? "text-green-500" : "text-red-500")} />
                                            )}
                                            <span className="text-lg font-medium">{split.elevation}</span>
                                         </div>
                                         <span className="text-xs text-muted-foreground uppercase">ft</span>
                                      </div>
                                   </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditItem(index)}>
                                        <Pencil className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteItem(index)}>
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    // Regular Exercises View
                    items.map((item, index) => {
                        const exercise = item as Exercise;
                        return (
                        <Card key={index} className="overflow-hidden transition-all hover:shadow-md group">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <div className="flex-1 p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg">{exercise.description}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 text-xs font-mono bg-muted px-2 py-1 rounded">
                                                <span className="text-muted-foreground">#{index + 1}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditItem(index)}>
                                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteItem(index)}>
                                                    <Trash2 className="h-3 w-3 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                                        {exercise.sets && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Sets</span>
                                                <span className="font-medium text-lg">{exercise.sets}</span>
                                            </div>
                                        )}
                                        {exercise.reps && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Reps</span>
                                                <span className="font-medium text-lg">{exercise.reps}</span>
                                            </div>
                                        )}
                                        {exercise.weight && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Weight</span>
                                                <span className="font-medium text-lg">{exercise.weight} <span className="text-xs text-muted-foreground font-normal">lbs</span></span>
                                            </div>
                                        )}
                                        {exercise.duration && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Duration</span>
                                                <span className="font-medium text-lg">{exercise.duration} <span className="text-xs text-muted-foreground font-normal">min</span></span>
                                            </div>
                                        )}
                                        {exercise.muscle && (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Muscle</span>
                                                <span className="font-medium text-lg">{exercise.muscle}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )})
                  )}
                </div>
            ) : (
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="p-3 bg-muted rounded-full mb-3">
                            <Activity className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-muted-foreground">No specific {isRun ? "splits" : "exercises"} logged</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">This workout tracks overall activity</p>
                        <Button variant="outline" onClick={openAddItem}>
                            {isRun ? "Add Your First Split" : "Add Your First Exercise"}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>

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

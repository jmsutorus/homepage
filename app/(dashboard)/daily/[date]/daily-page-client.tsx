"use client";
import { useMemo, useState } from "react";
import { format, parseISO, parse } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import Link from "next/link";
import { 
  WorkoutEditorialCard, 
  RestaurantEditorialCard, 
  MediaEditorialCard, 
  DrinkEditorialCard, 
  GoalEditorialCard, 
  EventEditorialCard, 
  VacationEditorialCard, 
  GithubEditorialCard,
  ParkEditorialCard 
} from "@/components/widgets/daily/editorial-cards";
import { MoodSelector } from "@/components/widgets/mood/mood-selector";
import { DailyHabits } from "@/components/widgets/habits/daily-habits";
import { DuolingoCompletionToggle } from "@/components/widgets/duolingo/duolingo-completion-toggle";
import { RecipePickerModal } from "@/components/widgets/daily/RecipePickerModal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CalendarDayData, CalendarGoal, CalendarMilestone, CalendarVacation } from "@/lib/db/calendar";
import type { Task } from "@/lib/db/tasks";
import type { DailyMealWithRecipe, Meal, MealType } from "@/lib/types/meals";

interface DailyPageClientProps {
  date: string;
  journal: any;
  mood: number | null | undefined;
  habits: any[];
  completions: any[];
  dailyData: CalendarDayData | undefined;
  hasDuolingo: boolean;
  duolingoCompleted: boolean;
  dailyMeals: DailyMealWithRecipe[];
  availableRecipes: Meal[];
  completedGoals: CalendarGoal[];
  completedMilestones: CalendarMilestone[];
  upcomingGoals: CalendarGoal[];
  upcomingMilestones: CalendarMilestone[];
  prevDate: string;
  nextDate: string;
}

export default function DailyPageClient({
  date,
  journal,
  mood,
  habits,
  completions,
  dailyData,
  hasDuolingo,
  duolingoCompleted,
  dailyMeals,
  availableRecipes,
  completedGoals,
  completedMilestones,
  upcomingGoals,
  upcomingMilestones,
  prevDate,
  nextDate,
}: DailyPageClientProps) {
  const router = useRouter();
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>("breakfast");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeFormat = (dateStr: string | null | undefined, formatStr: string, fallback: string = "") => {
    if (!dateStr) return fallback;
    try {
      // Handle HH:MM time strings
      if (dateStr.length === 5 && dateStr.includes(':')) {
        const d = parse(dateStr, 'HH:mm', new Date());
        return isNaN(d.getTime()) ? fallback : format(d, formatStr);
      }
      const d = parseISO(dateStr);
      return isNaN(d.getTime()) ? fallback : format(d, formatStr);
    } catch {
      return fallback;
    }
  };

  const dateObj = useMemo(() => {
    try {
      const d = parseISO(date);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  }, [date]);

  const dateLong = useMemo(() => format(dateObj, "MMMM d, yyyy"), [dateObj]);

  // Determine the poetic headline
  const headline = useMemo(() => {
    if (journal?.content) {
      // Get the first sentence or first 60 characters
      const match = journal.content.match(/^[^.!?]+[.!?]/);
      return match ? match[0] : journal.content.substring(0, 80) + "...";
    }
    return `A quiet morning on the ${safeFormat(date, "do", format(dateObj, "do"))} of ${safeFormat(date, "MMMM", format(dateObj, "MMMM"))}.`;
  }, [journal, dateObj, date]);

  const meals = useMemo(() => {
    const types = ["breakfast", "lunch", "dinner"] as const;
    return types.map(type => {
      const mealLog = dailyMeals.find(m => m.meal_type === type);
      return {
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        log: mealLog,
      };
    });
  }, [dailyMeals]);

  const handleLogMeal = async (mealId: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/daily-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          meal_type: activeMealType,
          mealId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log meal");
      }

      toast.success(`${activeMealType.charAt(0).toUpperCase() + activeMealType.slice(1)} logged successfully`);
      setIsRecipeModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error logging meal:", error);
      toast.error("An error occurred while logging your meal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = async (type: MealType) => {
    if (!confirm(`Are you sure you want to remove your ${type}?`)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/daily-meals?date=${date}&meal_type=${type}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete meal");
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("An error occurred while removing your meal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRecipePicker = (type: MealType) => {
    setActiveMealType(type);
    setIsRecipeModalOpen(true);
  };

  return (
    <div className="text-media-on-surface min-h-screen pb-32 font-lexend">
      <main className="pt-24 px-6 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Daily Narrative & Vitals */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-4">
                <span className="text-media-secondary font-bold uppercase tracking-[0.3em] text-[10px] block">
                  {dateLong}
                </span>
                <div className="flex items-center gap-4">
                   <Link href={`/daily/${prevDate}`} className="text-media-on-surface-variant/40 hover:text-media-primary transition-colors">
                     <MaterialSymbol icon="chevron_left" className="text-xl" />
                   </Link>
                   <Link href={`/daily/${nextDate}`} className="text-media-on-surface-variant/40 hover:text-media-primary transition-colors">
                     <MaterialSymbol icon="chevron_right" className="text-xl" />
                   </Link>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-media-primary mb-8 leading-[1.1]">
                {headline}
              </h1>
              <div className="bg-media-surface-container-low p-8 rounded-2xl relative overflow-hidden">
                <div className="prose prose-media-on-surface-variant max-w-none text-media-on-surface-variant leading-relaxed text-lg">
                  {journal ? journal.content : (
                    <div className="italic opacity-50 py-12 text-center">
                      No reflection recorded for this day yet.
                    </div>
                  )}
                </div>
                {journal && (
                  <div className="mt-8 flex items-center gap-4 border-t border-media-outline-variant pt-6 border-opacity-20">
                    <span className="text-sm font-medium italic text-media-on-surface-variant">
                      Reflection logged {journal.created_at ? safeFormat(journal.created_at, "'on' h:mm a", "today") : "today"}
                    </span>
                  </div>
                )}
                {!journal && (
                   <Link 
                    href={`/journals/new?type=daily&date=${date}`}
                    className="mt-8 flex items-center gap-3 text-media-secondary hover:text-media-primary transition-colors font-bold text-sm uppercase tracking-widest"
                   >
                     <MaterialSymbol icon="add_circle" />
                     Start Journaling
                   </Link>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* The Vitals */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-media-on-surface-variant/60">The Vitals</h3>
                <MoodSelector date={date} currentMood={mood || null} />
                
                {hasDuolingo && (
                  <div className="bg-media-surface-container-lowest editorial-shadow p-6 rounded-2xl flex items-center justify-between group kinetic-hover">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#58cc02] flex items-center justify-center">
                        <MaterialSymbol icon="language" className="text-white" fill />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Duolingo</p>
                        <p className="text-xs text-media-on-surface-variant">Stay on the streak</p>
                      </div>
                    </div>
                    <DuolingoCompletionToggle date={date} isCompleted={duolingoCompleted} />
                  </div>
                )}
              </div>

              {/* Habitual Rhythm */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-media-on-surface-variant/60">Habitual Rhythm</h3>
                <DailyHabits habits={habits} completions={completions} date={date} />
              </div>
            </section>

            {/* Sustenance */}
            <section className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-media-on-surface-variant/60">Sustenance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {meals.map(({ type, label, log }) => (
                  <div key={type} className={cn(
                    "relative overflow-hidden rounded-2xl group cursor-pointer kinetic-hover",
                    log ? "bg-media-surface-container-lowest editorial-shadow" : "bg-media-surface-container-low border-2 border-dashed border-media-outline-variant h-[216px] flex flex-col items-center justify-center hover:bg-media-surface-container transition-colors"
                  )}>
                    {log ? (
                      <>
                        <div className="h-32 bg-media-surface-container relative">
                          {log.meal?.image_url && (
                             <Image 
                              src={log.meal.image_url} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              alt={label} 
                              width={400}
                              height={128}
                             />
                          )}
                          <div className="absolute top-2 left-2 px-2 py-1 bg-media-surface/90 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest rounded">{label}</div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMeal(type);
                            }}
                            className="cursor-pointer absolute top-2 right-2 p-1.5 bg-media-error/10 hover:bg-media-error text-media-error hover:text-white backdrop-blur-sm rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                            title={`Remove ${label}`}
                          >
                             <MaterialSymbol icon="delete" className="text-sm" />
                          </button>
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-bold truncate">{log.meal?.name}</p>
                          <p className="text-[10px] text-media-on-surface-variant mt-1">Logged from Recipes</p>
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={() => openRecipePicker(type)}
                        className="cursor-pointer flex flex-col items-center w-full h-full justify-center"
                      >
                        <MaterialSymbol icon="add_circle" className="text-media-outline text-3xl group-hover:scale-110 transition-transform mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest text-media-outline underline-offset-4 group-hover:underline">Add {label}</p>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Collective Log */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-media-on-surface-variant/60">The Collective Log</h3>
              <MaterialSymbol icon="filter_list" className="text-media-on-surface-variant/40" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              
              {/* Events */}
              {dailyData?.events.map((event, idx) => (
                <EventEditorialCard 
                  key={`event-${idx}`}
                  title={event.title}
                  location={event.location || "Earthbound"}
                  time={event.all_day ? "All Day" : safeFormat(event.start_time, "h:mm a", "Scheduled")}
                />
              ))}

              {/* Workouts */}
              {dailyData?.workoutActivities.map((workout, idx) => {
                const title = workout.notes && workout.notes.length < 30 
                  ? workout.notes 
                  : (workout.type.charAt(0).toUpperCase() + workout.type.slice(1) + " Workout");
                
                return (
                  <WorkoutEditorialCard 
                    key={`workout-${idx}`}
                    title={title}
                    distance={workout.distance}
                    duration={workout.length}
                    type={workout.type}
                  />
                );
              })}

              {/* Restaurants */}
              {dailyData?.restaurantVisits.map((visit, idx) => (
                <RestaurantEditorialCard 
                  key={`visit-${idx}`}
                  name={visit.restaurantName}
                  location={visit.city || "Local"}
                  rating={visit.rating || 4}
                  image={visit.poster || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400"}
                />
              ))}

              {/* Media */}
              {dailyData?.media.map((item, idx) => {
                let subtitle = "";
                try {
                   const parsed = item.creator ? JSON.parse(item.creator) : [];
                   subtitle = Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
                } catch {
                   subtitle = item.creator || "";
                }
                
                return (
                  <MediaEditorialCard 
                    key={`media-${idx}`}
                    title={item.title}
                    subtitle={subtitle}
                    category={item.type.toUpperCase()}
                    image={item.poster || ""}
                    progress={item.status === "completed" ? 100 : 45}
                  />
                );
              })}

              {/* Drinks */}
              <div className="grid grid-cols-2 gap-6">
                {dailyData?.drinkLogs.map((drink, idx) => (
                  <DrinkEditorialCard 
                    key={`drink-${idx}`}
                    name={drink.drinkName}
                    details={`${drink.drinkType || "Other"} ${drink.drinkProducer ? `• ${drink.drinkProducer}` : ""}`}
                  />
                ))}
                
                {/* Goal Progress */}
                {completedGoals.map((goal, idx) => (
                   <GoalEditorialCard 
                    key={`goal-${idx}`}
                    title={goal.title}
                    percentage={100}
                    isMilestone={false}
                   />
                ))}
                {completedMilestones.map((milestone, idx) => (
                   <GoalEditorialCard 
                    key={`milestone-${idx}`}
                    title={milestone.title}
                    percentage={100}
                    isMilestone={true}
                   />
                ))}
                {upcomingGoals.slice(0, 1).map((goal, idx) => (
                   <GoalEditorialCard 
                    key={`upcoming-goal-${idx}`}
                    title={goal.title}
                    percentage={45}
                   />
                ))}
              </div>

              {/* GitHub Events */}
              {dailyData?.githubEvents.slice(0, 2).map((event, idx) => {
                 const commitCount = (event.payload as any)?.size || (event.payload as any)?.commits?.length || 1;
                 
                 return (
                  <GithubEditorialCard 
                    key={`github-${idx}`}
                    repo={event.repo.name}
                    count={commitCount}
                    type={event.type === 'PushEvent' ? 'Commits' : 'Activity'}
                  />
                 );
              })}

              {/* Parks */}
              {dailyData?.parks.map((park, idx) => (
                <ParkEditorialCard 
                  key={`park-${idx}`}
                  title={park.title}
                  image={park.poster || ""}
                  location={park.state || "National Park"}
                />
              ))}

              {/* Vacations / Memories */}
              {dailyData?.vacations.map((v, idx) => (
                <VacationEditorialCard 
                  key={`vacation-${idx}`}
                  title={v.vacation.title}
                  image={v.vacation.poster || ""}
                />
              ))}

              {/* Minimalist Archive for other logs */}
              {(!dailyData || (
                dailyData.events.length === 0 && 
                dailyData.workoutActivities.length === 0 &&
                dailyData.restaurantVisits.length === 0 &&
                dailyData.media.length === 0 &&
                dailyData.drinkLogs.length === 0 &&
                dailyData.vacations.length === 0 &&
                dailyData.parks.length === 0
              )) && (
                <div className="p-12 border-2 border-dashed border-media-outline-variant rounded-2xl flex flex-col items-center justify-center text-media-on-surface-variant/40">
                  <MaterialSymbol icon="history" className="text-4xl mb-2" />
                  <p className="text-sm font-bold uppercase tracking-widest">No Collective Logs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <RecipePickerModal 
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onSelect={handleLogMeal}
        recipes={availableRecipes as any}
        mealType={activeMealType}
        isSubmitting={isSubmitting}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-2 bg-media-surface/80 backdrop-blur-xl shadow-[0_-4px_32px_rgba(0,0,0,0.04)] rounded-t-2xl md:hidden">
        <Link className="flex flex-col items-center justify-center text-media-secondary bg-media-surface-container-low rounded-xl px-4 py-1.5" href="/calendar">
          <MaterialSymbol icon="auto_stories" fill />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Review</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-media-on-surface-variant px-4 py-1.5" href="/habits">
          <MaterialSymbol icon="task_alt" />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Habits</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-media-on-surface-variant px-4 py-1.5" href="/journals">
          <MaterialSymbol icon="edit_note" />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Journal</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-media-on-surface-variant px-4 py-1.5" href="/life">
          <MaterialSymbol icon="explore" />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Life</span>
        </Link>
      </nav>

    </div>
  );
}

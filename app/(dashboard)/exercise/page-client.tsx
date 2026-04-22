"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dumbbell,
  Activity,
  User2,
  Zap,
  Timer,
  ChevronRight,
  Flame,
  BarChart3,
  Trophy,
  PlusCircle,
  TrendingUp,
  FastForward,
} from "lucide-react";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";
import { AddPrModal } from "@/components/widgets/exercise/add-pr-modal";
import { EditPrModal } from "@/components/widgets/exercise/edit-pr-modal";
import { HomePageButton } from "@/Shared/Components/Buttons/HomePageButton";

import type { WorkoutActivity, WorkoutActivityStats, Exercise } from "@/lib/db/workout-activities";
import type { PersonalRecord, ExerciseSettings } from "@/lib/db/personal-records";

interface ExercisePageClientProps {
  initialUpcomingActivities: WorkoutActivity[];
  initialRecentActivities: WorkoutActivity[];
  initialCompletedActivities: WorkoutActivity[];
  initialStats: WorkoutActivityStats;
  initialSettings: ExerciseSettings;
  initialRecords: PersonalRecord[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const cls = className ?? "h-5 w-5";
  switch (type) {
    case "run": return <Activity className={cls} />;
    case "cardio":   return <Activity className={cls} />;
    case "strength": return <Dumbbell className={cls} />;
    case "flexibility": return <User2 className={cls} />;
    case "sports":   return <Zap className={cls} />;
    case "mixed":    return <Activity className={cls} />;
    default:         return <Activity className={cls} />;
  }
}

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "easy":      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "moderate":  return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
    case "hard":      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
    case "very hard": return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    default:          return "bg-muted text-muted-foreground";
  }
}

function formatActivityDate(date: string) {
  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];
  if (date === today)    return "Today";
  if (date === tomorrow) return "Tomorrow";
  try { return format(new Date(date + "T00:00:00"), "EEE, MMM d"); } catch { return date; }
}

function formatActivityTime(time: string) {
  try {
    const [hoursStr, minutesStr] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutesStr} ${ampm}`;
  } catch {
    return time;
  }
}

// ── component ─────────────────────────────────────────────────────────────────

export function ExercisePageClient({
  initialUpcomingActivities,
  initialRecentActivities: _initialRecentActivities,
  initialCompletedActivities,
  initialStats,
  initialRecords,
  initialSettings,
}: ExercisePageClientProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActivityAdded = () => {
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  // Next upcoming workout
  const nextUp = initialUpcomingActivities[0] ?? null;

  // Count consecutive days with a completed activity going back from today
  const streak = (() => {
    if (initialCompletedActivities.length === 0) return 0;
    const completedDates = new Set(initialCompletedActivities.map((a) => a.date));
    let count = 0;
    let cursor = new Date();
    // Allow today as part of the streak, but also check if yesterday is there
    while (true) {
      const d = cursor.toISOString().split("T")[0];
      if (completedDates.has(d)) {
        count++;
        cursor = new Date(cursor.getTime() - 86_400_000);
      } else {
        // If we haven't checked yesterday yet, check it. 
        // If we did check yesterday and it's missing, break.
        if (cursor.toISOString().split("T")[0] === new Date().toISOString().split("T")[0]) {
             cursor = new Date(cursor.getTime() - 86_400_000);
             continue;
        }
        break;
      }
    }
    return count;
  })();

  // Three most recent completed workouts
  const recentCompleted = initialCompletedActivities.slice(0, 3);

  // Derive Personal Records (Trophy Room)
  const personalRecords = (() => {
    let longestRun: WorkoutActivity | null = null;
    let maxWeight = 0;
    let maxWeightExercise = "";
    let fastestRun: { activity: WorkoutActivity; pace: number } | null = null; // pace in min/mi
    const records: Record<string, { activity: WorkoutActivity; time: number }> = {};

    for (const activity of initialCompletedActivities) {
      // Longest Run
      if (activity.type === "run" && activity.distance) {
        if (!longestRun || activity.distance > (longestRun.distance || 0)) {
          longestRun = activity;
        }
      }

      // Max Weight
      if (activity.exercises) {
        try {
          const exercises: Exercise[] = typeof activity.exercises === 'string' 
            ? JSON.parse(activity.exercises) 
            : (activity.exercises as any);
          
          for (const ex of exercises) {
            if (ex.weight && ex.weight > maxWeight) {
              maxWeight = ex.weight;
              maxWeightExercise = ex.description;
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Fastest Run (for runs > 1mi)
      if (activity.type === "run" && activity.distance && activity.distance >= 1 && activity.length) {
        const pace = activity.length / activity.distance;
        if (!fastestRun || pace < fastestRun.pace) {
          fastestRun = { activity, pace };
        }
      }
      // Best times for specific distances
      if (activity.type === "run" && activity.distance && activity.length) {
        const dist = activity.distance;
        const time = activity.length; // in minutes

        const updateRecord = (key: string, threshold: number) => {
          if (dist >= threshold) {
            // Find best time for this distance (estimated if dist > threshold, but we'll just use raw time for simplicity for this "first pass")
            if (!records[key] || time < records[key].time) {
              records[key] = { activity, time };
            }
          }
        };

        updateRecord("5k", 3.1);
        updateRecord("10k", 6.2);
        updateRecord("halfMarathon", 13.1);
        updateRecord("marathon", 26.2);
      }

      // Longest Swim
      if (activity.type === "swim" && activity.distance) {
        if (!records["longestSwim"] || activity.distance > (records["longestSwim"].activity.distance || 0)) {
          records["longestSwim"] = { activity, time: activity.length || 0 };
        }
      }
    }

    return { 
      longestRun, 
      maxWeight, 
      maxWeightExercise, 
      fastestRun, 
      longestSwim: records["longestSwim"],
      milestones: records 
    };
  })();

  // Active days this week for streak visualization
  const activeDaysThisWeek = (() => {
    const activeIndices = new Set<number>();
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=M, 1=T, ..., 6=S
    
    // Get start of this week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    initialCompletedActivities.forEach(act => {
      const actDate = new Date(act.date + "T00:00:00");
      if (actDate >= startOfWeek) {
        const diff = Math.floor((actDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
          activeIndices.add(diff);
        }
      }
    });
    return activeIndices;
  })();

  // Personal Records from Database (replacing derived milestones)
  const dbRecordsList = initialRecords
    .filter(r => r.type === "running" && r.distance && r.total_seconds)
    .map(r => {
      // Map common distances to labels
      let label = `${r.distance}mi Run`;
      let icon = <Timer className="h-6 w-6" />;
      
      const d = r.distance || 0;
      if (Math.abs(d - 3.1) < 0.1) { label = "5K Run"; }
      else if (Math.abs(d - 6.2) < 0.1) { label = "10K Run"; icon = <FastForward className="h-6 w-6" />; }
      else if (Math.abs(d - 13.1) < 0.1) { label = "Half Marathon"; icon = <TrendingUp className="h-6 w-6" />; }
      else if (Math.abs(d - 26.2) < 0.1) { label = "Marathon"; icon = <Trophy className="h-6 w-6" />; }

      const totalSecs = r.total_seconds || 0;
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      const displayTime = h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
        : `${m}:${s.toString().padStart(2, '0')}`;

      return {
        label,
        displayTime,
        date: r.date,
        icon,
        id: r.id,
        rawRecord: r
      };
    });

  return (
    <div className="space-y-8">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight">Exercise Tracking</h1>
          <p className="text-xl text-muted-foreground mt-2 font-medium">
            Your potential has no finish line. Let&rsquo;s move.
          </p>
        </div>
        <div className="flex gap-4">
          <AddActivityModal onActivityAdded={handleActivityAdded} showButton={true} />
        </div>
      </div>

      {/* ── Hero: Next Up ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: "linear-gradient(135deg, #1A2E26 0%, #134e4a 100%)" }}
      >
        {/* Decorative glow */}
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20"
             style={{ background: "#a3e635" }} />
        <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-10"
             style={{ background: "#2dd4bf" }} />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-white">
          {/* Left content */}
          <div className="flex flex-col gap-4 z-10">
            <span className="inline-flex w-fit items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              Next Up
            </span>

            {nextUp ? (
              <>
                <h2 className="text-4xl md:text-5xl font-black capitalize tracking-tight">
                  {nextUp.type} Workout
                </h2>
                <p className="text-lg opacity-80 max-w-md font-medium">
                  {nextUp.length} minutes of performance and focus. 
                  {nextUp.distance && nextUp.distance > 0 ? ` Aiming for ${nextUp.distance} miles today.` : ` Focus on ${nextUp.difficulty} intensity training.`}
                </p>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl w-fit mt-2"
                     style={{ background: "rgba(0,0,0,0.3)" }}>
                  <Timer className="h-5 w-5 text-lime-400" />
                  <span className="font-bold text-base">
                    {formatActivityDate(nextUp.date)} at {formatActivityTime(nextUp.time)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black">Ready for a challenge?</h2>
                <p className="text-lg opacity-80 max-w-md">No workouts scheduled. The best time to start was yesterday. The second best time is now.</p>
              </>
            )}
          </div>

          {/* Right CTA */}
          <div className="z-10 shrink-0 self-start md:self-center">
            {nextUp ? (
              <div className="flex items-center gap-6">
                 <div className="hidden lg:block text-right">
                    <div className="text-4xl font-black mb-0.5">{formatActivityTime(nextUp.time)}</div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60">Scheduled</div>
                 </div>
                 <div className="hidden lg:block w-[1px] h-14 bg-white/20"></div>
                 <HomePageButton asChild>
                   <Link href={`/exercise/${nextUp.id}`}>
                     PREPARE SESSION
                   </Link>
                 </HomePageButton>
              </div>
            ) : (
              <AddActivityModal onActivityAdded={handleActivityAdded} showButton={true} />
            )}
          </div>
        </div>
      </section>

      {/* ── Streak Banner ─────────────────────────────────────────── */}
      {streak > 0 && (
        <section className="relative overflow-hidden rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl"
                 style={{ background: "#a3e635" }}>
          <div className="absolute right-0 top-0 h-full w-1/3 pointer-events-none"
               style={{ background: "linear-gradient(to left, rgba(255,255,255,0.2), transparent)" }} />

          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full flex items-center justify-center font-black text-4xl"
                 style={{ border: "8px solid #1A2E26", color: "#1A2E26" }}>
              {streak}
            </div>
            <div className="absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg"
                 style={{ background: "#1A2E26" }}>
              <Flame className="h-5 w-5" style={{ color: "#a3e635" }} />
            </div>
          </div>

          <div className="flex-grow text-center md:text-left" style={{ color: "#1A2E26" }}>
            <h3 className="text-3xl font-black mb-1">You&rsquo;re on fire! 🔥</h3>
            <p className="text-lg font-bold opacity-80 leading-snug">
              {streak}-day movement streak. Consistency is the currency of fitness. Keep it up!
            </p>
          </div>

            <div className="flex gap-2 flex-shrink-0 bg-black/5 p-2 rounded-2xl">
              {["M","T","W","T","F","S","S"].map((d, i) => {
                const isToday = i === (new Date().getDay() + 6) % 7;
                const isActive = activeDaysThisWeek.has(i);
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                      (isToday || isActive) ? 'opacity-100' : 'opacity-60',
                      isToday && 'scale-110 shadow-md'
                    )}
                    style={{ 
                      background: isToday ? "#1A2E26" : "rgba(26,46,38,0.1)", 
                      color: isToday ? "#a3e635" : "#1A2E26" 
                    }}
                  >
                    {isActive ? <Flame className="h-5 w-5 fill-current" /> : d}
                  </div>
                );
              })}
            </div>
        </section>
      )}

      {/* ── Main Two-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left Column: History & Stats ───────────────────────────── */}
        <section className="lg:col-span-8 flex flex-col gap-8">

          {/* Personal Records Section (From Table) */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">Personal Records</h3>
              <AddPrModal 
                onSuccess={handleActivityAdded}
                enableRunning={initialSettings.enable_running_prs}
                enableWeights={initialSettings.enable_weights_prs}
              />
            </div>
            
            {dbRecordsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbRecordsList.map((record) => {
                  return (
                    <EditPrModal 
                      key={record.id} 
                      record={record.rawRecord}
                      onSuccess={handleActivityAdded}
                      enableRunning={initialSettings.enable_running_prs}
                      enableWeights={initialSettings.enable_weights_prs}
                    >
                      <div className="group bg-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6 relative overflow-hidden border border-border/40 cursor-pointer">
                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-lime-highlight/20 text-emerald-800 dark:text-lime-400 flex items-center justify-center">
                           {record.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xl font-bold">{record.label}</h4>
                          </div>
                          <div className="text-2xl font-black text-foreground mt-1">{record.displayTime}</div>
                          <div className="text-sage-green text-sm font-semibold mt-1">
                            Set on {format(new Date(record.date + "T00:00:00"), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    </EditPrModal>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border/50 p-12 text-center text-muted-foreground font-medium">
                No personal records logged yet. Click the button above to add your first PR.
              </div>
            )}
          </div>

          {/* Recent Workouts (Renamed to Achievements in Prototype) */}
          <div className="flex items-center justify-between mt-4">
            <h3 className="text-2xl font-bold tracking-tight">Recent Workouts</h3>
            <Link href="/exercise/history" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View All History <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentCompleted.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/50 p-12 text-center text-muted-foreground font-medium">
                No recorded activities. Start your journey today.
              </div>
            ) : (
              recentCompleted.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/exercise/${activity.id}`}
                  className="group flex items-center gap-6 bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-transparent hover:border-border/60"
                >
                  {/* Icon circle */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-inner"
                       style={{ background: "rgba(163,230,53,0.15)" }}>
                    <TypeIcon type={activity.type} className="h-7 w-7 text-emerald-800 dark:text-lime-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1.5">
                      <h4 className="text-lg font-black capitalize tracking-tight group-hover:text-emerald-700 dark:group-hover:text-lime-400 transition-colors">
                        {activity.type} Session
                      </h4>
                      <span className="text-xs text-muted-foreground font-bold shrink-0 bg-muted px-2 py-1 rounded-md">
                        {formatActivityDate(activity.date)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <Timer className="h-4 w-4 opacity-70" />
                        {activity.length}m
                      </span>
                      {activity.distance && activity.distance > 0 && (
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 opacity-70" />
                          {activity.distance.toFixed(2)} mi
                        </span>
                      )}
                      <span className={`capitalize px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${getDifficultyBadge(activity.difficulty)}`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-6 w-6 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))
            )}
          </div>

          {/* Upcoming Mini-Section */}
          {initialUpcomingActivities.length > 1 && (
            <div className="mt-4 p-6 bg-muted/30 rounded-3xl border border-border/40">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CalendarClock className="h-5 w-5 opacity-70" />
                Upcoming Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {initialUpcomingActivities.slice(1, 3).map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/exercise/${activity.id}`}
                    className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/60 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <TypeIcon type={activity.type} className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-black capitalize leading-tight">{activity.type} Training</p>
                      <p className="text-[11px] font-bold text-muted-foreground">
                        {formatActivityDate(activity.date)} at {formatActivityTime(activity.time)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Right Column: Trophy Room & Stats ───────────────────────────── */}
        <section className="lg:col-span-4 flex flex-col gap-8">

           {/* Trophy Room (Records) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold tracking-tight">Trophy Room</h3>
              <Trophy className="h-6 w-6 text-lime-600 dark:text-lime-400" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Record: Longest Run */}
              <div className="bg-gradient-to-br from-card to-muted/50 p-6 rounded-2xl shadow-sm border border-border/50 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all text-emerald-900 dark:text-lime-400">
                  <Activity size={160} />
                </div>
                <div className="flex items-center gap-2 mb-4">
                   <TrendingUp className="h-4 w-4 text-lime-600" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Longest Distance</span>
                </div>
                <div className="text-4xl font-black mb-1">
                  {personalRecords.longestRun ? (personalRecords.longestRun.distance || 0).toFixed(1) : "0.0"} 
                  <span className="text-lg font-bold text-muted-foreground ml-1">mi</span>
                </div>
                <div className="text-xs font-bold text-muted-foreground italic">
                   {personalRecords.longestRun ? `Set on ${format(new Date(personalRecords.longestRun.date + "T00:00:00"), "MMM d, yyyy")}` : "No runs recorded yet"}
                </div>
              </div>

              {/* Record: Fastest Pace */}
              <div className="bg-gradient-to-br from-card to-muted/50 p-6 rounded-2xl shadow-sm border border-border/50 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all text-emerald-900 dark:text-lime-400">
                  <FastForward size={160} />
                </div>
                <div className="flex items-center gap-2 mb-4">
                   <Timer className="h-4 w-4 text-emerald-600" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Best Run Pace</span>
                </div>
                <div className="text-4xl font-black mb-1">
                  {personalRecords.fastestRun ? (() => {
                    const totalSecs = (personalRecords.fastestRun?.pace || 0) * 60;
                    const mins = Math.floor(totalSecs / 60);
                    const secs = Math.round(totalSecs % 60);
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                  })() : "0:00"}
                  <span className="text-lg font-bold text-muted-foreground ml-1">/mi</span>
                </div>
                <div className="text-xs font-bold text-muted-foreground italic">
                  {personalRecords.fastestRun ? `${(personalRecords.fastestRun.activity.distance || 0).toFixed(1)}mi on ${format(new Date(personalRecords.fastestRun.activity.date + "T00:00:00"), "MMM d, yyyy")}` : "Keep pushing the tempo"}
                </div>
              </div>

              {/* Record: Max Weight */}
              <div className="bg-gradient-to-br from-card to-muted/50 p-6 rounded-2xl shadow-sm border border-border/50 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all text-emerald-900 dark:text-lime-400">
                  <Dumbbell size={160} />
                </div>
                <div className="flex items-center gap-2 mb-4">
                   <Dumbbell className="h-4 w-4 text-sky-600" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Max Weight Lift</span>
                </div>
                <div className="text-4xl font-black mb-1">
                  {personalRecords.maxWeight}
                  <span className="text-lg font-bold text-muted-foreground ml-1">lbs</span>
                </div>
                <div className="text-xs font-bold text-muted-foreground italic truncate">
                  {personalRecords.maxWeight > 0 ? personalRecords.maxWeightExercise : "Strength training starts here"}
                </div>
              </div>

              {/* Record: Longest Swim (New) */}
              {personalRecords.longestSwim && (
                <div className="bg-gradient-to-br from-card to-muted/50 p-6 rounded-2xl shadow-sm border border-border/50 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all text-emerald-900 dark:text-lime-400">
                    <Activity size={160} /> {/* Should technically be a swim icon if available */}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                     <Activity className="h-4 w-4 text-blue-600" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Longest Swim</span>
                  </div>
                  <div className="text-4xl font-black mb-1">
                    {(personalRecords.longestSwim.activity.distance || 0).toFixed(1)}
                    <span className="text-lg font-bold text-muted-foreground ml-1">mi</span>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground italic truncate">
                    Set on {format(new Date(personalRecords.longestSwim.activity.date + "T00:00:00"), "MMM d, yyyy")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-6 bg-card rounded-3xl shadow-sm border border-border/40">
            <h4 className="text-[10px] font-black mb-5 text-muted-foreground uppercase tracking-[0.25em]">
              Year-to-Date Performance
            </h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
               <div>
                  <div className="text-2xl font-black">{initialStats.completed_activities}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Workouts</div>
               </div>
               <div>
                  <div className="text-2xl font-black">{Math.round(initialStats.completion_rate)}%</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Success Rate</div>
               </div>
               <div>
                  <div className="text-2xl font-black">{Math.floor(initialStats.total_duration / 60)}h</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Active Time</div>
               </div>
               <div>
                  <div className="text-2xl font-black">{initialStats.total_distance.toFixed(0)} mi</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Mileage</div>
               </div>
            </div>

            {/* Quote / Progress */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="font-bold text-foreground/80 italic text-sm leading-relaxed">
                &ldquo;Continuous improvement is better than delayed perfection.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-grow bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(initialStats.completion_rate, 100)}%`,
                      background: "#a3e635",
                    }}
                  />
                </div>
                <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">
                  {66}% Weekly Goal
                </span>
              </div>
            </div>
          </div>
          
        </section>
      </div>
    </div>
  );
}

// Add missing icon
function CalendarClock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h5" />
      <path d="M17.5 17.5 16 16.25V14" />
      <circle cx="16" cy="16" r="6" />
    </svg>
  );
}

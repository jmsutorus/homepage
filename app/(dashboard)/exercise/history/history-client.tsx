"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  Download, 
  Printer, 
  MoreVertical, 
  Bolt, 
  Activity, 
  Dumbbell, 
  User2, 
  Zap, 
  Timer, 
  Star,
  ChevronRight,
  TrendingUp,
  BicepsFlexed
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutActivity, Exercise } from "@/lib/db/workout-activities";

interface HistoryPageClientProps {
  initialActivities: WorkoutActivity[];
}

export function HistoryPageClient({ initialActivities }: HistoryPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [intensityFilter, setIntensityFilter] = useState("All");

  // PR detection
  const personalRecords = useMemo(() => {
    let longestRun = 0;
    let maxWeight = 0;
    const records = new Set<number>();

    // We need to iterate chronologically to mark PRs as they happened
    const sortedChronologically = [...initialActivities].sort((a, b) => 
      new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime()
    );

    sortedChronologically.forEach(activity => {
      let isPR = false;
      
      // Distance PR
      if (activity.distance && activity.distance > longestRun) {
        longestRun = activity.distance;
        isPR = true;
      }

      // Weight PR
      if (activity.type === "strength") {
        try {
          const exercises: Exercise[] = typeof activity.exercises === 'string' 
            ? JSON.parse(activity.exercises) 
            : activity.exercises;
          
          exercises.forEach(ex => {
            if (ex.weight && ex.weight > maxWeight) {
              maxWeight = ex.weight;
              isPR = true;
            }
          });
        } catch (e) {}
      }

      if (isPR) {
        records.add(activity.id);
      }
    });

    return records;
  }, [initialActivities]);

  // Filtering logic
  const filteredActivities = useMemo(() => {
    return initialActivities.filter((activity) => {
      // Search
      const matchesSearch = 
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.notes?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      
      // Type
      const matchesType = typeFilter === "All" || activity.type.toLowerCase() === typeFilter.toLowerCase();
      
      // Intensity (Difficulty)
      const matchesIntensity = intensityFilter === "All" || activity.difficulty.toLowerCase() === intensityFilter.toLowerCase();
      
      // Date
      let matchesDate = true;
      const activityDate = parseISO(activity.date);
      if (dateFilter === "Last 7 days") {
        matchesDate = isAfter(activityDate, subDays(new Date(), 7));
      } else if (dateFilter === "Last month") {
        matchesDate = isAfter(activityDate, subDays(new Date(), 30));
      } else if (dateFilter === "Last 3 months") {
        matchesDate = isAfter(activityDate, subDays(new Date(), 90));
      }

      return matchesSearch && matchesType && matchesIntensity && matchesDate;
    });
  }, [initialActivities, searchTerm, typeFilter, dateFilter, intensityFilter]);

  // Statistics for "Weekly Highlight"
  const weeklyHighlight = useMemo(() => {
    const last7Days = initialActivities.filter(a => isAfter(parseISO(a.date), subDays(new Date(), 7)));
    const mobilitySessions = last7Days.filter(a => a.type === "flexibility" || a.type === "yoga");
    
    if (mobilitySessions.length > 0) {
      return {
        title: "Mobility & Recovery Flow",
        description: `You've completed ${mobilitySessions.length} mobility sessions this week. Consistency is key to longevity.`,
        sessionCount: mobilitySessions.length
      };
    }
    
    const highIntensity = last7Days.filter(a => a.difficulty === "hard" || a.difficulty === "very hard");
    if (highIntensity.length > 0) {
      return {
        title: "High Intensity Week",
        description: `You've pushed through ${highIntensity.length} high-intensity sessions. Your heart will thank you!`,
        sessionCount: highIntensity.length
      };
    }

    return {
      title: "Keep Up the Momentum",
      description: "Every session counts. Track your progress and stay consistent with your goals.",
      sessionCount: last7Days.length
    };
  }, [initialActivities]);

  const calculateVolume = (activity: WorkoutActivity) => {
    if (activity.type === "strength") {
      try {
        const exercises: Exercise[] = typeof activity.exercises === 'string' 
          ? JSON.parse(activity.exercises) 
          : activity.exercises;
        
        return exercises.reduce((acc, ex) => {
          if (ex.weight && ex.sets && ex.reps) {
            return acc + (ex.weight * ex.sets * ex.reps);
          }
          return acc;
        }, 0);
      } catch (e) {
        return 0;
      }
    }
    return activity.distance || 0;
  };

  const getFormatUnit = (activity: WorkoutActivity) => {
    if (activity.type === "strength") return "lbs";
    if (activity.type === "run" || activity.type === "cardio" || activity.type === "sports") return "mi";
    return "";
  };

  const TypeIcon = ({ type, className }: { type: string; className?: string }) => {
    const cls = className ?? "h-5 w-5";
    switch (type.toLowerCase()) {
      case "run": return <Activity className={cls} />;
      case "cardio": return <Bolt className={cls} />;
      case "strength": return <Dumbbell className={cls} />;
      case "flexibility": return <User2 className={cls} />;
      case "yoga": return <User2 className={cls} />;
      case "sports": return <Zap className={cls} />;
      case "cycling": return <Activity className={cls} />;
      default: return <Activity className={cls} />;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("All");
    setDateFilter("All Time");
    setIntensityFilter("All");
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
        <Link 
          href="/exercise" 
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ChevronRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Workout History</h1>
            <p className="text-muted-foreground font-medium text-lg">Review your performance and track your growth.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="cursor-pointer bg-card p-3 rounded-xl shadow-sm border border-border text-muted-foreground hover:text-primary transition-colors">
              <Download className="h-5 w-5" />
            </button>
            <button className="cursor-pointer bg-card p-3 rounded-xl shadow-sm border border-border text-muted-foreground hover:text-primary transition-colors">
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Filters Section */}
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-muted/30 rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground/60 transition-all"
                placeholder="Search activities..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent border-none py-1.5 px-3 text-xs font-bold focus:ring-0 cursor-pointer"
              >
                <option>All Activities</option>
                <option>Run</option>
                <option>Cardio</option>
                <option>Strength</option>
                <option>Flexibility</option>
                <option>Sports</option>
              </select>
              <div className="w-px h-4 bg-border"></div>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none py-1.5 px-3 text-xs font-bold focus:ring-0 cursor-pointer"
              >
                <option>All Time</option>
                <option>Last 7 days</option>
                <option>Last month</option>
                <option>Last 3 months</option>
              </select>
              <div className="w-px h-4 bg-border"></div>
              <select 
                value={intensityFilter}
                onChange={(e) => setIntensityFilter(e.target.value)}
                className="bg-transparent border-none py-1.5 px-3 text-xs font-bold focus:ring-0 cursor-pointer"
              >
                <option>All Intensities</option>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Hard</option>
                <option>Very Hard</option>
              </select>
            </div>

            <button 
              onClick={clearFilters}
              className="cursor-pointer text-primary text-xs font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity ml-auto"
            >
              <RefreshCcw className="h-3 w-3" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activity & Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intensity</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Burn/Volume</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                      No activities found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => {
                    const volume = calculateVolume(activity);
                    const unit = getFormatUnit(activity);
                    const formattedDate = format(parseISO(activity.date), "MMM dd");
                    const formattedTime = activity.time; // Format if needed

                    return (
                      <tr key={activity.id} className="group hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-5">
                          <Link href={`/exercise/${activity.id}`} className="flex items-center gap-4 group">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                              activity.type === "strength" ? "bg-soft-earth/10 text-soft-earth dark:bg-soft-earth/20 dark:text-soft-earth" :
                              activity.type === "run" ? "bg-evergreen/10 text-evergreen dark:bg-evergreen/20 dark:text-evergreen" :
                              activity.type === "cardio" ? "bg-sage-green/10 text-sage-green dark:bg-sage-green/20 dark:text-sage-green" :
                              "bg-soft-earth/10 text-soft-earth"
                            )}>
                              <TypeIcon type={activity.type} className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-foreground">
                                {activity.notes ? (activity.notes.length > 30 ? activity.notes.substring(0, 30) + "..." : activity.notes) : `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Session`}
                                </p>
                                {personalRecords.has(activity.id) && (
                                  <span className="bg-sage-green text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-1">
                                    <Star className="h-2 w-2 fill-current" />
                                    PR
                                  </span>
                                )}
                                {activity.difficulty === "very hard" && (
                                  <span className="bg-burnt-terracotta text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-1">
                                    <Star className="h-2 w-2 fill-current" />
                                    MAX
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{formattedDate} • {formattedTime}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-muted text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-foreground">
                            {activity.length} <span className="text-muted-foreground font-medium">min</span>
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "text-xs font-bold",
                            activity.difficulty === "easy" ? "text-sage-green" :
                            activity.difficulty === "moderate" ? "text-evergreen" :
                            activity.difficulty === "hard" ? "text-burnt-terracotta opacity-80" :
                            "text-burnt-terracotta"
                          )}>
                            {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-sm font-bold text-foreground">
                            {volume > 0 ? (
                              <>
                                {activity.type === "strength" ? volume.toLocaleString() : volume.toFixed(1)} 
                                <span className="text-muted-foreground font-medium ml-1">{unit}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground font-medium">—</span>
                            )}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="cursor-pointer p-2 text-muted-foreground/40 hover:text-primary transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Highlight Card */}
        <div className="mt-8 bg-primary text-primary-foreground p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 inline-block">Weekly Highlight</span>
              <h3 className="text-3xl font-extrabold mb-2">{weeklyHighlight.title}</h3>
              <p className="text-primary-foreground/80 font-medium mb-6">{weeklyHighlight.description}</p>
              <button className="cursor-pointer bg-background text-primary font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                View Analytics
              </button>
            </div>
            <div className="hidden md:block flex-shrink-0">
               <div className="w-48 h-32 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 rotate-3 group-hover:rotate-0 transition-transform">
                  <TrendingUp className="h-16 w-16 opacity-40 text-white" />
               </div>
            </div>
          </div>
        </div>

        {/* Pagination/Load More */}
        {filteredActivities.length > 20 && (
          <div className="flex justify-center mt-12 mb-20">
            <button className="cursor-pointer bg-card text-foreground font-bold py-4 px-12 rounded-2xl hover:scale-105 transition-all shadow-sm border border-border">
              Load more activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

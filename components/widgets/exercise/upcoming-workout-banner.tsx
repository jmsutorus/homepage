"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Activity, 
  Zap, 
  Flame, 
  Timer, 
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";
import { WorkoutActivity } from "@/lib/db/workout-activities";

interface UpcomingWorkoutBannerProps {
  workouts: WorkoutActivity[];
}

const getTypeIcon = (type: string) => {
  const iconClass = "w-6 h-6";
  switch (type?.toLowerCase()) {
    case "run":
    case "cardio": 
      return <Activity className={iconClass} />;
    case "strength": 
      return <Dumbbell className={iconClass} />;
    case "flexibility":
    case "yoga":
    case "pilates":
      return <Zap className={iconClass} />;
    case "sports": 
      return <Flame className={iconClass} />;
    default: 
      return <Activity className={iconClass} />;
  }
};

const getTypeEmoji = (type: string) => {
  switch (type?.toLowerCase()) {
    case "run": return "🏃";
    case "cardio": return "🫀";
    case "strength": return "🏋️";
    case "flexibility":
    case "yoga": 
    case "pilates":
      return "🧘";
    case "sports": return "⚽";
    case "swim": return "🏊";
    default: return "💪";
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy": return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
    case "moderate": return "bg-blue-500/20 text-blue-200 border-blue-500/30";
    case "hard": return "bg-orange-500/20 text-orange-200 border-orange-500/30";
    case "very hard": return "bg-red-500/20 text-red-200 border-red-500/30";
    default: return "bg-white/10 text-white/80 border-white/20";
  }
};
const formatTo12HourTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
};

export function UpcomingWorkoutBanner({ workouts }: UpcomingWorkoutBannerProps) {
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<WorkoutActivity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const filterWorkouts = () => {
      const now = new Date();
      
      // Calculate user's local YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const localDateStr = `${year}-${month}-${day}`;
      
      // Calculate user's local HH:MM
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const localTimeStr = `${hours}:${minutes}`;

      const filtered = workouts.filter((workout) => {
        // Must be today
        if (workout.date !== localDateStr) return false;
        // Must not be completed
        if (workout.completed) return false;
        // Must be upcoming (time >= now)
        return workout.time >= localTimeStr;
      });

      // Sort by time ascending
      filtered.sort((a, b) => a.time.localeCompare(b.time));

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUpcomingWorkouts(filtered);
    };

    filterWorkouts();
    // Update every minute to reflect passing time
    const interval = setInterval(filterWorkouts, 60000);
    return () => clearInterval(interval);
  }, [workouts]);

  // Prevent hydration mismatch by returning null until mounted
  if (!mounted || upcomingWorkouts.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-media-primary via-media-primary/80 to-media-secondary border-none text-white shadow-2xl mb-8 relative overflow-hidden group">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="drift-item">⚡</div>
        <div className="drift-item">🔥</div>
        <div className="drift-item">💪</div>
        <div className="drift-item">🏆</div>
        <div className="drift-item">🏅</div>
      </div>

      {/* Decorative floating icons */}
      <div className="absolute top-4 right-8 opacity-20 animate-float">
        <Sparkles className="w-12 h-12" />
      </div>
      <div className="absolute bottom-4 right-24 opacity-15 animate-float-delayed">
        <Award className="w-16 h-16" />
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left w-full">
            <div className="hidden md:flex p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-white group-hover:scale-110 transition-transform duration-500">
              <Timer className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-3 flex-grow">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-2xl">🔥</span>
                <h3 className="text-xl md:text-2xl font-bold font-headline tracking-tight">
                  Upcoming {upcomingWorkouts.length === 1 ? 'Workout' : 'Workouts'} Today
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {upcomingWorkouts.map((workout) => (
                  <Link 
                    key={workout.id} 
                    href={`/exercise/${workout.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-300 group/item cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center">
                      {getTypeIcon(workout.type)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold capitalize">
                          {getTypeEmoji(workout.type)} {workout.type}
                        </span>
                        <Badge variant="outline" className={`text-[10px] py-0 px-1.5 capitalize font-medium ${getDifficultyColor(workout.difficulty)}`}>
                          {workout.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-white/80 font-medium">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{formatTo12HourTime(workout.time)}</span>
                        {workout.length > 0 && (
                          <span className="opacity-75">• {workout.length} min</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-white/50 group-hover/item:text-white group-hover/item:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Button asChild variant="secondary" size="lg" className="shrink-0 font-bold shadow-xl bg-white text-media-secondary hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300">
            <Link href="/exercise">
              Workout Hub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2.5s;
        }
        .drift-item {
          position: absolute;
          bottom: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation: drift-up linear infinite;
          font-size: 1.5rem;
          opacity: 0.3;
        }
        .drift-item:nth-of-type(1) { left: 5%; animation-duration: 10s; animation-delay: 0s; }
        .drift-item:nth-of-type(2) { left: 25%; animation-duration: 14s; animation-delay: 2s; font-size: 1.8rem; }
        .drift-item:nth-of-type(3) { left: 45%; animation-duration: 11s; animation-delay: 5s; }
        .drift-item:nth-of-type(4) { left: 65%; animation-duration: 13s; animation-delay: 1s; font-size: 1.4rem; }
        .drift-item:nth-of-type(5) { left: 85%; animation-duration: 15s; animation-delay: 3s; }
        @keyframes drift-up {
          0% { bottom: -10%; opacity: 0; transform: translateX(0); }
          10% { opacity: 0.4; }
          50% { opacity: 0.5; transform: translateX(20px); }
          90% { opacity: 0.2; }
          100% { bottom: 110%; opacity: 0; transform: translateX(-15px); }
        }
      `}</style>
    </Card>
  );
}

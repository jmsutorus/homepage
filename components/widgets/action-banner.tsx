import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PenLine, CheckCircle2 } from "lucide-react";
import { getUserId } from "@/lib/auth/server";
import { getMoodEntry } from "@/lib/db/mood";
import { getDailyJournalByDate } from "@/lib/db/journals";
import { getHabits, getHabitCompletions } from "@/lib/db/habits";

export async function ActionBanner() {
  const userId = await getUserId();
  
  // Get current date in YYYY-MM-DD format (using local time)
  // Note: In a real production env with users in different timezones, 
  // we'd need to handle this more carefully. For now, assuming server/user match.
  const now = new Date();
  const today = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
  
  // Fetch data in parallel
  const [moodEntry, dailyJournal, habits, habitCompletions] = await Promise.all([
    getMoodEntry(today, userId),
    getDailyJournalByDate(today),
    getHabits(userId),
    getHabitCompletions(userId, today)
  ]);
  console.log(habitCompletions);
  console.log(habits);

  const hasMoodOrJournal = !!(moodEntry || dailyJournal);
  const hasActiveHabits = habits.length > 0;
  const hasCompletedHabits = habitCompletions.length >= habits.length;

  // State 1: Missing Mood or Journal
  if (!hasMoodOrJournal) {
    return (
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white shadow-lg mb-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <PenLine className="h-5 w-5" />
              How are you feeling today?
            </h3>
            <p className="text-indigo-100">
              Take a moment to check in with yourself and record your thoughts.
            </p>
          </div>
          <Button asChild variant="secondary" size="lg" className="shrink-0 font-semibold">
            <Link href={`/daily/${today}`}>
              Check In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // State 2: Missing Habits (if habits exist)
  if (hasActiveHabits && !hasCompletedHabits) {
    return (
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white shadow-lg mb-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Don't forget your habits!
            </h3>
            <p className="text-emerald-100">
              You have active habits to complete today. Keep your streak alive!
            </p>
          </div>
          <Button asChild variant="secondary" size="lg" className="shrink-0 font-semibold">
            <Link href={`/daily/${today}`}>
              View Habits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // State 3: All Done (or no habits to do)
  return null;
}

import Link from "next/link";
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
    getDailyJournalByDate(today, userId),
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
      <div className="bg-media-secondary rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-2 text-center sm:text-left flex-1">
          <h3 className="text-2xl font-bold font-headline tracking-tighter text-media-on-secondary flex items-center justify-center sm:justify-start gap-3">
             <span className="material-symbols-outlined text-3xl">edit_note</span>
             The Daily Audit Awaits
          </h3>
          <p className="text-media-secondary-fixed-dim text-sm max-w-lg">
            Record today&apos;s atmosphere. Take a moment to check in with yourself and capture the currents of this season.
          </p>
        </div>
        
        <Link 
          href={`/daily/${today}`}
          className="relative z-10 shrink-0 bg-media-on-secondary text-media-secondary px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          Check In
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    );
  }

  // State 2: Missing Habits (if habits exist)
  if (hasActiveHabits && !hasCompletedHabits) {
    return (
      <div className="bg-media-primary rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-2 text-center sm:text-left flex-1">
          <h3 className="text-2xl font-bold font-headline tracking-tighter text-media-on-secondary flex items-center justify-center sm:justify-start gap-3">
             <span className="material-symbols-outlined text-3xl">task_alt</span>
             Incomplete Rituals
          </h3>
          <p className="text-media-primary-fixed-dim text-sm max-w-lg">
            You have active habits remaining for the day. Sustain the kinetic harmony.
          </p>
        </div>
        
        <Link 
          href={`/daily/${today}`}
          className="relative z-10 shrink-0 bg-media-on-secondary text-media-primary px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          View Habits
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    );
  }

  // State 3: All Done (or no habits to do)
  return null;
}

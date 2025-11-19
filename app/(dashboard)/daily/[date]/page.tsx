import { getDailyJournalByDate } from "@/lib/db/journals";
import { getHabitsAction, getHabitCompletionsAction } from "@/lib/actions/habits";
import { formatDateLongSafe } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { DailyHabits } from "@/components/widgets/habits/daily-habits";
import { DailyJournalPreview } from "@/components/widgets/journal/daily-journal-preview";
import { MoodSelector } from "@/components/widgets/mood/mood-selector";
import { getMoodForDate } from "@/lib/db/journals";

interface DailyPageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function DailyPage({ params }: DailyPageProps) {
  const { date } = await params;
  const journal = getDailyJournalByDate(date);
  const habits = await getHabitsAction();
  const completions = await getHabitCompletionsAction(date);
  const mood = getMoodForDate(date);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="cursor-pointer">
          <Link href="/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {formatDateLongSafe(date, "en-US")}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Dashboard
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          {/* Habits Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Habits</h2>
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <Link href="/habits">Manage</Link>
              </Button>
            </div>
            <DailyHabits 
              habits={habits} 
              completions={completions} 
              date={date} 
            />
          </section>

          {/* Journal Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daily Journal</h2>
              {!journal && (
                <Button size="sm" asChild className="cursor-pointer">
                  <Link href={`/journals/new?type=daily&date=${date}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Entry
                  </Link>
                </Button>
              )}
            </div>
            {journal ? (
              <DailyJournalPreview journal={journal} />
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No journal entry for this day.
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          {/* Mood Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Mood</h2>
            <MoodSelector date={date} currentMood={mood} />
          </section>

          {/* Stats/Summary Section (Placeholder) */}
          <section className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Habits Completed</span>
                <span className="font-medium">
                  {completions.length}/{habits.length}
                </span>
              </div>
              {/* Add more stats here later */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

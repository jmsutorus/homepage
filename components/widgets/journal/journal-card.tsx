import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import type { JournalContent } from "@/lib/db/journals";
import { getMoodForDate } from "@/lib/db/journals";

interface JournalCardProps {
  journal: JournalContent;
}

export async function JournalCard({ journal }: JournalCardProps) {
  const href = `/journals/${journal.slug}`;

  // For daily journals, get mood from mood_entries
  let displayMood = journal.mood;
  if (journal.journal_type === "daily" && journal.daily_date) {
    const moodRating = await getMoodForDate(journal.daily_date, journal.userId);
    if (moodRating !== null) {
      displayMood = moodRating;
    }
  }

  return (
    <Link href={href} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {journal.title}
          </h3>

          {/* Journal Type & Date */}
          <div className="flex gap-2 items-center flex-wrap">
            <Badge variant="secondary" className="text-xs capitalize">
              {journal.journal_type}
            </Badge>

            {journal.journal_type === "daily" && journal.daily_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(journal.daily_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Mood Rating */}
          {displayMood !== null && displayMood !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">Mood: {displayMood}/10</span>
            </div>
          )}

          {/* Tags */}
          {journal.tags && journal.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {journal.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {journal.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{journal.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Created Date - only show for general journals */}
          {journal.journal_type === "general" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(journal.created_at).toLocaleDateString()}</span>
            </div>
          )}

          {/* Content Preview */}
          {journal.content && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {journal.content.substring(0, 100)}...
            </p>
          )}

          {/* Featured Badge */}
          {journal.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

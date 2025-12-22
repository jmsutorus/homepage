"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, User, Users, UserPlus, Briefcase, ArrowRight } from "lucide-react";
import { type PersonWithAnniversary } from "@/lib/db/people";

interface UpcomingAnniversariesProps {
  anniversaries: PersonWithAnniversary[];
  todayDate: string;
}

const RELATIONSHIP_CONFIG = {
  family: {
    icon: Users,
    color: "rose" as const,
    bgClass: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
    label: "Family"
  },
  friends: {
    icon: UserPlus,
    color: "blue" as const,
    bgClass: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    label: "Friends"
  },
  work: {
    icon: Briefcase,
    color: "slate" as const,
    bgClass: "bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300",
    label: "Work"
  },
  other: {
    icon: User,
    color: "purple" as const,
    bgClass: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
    label: "Other"
  }
};

export function UpcomingAnniversaries({ anniversaries, todayDate }: UpcomingAnniversariesProps) {
  // Show top 5 upcoming anniversaries
  const displayAnniversaries = anniversaries.slice(0, 5);

  // Don't show widget if no upcoming anniversaries
  if (displayAnniversaries.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-red-500" />
            Upcoming Anniversaries
          </CardTitle>
          <Link href="/people">
            <Button variant="ghost" size="sm" className="h-8">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayAnniversaries.map((person) => {
          const config = RELATIONSHIP_CONFIG[person.relationship];
          const Icon = config.icon;
          const isToday = person.daysUntilAnniversary === 0;

          // Format anniversary date
          const [, month, day] = (person.anniversary || '').split('-');
          const anniversaryDate = new Date(2000, parseInt(month) - 1, parseInt(day));
          const formattedDate = anniversaryDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });

          return (
            <div
              key={person.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                isToday ? 'bg-red-500/10 border border-red-500/30' : 'hover:bg-muted/50'
              }`}
            >
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Person info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{person.name}</p>
                  <Badge variant="outline" className={`${config.bgClass} text-xs`}>
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{formattedDate}</span>
                  {person.yearsTogether !== null && (
                    <>
                      <span>•</span>
                      <span>{person.yearsTogether + 1} years</span>
                    </>
                  )}
                  {person.yearsTogether === null && (
                    <>
                      <span>•</span>
                      <span>Years unknown</span>
                    </>
                  )}
                </div>
              </div>

              {/* Days until */}
              <div className="flex-shrink-0 text-right">
                {isToday ? (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-sm">
                    <Heart className="h-4 w-4" />
                    Today!
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-semibold">
                      {person.daysUntilAnniversary}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {person.daysUntilAnniversary === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {anniversaries.length > 5 && (
          <div className="text-center pt-2">
            <Link href="/people">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                +{anniversaries.length - 5} more upcoming
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

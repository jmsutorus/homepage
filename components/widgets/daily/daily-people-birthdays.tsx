"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Heart, Users, UserPlus, Briefcase, User } from "lucide-react";
import type { CalendarPersonEvent } from "@/lib/db/calendar";

interface DailyPeopleBirthdaysProps {
  events: CalendarPersonEvent[];
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

export function DailyPeopleBirthdays({ events }: DailyPeopleBirthdaysProps) {
  if (events.length === 0) return null;

  // Separate birthdays and anniversaries
  const birthdays = events.filter(e => e.eventType === 'birthday');
  const anniversaries = events.filter(e => e.eventType === 'anniversary');

  return (
    <div className="space-y-4">
      {/* Birthdays */}
      {birthdays.length > 0 && (
        <Card className="overflow-hidden relative">
          {/* Festive gradient background for birthdays */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />

          <CardHeader className="relative pb-3">
            <CardTitle className="flex items-center gap-2 text-pink-500">
              <Cake className="h-5 w-5" />
              {birthdays.length === 1 ? 'Birthday' : 'Birthdays'}
            </CardTitle>
            <CardDescription>
              {birthdays.length === 1
                ? 'Someone special celebrates today'
                : `${birthdays.length} people celebrate today`}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-3">
            {birthdays.map((event) => {
              const config = RELATIONSHIP_CONFIG[event.relationship];
              const Icon = config.icon;

              return (
                <div
                  key={`${event.eventType}-${event.personId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎂</div>
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.age !== null ? `Turns ${event.age}` : 'Birthday'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={config.bgClass}>
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Anniversaries */}
      {anniversaries.length > 0 && (
        <Card className="overflow-hidden relative">
          {/* Romantic gradient background for anniversaries */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none" />

          <CardHeader className="relative pb-3">
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Heart className="h-5 w-5" />
              {anniversaries.length === 1 ? 'Anniversary' : 'Anniversaries'}
            </CardTitle>
            <CardDescription>
              {anniversaries.length === 1
                ? 'A special anniversary today'
                : `${anniversaries.length} anniversaries today`}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-3">
            {anniversaries.map((event) => {
              const config = RELATIONSHIP_CONFIG[event.relationship];
              const Icon = config.icon;

              return (
                <div
                  key={`${event.eventType}-${event.personId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💐</div>
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.age !== null ? `${event.age} years` : 'Anniversary'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={config.bgClass}>
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

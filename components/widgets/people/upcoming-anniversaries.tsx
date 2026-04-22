"use client";

import Link from "next/link";
import { type PersonWithAnniversary } from "@/lib/db/people";
import { cn } from "@/lib/utils";

interface UpcomingAnniversariesProps {
  anniversaries: PersonWithAnniversary[];
}

const RELATIONSHIP_CONFIG = {
  family: {
    icon: "group",
    label: "Family"
  },
  friends: {
    icon: "person_add",
    label: "Friends"
  },
  work: {
    icon: "work",
    label: "Work"
  },
  other: {
    icon: "person",
    label: "Other"
  }
};

export function UpcomingAnniversaries({ anniversaries }: UpcomingAnniversariesProps) {
  // Show top 5 upcoming anniversaries
  const displayAnniversaries = anniversaries.slice(0, 5);

  // Don't show widget if no upcoming anniversaries
  if (displayAnniversaries.length === 0) {
    return null;
  }

  return (
    <div className="bg-media-surface-container-low rounded-2xl p-6 md:p-8 border border-media-outline-variant/30 relative flex flex-col group overflow-hidden">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-2xl font-bold font-headline tracking-tighter text-media-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-media-secondary">favorite</span>
          Upcoming Anniversaries
        </h2>
        <Link className="text-media-secondary tracking-widest uppercase text-[10px] font-bold hover:opacity-80 flex items-center gap-1" href="/people">
          View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </Link>
      </div>

      <div className="space-y-4">
        {displayAnniversaries.map((person) => {
          const config = RELATIONSHIP_CONFIG[person.relationship];
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
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-all border",
                isToday 
                  ? "bg-media-secondary/10 border-media-secondary/30" 
                  : "bg-media-surface hover:bg-media-surface-container border-media-outline-variant/20"
              )}
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-media-surface-container-highest border border-media-outline-variant/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-media-on-surface-variant opacity-50">person</span>
                )}
              </div>

              {/* Person info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-media-on-surface truncate">{person.name}</p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-media-primary/10 border border-media-primary/20 text-[10px] uppercase tracking-wider font-bold text-media-primary">
                    <span className="material-symbols-outlined text-[10px]">{config.icon}</span>
                    {config.label}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-media-on-surface-variant/70">
                  <span className="text-media-secondary uppercase tracking-widest">{formattedDate}</span>
                  {person.yearsTogether !== null && (
                    <>
                      <span className="opacity-30">•</span>
                      <span>{person.yearsTogether + 1} years</span>
                    </>
                  )}
                  {person.yearsTogether === null && (
                    <>
                      <span className="opacity-30">•</span>
                      <span>Years unknown</span>
                    </>
                  )}
                </div>
              </div>

              {/* Days until */}
              <div className="flex-shrink-0 text-right">
                {isToday ? (
                  <div className="flex items-center gap-1 text-media-secondary font-bold uppercase tracking-widest text-[10px]">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    Today!
                  </div>
                ) : (
                  <div className="flex flex-col items-end leading-none">
                    <span className="font-headline font-bold text-xl text-media-primary">{person.daysUntilAnniversary}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-media-on-surface-variant/50">
                      {person.daysUntilAnniversary === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {anniversaries.length > 5 && (
          <div className="text-center pt-2">
            <Link href="/people" className="text-[10px] uppercase font-bold tracking-widest text-media-on-surface-variant hover:text-media-secondary transition-colors">
              +{anniversaries.length - 5} more upcoming
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

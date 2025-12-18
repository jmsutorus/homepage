"use client";

import { Plane, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CalendarVacation } from "@/lib/db/calendar";
import { parseLocalDate } from "@/lib/types/vacations";
import Link from "next/link";

interface DailyVacationsProps {
  vacations: CalendarVacation[];
}

export function DailyVacations({ vacations }: DailyVacationsProps) {
  return (
    <div className="space-y-4">
      {vacations.map((vacationData) => (
        <Link 
          key={vacationData.vacation.id}
          href={`/vacations/${vacationData.vacation.slug}`}
          className="block"
        >
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Title and badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    {vacationData.vacation.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {vacationData.vacation.destination}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {vacationData.isStartDate && (
                    <Badge variant="default" className="text-xs bg-sky-600">
                      Starting Today
                    </Badge>
                  )}
                  {vacationData.isEndDate && !vacationData.isStartDate && (
                    <Badge variant="outline" className="text-xs border-sky-600 text-sky-600">
                      Ending Today
                    </Badge>
                  )}
                  {!vacationData.isStartDate && !vacationData.isEndDate && (
                    <Badge variant="secondary" className="text-xs">
                      Ongoing
                    </Badge>
                  )}
                </div>
              </div>

              {/* Vacation dates */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" />
                {parseLocalDate(vacationData.vacation.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {parseLocalDate(vacationData.vacation.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Itinerary Items */}
              {vacationData.itineraryItems.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Today&apos;s Itinerary:
                  </p>
                  <div className="space-y-2">
                    {vacationData.itineraryItems.map((item) => (
                      <div key={item.id} className="text-sm pl-3 border-l-2 border-sky-600/30">
                        <p className="font-medium">{item.title || `Day ${item.day_number}`}</p>
                        {item.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </p>
                        )}
                        {item.activities && item.activities.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {item.activities.map((activity: any, idx: number) => (
                              <li key={idx} className="text-xs text-muted-foreground">
                                • {typeof activity === 'string' ? activity : activity.title || activity.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings */}
              {vacationData.bookings.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Today&apos;s Bookings:
                  </p>
                  <div className="space-y-2">
                    {vacationData.bookings.map((booking) => (
                      <div key={booking.id} className="text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{booking.title}</p>
                            {booking.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {booking.location}
                              </p>
                            )}
                            {booking.start_time && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {booking.start_time}
                                {booking.end_time && ` - ${booking.end_time}`}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {booking.type}
                            </Badge>
                            {booking.status === "confirmed" && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                Confirmed
                              </Badge>
                            )}
                          </div>
                        </div>
                        {booking.confirmation_number && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Confirmation: {booking.confirmation_number}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </Link>
      ))}
    </div>
  );
}

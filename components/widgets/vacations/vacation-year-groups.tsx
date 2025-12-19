'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VacationCard } from './vacation-card';
import { Vacation, getYearFromDate, calculateDurationDays } from '@/lib/types/vacations';

interface VacationYearGroupsProps {
  vacations: Vacation[];
}

export function VacationYearGroups({ vacations }: VacationYearGroupsProps) {
  // Group vacations by year
  const vacationsByYear = vacations.reduce((acc, vacation) => {
    const year = getYearFromDate(vacation.start_date);
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(vacation);
    return acc;
  }, {} as Record<number, Vacation[]>);

  // Sort years descending
  const years = Object.keys(vacationsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // State for collapsed years
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

  const toggleYear = (year: number) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  if (years.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No vacations yet. Start planning your next adventure!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {years.map((year) => {
        const yearVacations = vacationsByYear[year];
        const isCollapsed = collapsedYears.has(year);
        const totalDays = yearVacations.reduce(
          (sum, v) => sum + calculateDurationDays(v.start_date, v.end_date),
          0
        );

        return (
          <div key={year} className="space-y-4">
            {/* Year Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-2xl font-bold hover:bg-transparent p-0"
                onClick={() => toggleYear(year)}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
                {year}
              </Button>
              <div className="text-sm text-muted-foreground">
                {yearVacations.length} {yearVacations.length === 1 ? 'vacation' : 'vacations'} · {totalDays} {totalDays === 1 ? 'day' : 'days'}
              </div>
            </div>

            {/* Vacation Cards */}
            {!isCollapsed && (
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {yearVacations.map((vacation) => (
                  <VacationCard key={vacation.id} vacation={vacation} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

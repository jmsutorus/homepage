'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedProgress } from '@/components/ui/animations/animated-progress';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Vacation, ItineraryDay, Booking } from '@/lib/types/vacations';

interface BudgetTrackerProps {
  vacation: Vacation;
  itinerary?: ItineraryDay[];
  bookings?: Booking[];
}

export function BudgetTracker({ vacation, itinerary = [], bookings = [] }: BudgetTrackerProps) {
  // Calculate totals from itinerary and bookings
  const itineraryPlanned = itinerary.reduce((sum, day) => sum + (day.budget_planned || 0), 0);
  const itineraryActual = itinerary.reduce((sum, day) => sum + (day.budget_actual || 0), 0);
  const bookingsCost = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);

  // Use vacation budget if available, otherwise use calculated totals
  const plannedBudget = vacation.budget_planned || itineraryPlanned;
  const actualSpent = vacation.budget_actual || (itineraryActual + bookingsCost);
  const currency = vacation.budget_currency || 'USD';

  const percentage = plannedBudget > 0 ? (actualSpent / plannedBudget) * 100 : 0;
  const remaining = plannedBudget - actualSpent;
  const isOverBudget = actualSpent > plannedBudget;

  // Determine color based on budget status
  const getProgressColor = () => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  if (!plannedBudget && !actualSpent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No budget set for this vacation.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Progress Bar */}
        {plannedBudget > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-medium">
                {percentage.toFixed(0)}%
              </span>
            </div>
            <AnimatedProgress
              value={actualSpent}
              max={plannedBudget}
              size="lg"
              color={getProgressColor()}
            />
          </div>
        )}

        {/* Budget Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Planned Budget */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-muted-foreground mb-1">Planned Budget</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {currency} {plannedBudget.toLocaleString()}
            </div>
          </div>

          {/* Actual Spent */}
          <div className={`p-4 rounded-lg border ${
            isOverBudget
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="text-xs text-muted-foreground mb-1">Actual Spent</div>
            <div className={`text-xl font-bold ${
              isOverBudget
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {currency} {actualSpent.toLocaleString()}
            </div>
          </div>

          {/* Remaining/Over */}
          <div className={`p-4 rounded-lg border ${
            isOverBudget
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              : 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
          }`}>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              {isOverBudget ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  Over Budget
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  Remaining
                </>
              )}
            </div>
            <div className={`text-xl font-bold ${
              isOverBudget
                ? 'text-red-600 dark:text-red-400'
                : 'text-purple-600 dark:text-purple-400'
            }`}>
              {currency} {Math.abs(remaining).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {(itineraryActual > 0 || bookingsCost > 0) && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-semibold">Spending Breakdown</h4>
            {itineraryActual > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Expenses</span>
                <span className="font-medium">{currency} {itineraryActual.toLocaleString()}</span>
              </div>
            )}
            {bookingsCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bookings</span>
                <span className="font-medium">{currency} {bookingsCost.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

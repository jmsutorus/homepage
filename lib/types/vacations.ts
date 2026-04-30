import {
  type VacationStatus,
  type VacationType,
  type BookingType,
  type BookingStatus,
  type Vacation,
  type VacationInput,
  type ItineraryDay,
  type ItineraryDayInput,
  type Booking,
  type BookingInput,
  type VacationPhoto,
  type VacationPhotoInput,
  type VacationPerson,
  type VacationWithDetails,
  VACATION_STATUSES,
  VACATION_TYPES,
  BOOKING_TYPES,
  BOOKING_STATUSES,
} from "@jmsutorus/earthbound-shared";

// Re-export core types for convenience
export type {
  VacationStatus,
  VacationType,
  BookingType,
  BookingStatus,
  Vacation,
  VacationInput,
  ItineraryDay,
  ItineraryDayInput,
  Booking,
  BookingInput,
  VacationPhoto,
  VacationPhotoInput,
  VacationPerson,
  VacationWithDetails,
};

export {
  VACATION_STATUSES,
  VACATION_TYPES,
  BOOKING_TYPES,
  BOOKING_STATUSES,
};

export const VACATION_STATUS_NAMES: Record<string, string> = {
  planning: "Planning",
  booked: "Booked",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const VACATION_TYPE_NAMES: Record<string, string> = {
  beach: "Beach",
  ski: "Ski",
  cruise: "Cruise",
  "road-trip": "Road Trip",
  city: "City",
  camping: "Camping",
  adventure: "Adventure",
  cultural: "Cultural",
  "theme-park": "Theme Park",
  festival: "Festival",
  business: "Business",
  staycation: "Staycation",
  other: "Other",
};

export const BOOKING_TYPE_NAMES: Record<string, string> = {
  flight: "Flight",
  hotel: "Hotel",
  activity: "Activity",
  car: "Car",
  train: "Train",
  other: "Other",
};

export const BOOKING_STATUS_NAMES: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

/**
 * Parse a date string in YYYY-MM-DD format as a local date
 * Avoids timezone issues that occur when parsing with new Date()
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Helper functions for vacation data
 */

/**
 * Calculate duration in days between two dates
 */
export function calculateDurationDays(startDate: string, endDate: string): number {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end day
}

/**
 * Calculate day number based on vacation start date
 */
export function calculateDayNumber(vacationStartDate: string, dayDate: string): number {
  const start = parseLocalDate(vacationStartDate);
  const day = parseLocalDate(dayDate);
  const diffTime = day.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get year from a date string
 */
export function getYearFromDate(dateString: string): number {
  return new Date(dateString).getFullYear();
}

/**
 * Calculate total budget from itinerary and bookings
 */
export function calculateTotalBudget(itinerary: ItineraryDay[], bookings: Booking[]): {
  plannedTotal: number;
  actualTotal: number;
} {
  const itineraryPlanned = itinerary.reduce((sum, day) => sum + (day.budget_planned || 0), 0);
  const itineraryActual = itinerary.reduce((sum, day) => sum + (day.budget_actual || 0), 0);
  const bookingsCost = bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);

  return {
    plannedTotal: itineraryPlanned,
    actualTotal: itineraryActual + bookingsCost,
  };
}

// Type definitions for vacation planning feature

/**
 * Parse a date string in YYYY-MM-DD format as a local date
 * Avoids timezone issues that occur when parsing with new Date()
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type VacationStatus = 'planning' | 'booked' | 'in-progress' | 'completed' | 'cancelled';
export type VacationType = 'beach' | 'ski' | 'cruise' | 'road-trip' | 'city' | 'camping' | 'adventure' | 'cultural' | 'theme-park' | 'festival' | 'business' | 'staycation' | 'other';
export type BookingType = 'flight' | 'hotel' | 'activity' | 'car' | 'train' | 'other';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

// Constants for dropdowns
export const VACATION_STATUSES: VacationStatus[] = ['planning', 'booked', 'in-progress', 'completed', 'cancelled'];
export const VACATION_STATUS_NAMES: Record<VacationStatus, string> = {
  planning: 'Planning',
  booked: 'Booked',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const VACATION_TYPES: VacationType[] = ['beach', 'ski', 'cruise', 'road-trip', 'city', 'camping', 'adventure', 'cultural', 'theme-park', 'festival', 'business', 'staycation', 'other'];
export const VACATION_TYPE_NAMES: Record<VacationType, string> = {
  beach: 'Beach',
  ski: 'Ski',
  cruise: 'Cruise',
  'road-trip': 'Road Trip',
  city: 'City',
  camping: 'Camping',
  adventure: 'Adventure',
  cultural: 'Cultural',
  'theme-park': 'Theme Park',
  festival: 'Festival/Event',
  business: 'Business',
  staycation: 'Staycation',
  other: 'Other',
};

export const BOOKING_TYPES: BookingType[] = ['flight', 'hotel', 'activity', 'car', 'train', 'other'];
export const BOOKING_TYPE_NAMES: Record<BookingType, string> = {
  flight: 'Flight',
  hotel: 'Hotel',
  activity: 'Activity',
  car: 'Car Rental',
  train: 'Train',
  other: 'Other',
};

export const BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled'];
export const BOOKING_STATUS_NAMES: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

/**
 * Vacation entity - main vacation metadata
 */
export interface Vacation {
  id: number;
  userId: string;
  slug: string;
  title: string;
  destination: string;
  type: VacationType;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  description: string | null;
  poster: string | null;
  status: VacationStatus;
  budget_planned: number | null;
  budget_actual: number | null;
  budget_currency: string;
  tags: string[]; // Parsed from JSON
  rating: number | null;
  featured: boolean; // Parsed from 0/1
  published: boolean; // Parsed from 0/1
  content: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating/updating vacations
 */
export interface VacationInput {
  slug: string;
  title: string;
  destination: string;
  type?: VacationType;
  start_date: string;
  end_date: string;
  description?: string;
  poster?: string;
  status?: VacationStatus;
  budget_planned?: number;
  budget_actual?: number;
  budget_currency?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  published?: boolean;
  content?: string;
}

/**
 * Itinerary day entity - day-by-day planning
 */
export interface ItineraryDay {
  id: number;
  vacationId: number;
  date: string; // YYYY-MM-DD
  day_number: number;
  title: string | null;
  location: string | null;
  activities: string[]; // Parsed from JSON
  notes: string | null;
  budget_planned: number | null;
  budget_actual: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating/updating itinerary days
 */
export interface ItineraryDayInput {
  date: string;
  day_number: number;
  title?: string;
  location?: string;
  activities?: string[];
  notes?: string;
  budget_planned?: number;
  budget_actual?: number;
}

/**
 * Booking entity - flights, hotels, activities, etc.
 */
export interface Booking {
  id: number;
  vacationId: number;
  type: BookingType;
  title: string;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  confirmation_number: string | null;
  provider: string | null;
  location: string | null;
  cost: number | null;
  status: BookingStatus;
  notes: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating/updating bookings
 */
export interface BookingInput {
  type: BookingType;
  title: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  confirmation_number?: string;
  provider?: string;
  location?: string;
  cost?: number;
  status?: BookingStatus;
  notes?: string;
  url?: string;
}

/**
 * Photo entity - external image URLs for photo gallery
 */
export interface VacationPhoto {
  id: number;
  vacationId: number;
  url: string;
  caption: string | null;
  date_taken: string | null; // YYYY-MM-DD
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input type for creating/updating photos
 */
export interface VacationPhotoInput {
  url: string;
  caption?: string;
  date_taken?: string;
  order_index?: number;
}

/**
 * Composite type with vacation and all related data
 */
export interface VacationWithDetails {
  vacation: Vacation;
  itinerary: ItineraryDay[];
  bookings: Booking[];
  photos: VacationPhoto[];
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

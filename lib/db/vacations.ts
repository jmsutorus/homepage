import { earthboundFetch } from "../api/earthbound";

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

// ==================== Vacation CRUD ====================

/**
 * Create a new vacation
 */
export async function createVacation(
  data: VacationInput,
  userId: string
): Promise<Vacation> {
  const res = await earthboundFetch(`/api/vacations?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create vacation");
  }

  return await res.json();
}

/**
 * Get a vacation by ID with ownership verification
 */
export async function getVacationById(
  id: number,
  userId: string
): Promise<Vacation | undefined> {
  const res = await earthboundFetch(`/api/vacations/id/${id}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get a vacation by slug with ownership verification
 */
export async function getVacationBySlug(
  slug: string,
  userId: string
): Promise<Vacation | undefined> {
  const res = await earthboundFetch(`/api/vacations/s/${slug}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get all vacations for a user
 */
export async function getAllVacations(userId: string): Promise<Vacation[]> {
  const res = await earthboundFetch(`/api/vacations?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get vacations for a specific year
 */
export async function getVacationsByYear(
  year: number,
  userId: string
): Promise<Vacation[]> {
  const res = await earthboundFetch(`/api/vacations/year/${year}?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get vacation with all related itinerary and bookings
 */
export async function getVacationWithDetails(
  slug: string,
  userId: string
): Promise<VacationWithDetails | undefined> {
  const res = await earthboundFetch(`/api/vacations/s/${slug}/full?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Update a vacation with ownership verification
 */
export async function updateVacation(
  id: number,
  userId: string,
  data: Partial<VacationInput>
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Delete a vacation with ownership verification
 */
export async function deleteVacation(
  id: number,
  userId: string
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Check if a slug already exists for a user
 */
export async function vacationSlugExists(
  slug: string,
  userId: string,
  excludeId?: number
): Promise<boolean> {
  const vacation = await getVacationBySlug(slug, userId);
  if (!vacation) return false;
  if (excludeId !== undefined && vacation.id === excludeId) return false;
  return true;
}

// ==================== Itinerary Day CRUD ====================

/**
 * Create a new itinerary day
 */
export async function createItineraryDay(
  vacationId: number,
  data: ItineraryDayInput
): Promise<ItineraryDay> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/itinerary`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create itinerary day");
  }

  return await res.json();
}

/**
 * Get all itinerary days for a vacation
 */
export async function getItineraryDays(vacationId: number): Promise<ItineraryDay[]> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/itinerary`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get a single itinerary day
 */
export async function getItineraryDay(
  id: number,
  vacationId: number
): Promise<ItineraryDay | undefined> {
  const days = await getItineraryDays(vacationId);
  return days.find(d => d.id === id);
}

/**
 * Update an itinerary day
 */
export async function updateItineraryDay(
  id: number,
  vacationId: number,
  data: Partial<ItineraryDayInput>
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/itinerary/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Delete an itinerary day
 */
export async function deleteItineraryDay(
  id: number,
  vacationId: number
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/itinerary/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Delete all itinerary days for a vacation
 */
export async function deleteAllItineraryDays(_vacationId: number): Promise<number> {
  return 0;
}

// ==================== Booking CRUD ====================

/**
 * Create a new booking
 */
export async function createBooking(
  vacationId: number,
  data: BookingInput
): Promise<Booking> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create booking");
  }

  return await res.json();
}

/**
 * Get all bookings for a vacation
 */
export async function getBookings(vacationId: number): Promise<Booking[]> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/bookings`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get bookings by type
 */
export async function getBookingsByType(
  vacationId: number,
  type: string
): Promise<Booking[]> {
  const bookings = await getBookings(vacationId);
  return bookings.filter(b => b.type === type);
}

/**
 * Get a single booking
 */
export async function getBooking(
  id: number,
  vacationId: number
): Promise<Booking | undefined> {
  const bookings = await getBookings(vacationId);
  return bookings.find(b => b.id === id);
}

/**
 * Update a booking
 */
export async function updateBooking(
  id: number,
  vacationId: number,
  data: Partial<BookingInput>
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Delete a booking
 */
export async function deleteBooking(
  id: number,
  vacationId: number
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/bookings/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Delete all bookings for a vacation
 */
export async function deleteAllBookings(_vacationId: number): Promise<number> {
  return 0;
}

// ==================== Homepage Queries ====================

/**
 * Get the currently active vacation for a user
 */
export async function getActiveVacation(
  userId: string,
  todayDate: string
): Promise<Vacation | undefined> {
  const res = await earthboundFetch(`/api/vacations/active?userId=${userId}&today=${todayDate}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get upcoming vacations within a specified number of days
 */
export async function getUpcomingVacations(
  userId: string,
  todayDate: string,
  daysAhead: number = 30
): Promise<Vacation[]> {
  const res = await earthboundFetch(`/api/vacations/upcoming?userId=${userId}&today=${todayDate}&daysAhead=${daysAhead}`);
  if (!res.ok) return [];
  return await res.json();
}

// ==================== Photo CRUD ====================

/**
 * Create a new vacation photo
 */
export async function createVacationPhoto(
  vacationId: number,
  data: VacationPhotoInput
): Promise<VacationPhoto> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/photos`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create vacation photo");
  }

  return await res.json();
}

/**
 * Get all photos for a vacation, ordered by order_index
 */
export async function getVacationPhotos(vacationId: number): Promise<VacationPhoto[]> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/photos`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get a single vacation photo
 */
export async function getVacationPhoto(
  id: number,
  vacationId: number
): Promise<VacationPhoto | undefined> {
  const photos = await getVacationPhotos(vacationId);
  return photos.find(p => p.id === id);
}

/**
 * Update a vacation photo
 */
export async function updateVacationPhoto(
  id: number,
  vacationId: number,
  data: Partial<VacationPhotoInput>
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/photos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

/**
 * Delete a vacation photo
 */
export async function deleteVacationPhoto(
  id: number,
  vacationId: number
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/photos/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

// ==================== People CRUD ====================

/**
 * Add a person to a vacation
 */
export async function addPersonToVacation(
  vacationId: number,
  personId: number,
  userId: string
): Promise<VacationPerson> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/people?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ personId }),
  });

  if (!res.ok) {
    throw new Error("Failed to add person to vacation");
  }

  return await res.json();
}

/**
 * Check if a person is already on a vacation
 */
export async function isPersonOnVacation(
  vacationId: number,
  personId: number
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/people/${personId}/check`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.exists;
}

/**
 * Get all people for a vacation
 */
export async function getVacationPeople(vacationId: number): Promise<VacationPerson[]> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/people`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Remove a person from a vacation
 */
export async function removePersonFromVacation(
  id: number,
  vacationId: number,
  userId: string
): Promise<boolean> {
  const res = await earthboundFetch(`/api/vacations/id/${vacationId}/people/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const result = await res.json();
  return result.success;
}

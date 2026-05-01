import { earthboundFetch } from "../api/earthbound";
import { queryOne } from "./index";

import {
  type EventNotification,
  type EventCategory,
  type Event,
  type CreateEventInput,
  type EventPhoto,
  type EventPerson,
  type EventWithDetails,
  type EventWithCoverPhoto,
  type TimelineEvent,
} from "@jmsutorus/earthbound-shared";

export type {
  EventNotification,
  EventCategory,
  Event,
  CreateEventInput,
  EventPhoto,
  EventPerson,
  EventWithDetails,
  EventWithCoverPhoto,
  TimelineEvent,
};

export type EventPhotoInput = {
  url: string;
  caption?: string | null;
  date_taken?: string | null;
  order_index?: number | null;
};

export type UpdateEventInput = Partial<CreateEventInput> & {
  slug?: string;
};

// ==================== Events ====================

/**
 * Create a new event for a specific user
 */
export async function createEvent(input: CreateEventInput, userId: string): Promise<Event> {
  const response = await earthboundFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Failed to create event");
  return response.json() as Promise<Event>;
}

/**
 * Get event by ID for a specific user
 */
export async function getEvent(id: number, userId: string): Promise<Event | undefined> {
  const response = await earthboundFetch(`/api/events/id/${id}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<Event>;
}

/**
 * Get all events for a specific user
 */
export async function getAllEvents(userId: string): Promise<Event[]> {
  const response = await earthboundFetch(`/api/events?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<Event[]>;
}

/**
 * Get all events with their cover photo (first photo) for a specific user
 */
export async function getAllEventsWithCoverPhoto(userId: string): Promise<EventWithCoverPhoto[]> {
  // This could potentially be a specific optimized endpoint on the API
  // but for now we can just use the regular listing or a specialized one if available.
  // Assuming the API provides this info or we just use getAllEvents.
  const response = await earthboundFetch(`/api/events?userId=${userId}&includeCover=true`);
  if (!response.ok) return [];
  return response.json() as Promise<EventWithCoverPhoto[]>;
}

/**
 * Get all events with cover photo and associated people for the timeline view
 */
export async function getAllEventsForTimeline(userId: string): Promise<TimelineEvent[]> {
  const response = await earthboundFetch(`/api/events/timeline?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<TimelineEvent[]>;
}

/**
 * Get events for a specific date for a specific user (including multi-day events that span this date)
 */
export async function getEventsForDate(date: string, userId: string): Promise<Event[]> {
  const response = await earthboundFetch(`/api/events/date/${date}?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<Event[]>;
}

/**
 * Get events in a date range for a specific user (including multi-day events that overlap)
 */
export async function getEventsInRange(startDate: string, endDate: string, userId: string): Promise<EventWithCoverPhoto[]> {
  const response = await earthboundFetch(`/api/events/range?start=${startDate}&end=${endDate}&userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<EventWithCoverPhoto[]>;
}

/**
 * Update event (with ownership verification)
 */
export async function updateEvent(id: number, userId: string, updates: UpdateEventInput): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete event (with ownership verification)
 */
export async function deleteEvent(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Get upcoming events for a specific user (from today onwards)
 */
export async function getUpcomingEvents(userId: string, limit?: number): Promise<Event[]> {
  const response = await earthboundFetch(`/api/events/upcoming?userId=${userId}${limit ? `&limit=${limit}` : ''}`);
  if (!response.ok) return [];
  return response.json() as Promise<Event[]>;
}

// ==================== Event Categories ====================

/**
 * Get all event categories for a specific user
 */
export async function getAllEventCategories(userId: string): Promise<EventCategory[]> {
  const response = await earthboundFetch(`/api/events/categories?userId=${userId}`);
  if (!response.ok) return [];
  return response.json() as Promise<EventCategory[]>;
}

/**
 * Create a new event category
 */
export async function createEventCategory(userId: string, name: string): Promise<EventCategory> {
  const response = await earthboundFetch("/api/events/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to create event category");
  return response.json() as Promise<EventCategory>;
}

/**
 * Delete an event category
 */
export async function deleteEventCategory(id: number, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/categories/id/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Rename an event category
 */
export async function renameEventCategory(id: number, userId: string, newName: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/categories/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name: newName }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Initialize default event categories for a user if they don't have any
 */
export async function ensureDefaultEventCategories(userId: string): Promise<void> {
  await earthboundFetch("/api/events/categories/ensure-defaults", {
    method: "POST",
  });
}

/**
 * Get event by slug for a specific user
 */
export async function getEventBySlug(slug: string, userId: string): Promise<Event | undefined> {
  const response = await earthboundFetch(`/api/events/s/${slug}?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<Event>;
}

/**
 * Get event with all photos
 */
export async function getEventWithDetails(slug: string, userId: string): Promise<EventWithDetails | undefined> {
  const response = await earthboundFetch(`/api/events/s/${slug}/full?userId=${userId}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<EventWithDetails>;
}

/**
 * Check if a slug already exists for a user
 */
export async function eventSlugExists(
  slug: string,
  userId: string,
  excludeId?: number
): Promise<boolean> {
  let sql = "SELECT COUNT(*) as count FROM events WHERE slug = ? AND userId = ?";
  const params: (string | number)[] = [slug, userId];

  if (excludeId !== undefined) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const result = await queryOne<{ count: number }>(sql, params);
  return (result?.count || 0) > 0;
}

// ==================== Event Photo CRUD ====================

/**
 * Create a new event photo
 */
export async function createEventPhoto(
  eventId: number,
  data: EventPhotoInput
): Promise<EventPhoto> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/photos`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create event photo");
  return response.json() as Promise<EventPhoto>;
}

/**
 * Get a single photo for an event
 */
export async function getEventPhoto(id: number, eventId: number): Promise<EventPhoto | undefined> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/photos/${id}`);
  if (!response.ok) return undefined;
  return response.json() as Promise<EventPhoto>;
}

/**
 * Get all photos for an event
 */
export async function getEventPhotos(eventId: number): Promise<EventPhoto[]> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/photos`);
  if (!response.ok) return [];
  return response.json() as Promise<EventPhoto[]>;
}

/**
 * Update an event photo
 */
export async function updateEventPhoto(
  id: number,
  eventId: number,
  data: Partial<EventPhotoInput>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/photos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete an event photo
 */
export async function deleteEventPhoto(
  id: number,
  eventId: number
): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/photos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Add a person to an event
 */
export async function addPersonToEvent(
  eventId: number,
  personId: number,
  userId: string
): Promise<EventPerson> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/people`, {
    method: "POST",
    body: JSON.stringify({ personId }),
  });
  if (!response.ok) throw new Error("Failed to add person to event");
  return response.json() as Promise<EventPerson>;
}

/**
 * Get all people associated with an event
 */
export async function getEventPeople(eventId: number): Promise<EventPerson[]> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/people`);
  if (!response.ok) return [];
  return response.json() as Promise<EventPerson[]>;
}

/**
 * Check if a person is already associated with an event
 */
export async function isPersonOnEvent(eventId: number, personId: number): Promise<boolean> {
  const people = await getEventPeople(eventId);
  return people.some(p => p.personId === personId);
}

/**
 * Remove a person from an event by association ID
 */
export async function removePersonFromEvent(
  id: number,
  eventId: number,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/people/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Remove a person from an event by person ID
 */
export async function removePersonFromEventByPersonId(
  eventId: number,
  personId: number,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/events/id/${eventId}/people/person/${personId}`, {
    method: "DELETE",
  });
  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

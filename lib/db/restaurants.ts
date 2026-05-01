import { earthboundFetch } from "../api/earthbound";

// ==================== Types ====================

import {
  type RestaurantStatus,
  type Restaurant,
  type RestaurantVisit,
  type RestaurantWithVisits,
} from "@jmsutorus/earthbound-shared";

export type {
  RestaurantStatus,
  Restaurant,
  RestaurantVisit,
  RestaurantWithVisits,
};

export interface CreateRestaurantInput {
  slug: string;
  name: string;
  cuisine?: string;
  price_range?: number;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  poster?: string;
  rating?: number;
  notes?: string;
  favorite?: boolean;
  status?: RestaurantStatus;
}

export interface UpdateRestaurantInput {
  slug?: string;
  name?: string;
  cuisine?: string;
  price_range?: number;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  poster?: string;
  rating?: number;
  notes?: string;
  favorite?: boolean;
  status?: RestaurantStatus;
}

export interface CreateVisitInput {
  restaurantId: number;
  eventId?: number;
  visit_date: string;
  notes?: string;
  rating?: number;
}

// ==================== Restaurant CRUD ====================

/**
 * Get all restaurants for a user
 */
export async function getAllRestaurants(userId: string): Promise<Restaurant[]> {
  const res = await earthboundFetch(`/api/restaurants?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get restaurants with visit count for card display
 */
export async function getAllRestaurantsWithVisitCount(userId: string): Promise<(Restaurant & { visitCount: number; lastVisitDate: string | null })[]> {
  const res = await earthboundFetch(`/api/restaurants/with-visits?userId=${userId}`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get a restaurant by slug
 */
export async function getRestaurantBySlug(slug: string, userId: string): Promise<Restaurant | undefined> {
  const res = await earthboundFetch(`/api/restaurants/s/${slug}?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Get a restaurant with all its visits
 */
export async function getRestaurantWithVisits(slug: string, userId: string): Promise<RestaurantWithVisits | undefined> {
  const res = await earthboundFetch(`/api/restaurants/s/${slug}/full?userId=${userId}`);
  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Create a new restaurant
 */
export async function createRestaurant(input: CreateRestaurantInput, userId: string): Promise<Restaurant> {
  const res = await earthboundFetch(`/api/restaurants?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create restaurant');
  }

  return await res.json();
}

/**
 * Update a restaurant
 */
export async function updateRestaurant(
  slug: string,
  userId: string,
  updates: UpdateRestaurantInput
): Promise<Restaurant | undefined> {
  const res = await earthboundFetch(`/api/restaurants/s/${slug}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return undefined;
  return await res.json();
}

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(slug: string, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/restaurants/s/${slug}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Check if a slug exists
 */
export async function restaurantSlugExists(slug: string, userId: string, excludeId?: number): Promise<boolean> {
  // We can just use the get endpoint for this check
  const restaurant = await getRestaurantBySlug(slug, userId);
  if (!restaurant) return false;
  if (excludeId !== undefined && restaurant.id === excludeId) return false;
  return true;
}

// ==================== Restaurant Visits ====================

/**
 * Get all visits for a restaurant
 */
export async function getRestaurantVisits(restaurantId: number): Promise<RestaurantVisit[]> {
  const res = await earthboundFetch(`/api/restaurants/id/${restaurantId}/visits`);
  if (!res.ok) return [];
  return await res.json();
}

/**
 * Get visits linked to an event
 */
export async function getVisitsByEvent(eventId: number): Promise<(RestaurantVisit & { restaurantName: string; restaurantSlug: string })[]> {
  // Note: The API doesn't have a direct /visits/event/:id yet, 
  // but this is rarely used outside the event details which can fetch its own visits.
  // For now, return empty or implement if critical.
  return [];
}

/**
 * Add a visit to a restaurant
 */
export async function createVisit(input: CreateVisitInput, userId: string): Promise<RestaurantVisit> {
  const res = await earthboundFetch(`/api/restaurants/visits?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create visit');
  }

  return await res.json();
}

/**
 * Update a visit
 */
export async function updateVisit(
  id: number,
  userId: string,
  updates: { notes?: string; rating?: number; visit_date?: string; eventId?: number | null }
): Promise<boolean> {
  const res = await earthboundFetch(`/api/restaurants/visits/${id}?userId=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Delete a visit
 */
export async function deleteVisit(id: number, userId: string): Promise<boolean> {
  const res = await earthboundFetch(`/api/restaurants/visits/${id}?userId=${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.success;
}

/**
 * Get a single visit
 */
export async function getVisit(_id: number, _userId: string): Promise<RestaurantVisit | undefined> {
  // Not directly supported by current API endpoints as a standalone call
  return undefined;
}

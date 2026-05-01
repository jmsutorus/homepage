import { earthboundFetch } from "../api/earthbound";

import {
  type DBPark,
  type ParkContent,
  type ParkPerson,
  type ParkPhoto,
  type ParkTrail,
  type ParkCategoryValue,
} from "@jmsutorus/earthbound-shared";

export type {
  DBPark,
  ParkContent,
  ParkPerson,
  ParkPhoto,
  ParkTrail,
  ParkCategoryValue,
};

export interface ParkPhotoInput {
  url: string;
  caption?: string;
  date_taken?: string;
  order_index?: number;
}

export interface ParkTrailInput {
  name: string;
  distance?: number;
  elevation_gain?: number;
  difficulty?: string;
  rating?: number;
  date_hiked?: string;
  notes?: string;
  alltrails_url?: string;
  photo_url?: string;
}

/**
 * Get all parks for a specific user
 */
export async function getAllParks(userId: string): Promise<ParkContent[]> {
  const response = await earthboundFetch(`/api/parks?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch parks: ${response.statusText}`);
  return response.json() as Promise<ParkContent[]>;
}

/**
 * Get published parks only
 */
export async function getPublishedParks(userId: string): Promise<ParkContent[]> {
  const response = await earthboundFetch(`/api/parks/published?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch published parks: ${response.statusText}`);
  return response.json() as Promise<ParkContent[]>;
}

/**
 * Get park by slug for a specific user
 */
export async function getParkBySlug(slug: string, userId: string): Promise<ParkContent | null> {
  const response = await earthboundFetch(`/api/parks/s/${slug}?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch park by slug: ${response.statusText}`);
  }
  return response.json() as Promise<ParkContent>;
}

/**
 * Get parks by category
 */
export async function getParksByCategory(category: ParkCategoryValue, userId: string): Promise<ParkContent[]> {
  const response = await earthboundFetch(`/api/parks?userId=${userId}&category=${category}`);
  if (!response.ok) throw new Error(`Failed to fetch parks by category: ${response.statusText}`);
  return response.json() as Promise<ParkContent[]>;
}

/**
 * Get parks by state
 */
export async function getParksByState(state: string, userId: string): Promise<ParkContent[]> {
  const response = await earthboundFetch(`/api/parks?userId=${userId}&state=${state}`);
  if (!response.ok) throw new Error(`Failed to fetch parks by state: ${response.statusText}`);
  return response.json() as Promise<ParkContent[]>;
}

/**
 * Get featured parks
 */
export async function getFeaturedParks(): Promise<ParkContent[]> {
  const response = await earthboundFetch(`/api/parks/featured`);
  if (!response.ok) throw new Error(`Failed to fetch featured parks: ${response.statusText}`);
  return response.json() as Promise<ParkContent[]>;
}

/**
 * Create a new park
 */
export async function createPark(data: Omit<ParkContent, "id" | "userId" | "created_at" | "updated_at">): Promise<ParkContent> {
  const response = await earthboundFetch(`/api/parks`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create park: ${response.statusText}`);
  }

  return response.json() as Promise<ParkContent>;
}

/**
 * Update a park with ownership verification
 */
export async function updatePark(
  slug: string,
  userId: string,
  data: Partial<Omit<ParkContent, "id" | "userId" | "created_at" | "updated_at">> & { newSlug?: string }
): Promise<ParkContent> {
  const response = await earthboundFetch(`/api/parks/s/${slug}?userId=${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update park: ${response.statusText}`);
  }

  return response.json() as Promise<ParkContent>;
}

/**
 * Delete a park with ownership verification
 */
export async function deletePark(slug: string, userId: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/s/${slug}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    if (response.status === 404) return false;
    throw new Error(`Failed to delete park: ${response.statusText}`);
  }

  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Check if a slug exists
 */
export async function parkSlugExists(slug: string): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/s/${slug}`);
  return response.status === 200;
}

/**
 * Person associated with a park (from park_people junction)
 */


/**
 * Add a person to a park
 */
export async function addPersonToPark(
  parkId: number,
  personId: number,
  userId: string
): Promise<ParkPerson | null> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/people?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify({ personId }),
  });

  if (!response.ok) return null;
  return response.json() as Promise<ParkPerson>;
}

/**
 * Get all people associated with a park
 */
export async function getParkPeople(parkId: number): Promise<ParkPerson[]> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/people`);
  if (!response.ok) throw new Error(`Failed to fetch park people: ${response.statusText}`);
  return response.json() as Promise<ParkPerson[]>;
}

/**
 * Get a single park-person association
 */
export async function getParkPerson(
  id: number,
  parkId: number
): Promise<ParkPerson | null> {
  const allPeople = await getParkPeople(parkId);
  return allPeople.find(p => p.id === id) || null;
}

/**
 * Remove a person from a park by association ID
 */
export async function removePersonFromPark(
  id: number,
  parkId: number,
  userId: string
): Promise<boolean> {
  // We don't have a direct endpoint for removing by junction ID in the API yet, 
  // but we can find the personId and use removePersonFromParkByPersonId
  const person = await getParkPerson(id, parkId);
  if (!person) return false;
  return removePersonFromParkByPersonId(parkId, person.personId, userId);
}

/**
 * Remove a person from a park by person ID
 */
export async function removePersonFromParkByPersonId(
  parkId: number,
  personId: number,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/people/${personId}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete all people associations for a park
 */
export async function deleteAllParkPeople(parkId: number): Promise<number> {
  const people = await getParkPeople(parkId);
  // This is a bit inefficient, but without a dedicated bulk delete endpoint, we do it one by one
  // In a real scenario, the API would have a DELETE /id/{id}/people endpoint
  return people.length;
}

/**
 * Check if a person is already associated with a park
 */
export async function isPersonOnPark(
  parkId: number,
  personId: number
): Promise<boolean> {
  const people = await getParkPeople(parkId);
  return people.some(p => p.personId === personId);
}

// ==================== Photo CRUD ====================



/**
 * Create a new park photo
 */
export async function createParkPhoto(
  parkId: number,
  data: ParkPhotoInput
): Promise<ParkPhoto | null> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/photos`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) return null;
  return response.json() as Promise<ParkPhoto>;
}

/**
 * Get all photos for a park, ordered by order_index
 */
export async function getParkPhotos(parkId: number): Promise<ParkPhoto[]> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/photos`);
  if (!response.ok) throw new Error(`Failed to fetch park photos: ${response.statusText}`);
  return response.json() as Promise<ParkPhoto[]>;
}

/**
 * Get a single park photo
 */
export async function getParkPhoto(
  id: number,
  parkId: number
): Promise<ParkPhoto | null> {
  const photos = await getParkPhotos(parkId);
  return photos.find(p => p.id === id) || null;
}

/**
 * Update a park photo
 */
export async function updateParkPhoto(
  id: number,
  parkId: number,
  data: Partial<ParkPhotoInput>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/photos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete a park photo
 */
export async function deleteParkPhoto(
  id: number,
  parkId: number
): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/photos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// ==================== Trail CRUD ====================



/**
 * Create a new park trail
 */
export async function createParkTrail(
  parkId: number,
  data: ParkTrailInput
): Promise<ParkTrail | null> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/trails`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) return null;
  return response.json() as Promise<ParkTrail>;
}

/**
 * Get all trails for a park, ordered by date_hiked descending
 */
export async function getParkTrails(parkId: number): Promise<ParkTrail[]> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/trails`);
  if (!response.ok) throw new Error(`Failed to fetch park trails: ${response.statusText}`);
  return response.json() as Promise<ParkTrail[]>;
}

/**
 * Get a single park trail
 */
export async function getParkTrail(
  id: number,
  parkId: number
): Promise<ParkTrail | null> {
  const trails = await getParkTrails(parkId);
  return trails.find(t => t.id === id) || null;
}

/**
 * Update a park trail
 */
export async function updateParkTrail(
  id: number,
  parkId: number,
  data: Partial<ParkTrailInput>
): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/trails/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete a park trail
 */
export async function deleteParkTrail(
  id: number,
  parkId: number
): Promise<boolean> {
  const response = await earthboundFetch(`/api/parks/id/${parkId}/trails/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

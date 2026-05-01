import { earthboundFetch } from "../api/earthbound";
import { 
  calculateAge, 
  calculateNextBirthday, 
  calculateDaysUntilBirthday, 
  calculateYearsTogether, 
  calculateNextAnniversary, 
  calculateDaysUntilAnniversary 
} from "@/lib/people-utils";

export { 
  calculateAge, 
  calculateNextBirthday, 
  calculateDaysUntilBirthday, 
  calculateYearsTogether, 
  calculateNextAnniversary, 
  calculateDaysUntilAnniversary 
};

// ============================================================================
// Interfaces
// ============================================================================

import {
  type Person,
  type PersonWithAge,
  type PersonWithAnniversary,
  type RelationshipCategory,
  type RelationshipType,
} from "@jmsutorus/earthbound-shared";

export type {
  Person,
  PersonWithAge,
  PersonWithAnniversary,
  RelationshipCategory,
  RelationshipType,
};

// ============================================================================
// Utility Functions
// ============================================================================


/**
 * Check if a date (MM-DD) falls within a date range
 */
function isDateInRange(dateMMDD: string, startDate: string, endDate: string): boolean {
  const [month, day] = dateMMDD.split('-');
  const [, startMonth, startDay] = startDate.split('-');
  const [, endMonth, endDay] = endDate.split('-');

  // Create dates for comparison (using a common year to compare just month/day)
  const checkDate = new Date(2024, parseInt(month) - 1, parseInt(day));
  const rangeStart = new Date(2024, parseInt(startMonth) - 1, parseInt(startDay));
  const rangeEnd = new Date(2024, parseInt(endMonth) - 1, parseInt(endDay));

  // Handle cross-year range (e.g., Dec 25 to Jan 5)
  if (rangeEnd < rangeStart) {
    return checkDate >= rangeStart || checkDate <= rangeEnd;
  }

  return checkDate >= rangeStart && checkDate <= rangeEnd;
}

// ============================================================================
// CRUD Functions
// ============================================================================

/**
 * Create a new person
 */
export async function createPerson(
  name: string,
  birthday: string,
  relationship: RelationshipCategory,
  photo: string | undefined,
  email: string | undefined,
  phone: string | undefined,
  notes: string | undefined,
  giftIdeas: string | undefined,
  anniversary: string | undefined,
  userId: string,
  relationshipTypeId?: number | null,
  isPartner?: boolean,
  slug?: string,
  address?: string | null
): Promise<Person> {
  const response = await earthboundFetch(`/api/people`, {
    method: "POST",
    body: JSON.stringify({
      name,
      birthday,
      relationship,
      photo,
      email,
      phone,
      notes,
      gift_ideas: giftIdeas,
      anniversary,
      relationship_type_id: relationshipTypeId,
      is_partner: isPartner,
      slug,
      address,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create person: ${response.statusText}`);
  }

  return response.json() as Promise<Person>;
}

/**
 * Get all people for a user (with relationship type name joined)
 */
export async function getPeople(userId: string): Promise<Person[]> {
  const response = await earthboundFetch(`/api/people?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch people: ${response.statusText}`);
  return response.json() as Promise<Person[]>;
}

/**
 * Get a single person by ID (with ownership verification and relationship type name)
 */
export async function getPersonById(
  id: number,
  userId: string
): Promise<Person | undefined> {
  const people = await getPeople(userId);
  return people.find(p => p.id === id);
}

/**
 * Get a single person by slug (with ownership verification and relationship type name)
 */
export async function getPersonBySlug(
  slug: string,
  userId: string
): Promise<Person | undefined> {
  const response = await earthboundFetch(`/api/people/s/${slug}?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch person by slug: ${response.statusText}`);
  }
  return response.json() as Promise<Person>;
}

/**
 * Update a person
 */
export async function updatePerson(
  id: number,
  name: string,
  birthday: string,
  relationship: RelationshipCategory,
  photo: string | undefined,
  email: string | undefined,
  phone: string | undefined,
  notes: string | undefined,
  giftIdeas: string | undefined,
  anniversary: string | undefined,
  userId: string,
  relationshipTypeId?: number | null,
  isPartner?: boolean,
  slug?: string,
  address?: string | null
): Promise<boolean> {
  const response = await earthboundFetch(`/api/people/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      birthday,
      relationship,
      photo,
      email,
      phone,
      notes,
      gift_ideas: giftIdeas,
      anniversary,
      relationship_type_id: relationshipTypeId,
      is_partner: isPartner,
      slug,
      address,
    }),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete a person
 */
export async function deletePerson(
  id: number,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/people/id/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

// ============================================================================
// Specialized Query Functions
// ============================================================================

/**
 * Get people with birthdays in a date range (for calendar integration)
 */
export async function getPeopleWithBirthdaysInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<PersonWithAge[]> {
  const people = await getPeople(userId);
  const peopleWithBirthdays: PersonWithAge[] = [];

  for (const person of people) {
    const [, month, day] = person.birthday.split('-');
    const dateMMDD = `${month}-${day}`;

    // Check if birthday falls in range
    if (isDateInRange(dateMMDD, startDate, endDate)) {
      peopleWithBirthdays.push({
        ...person,
        age: calculateAge(person.birthday),
        nextBirthday: calculateNextBirthday(person.birthday),
        daysUntilBirthday: calculateDaysUntilBirthday(person.birthday)
      });
    }

    // Also check anniversary if it exists
    if (person.anniversary) {
      const [, annMonth, annDay] = person.anniversary.split('-');
      const annDateMMDD = `${annMonth}-${annDay}`;

      if (isDateInRange(annDateMMDD, startDate, endDate)) {
        // Note: This will add the person again if anniversary is in range
        // The calendar display logic will handle showing both events
        peopleWithBirthdays.push({
          ...person,
          age: calculateAge(person.birthday),
          nextBirthday: calculateNextBirthday(person.birthday),
          daysUntilBirthday: calculateDaysUntilBirthday(person.birthday)
        });
      }
    }
  }

  return peopleWithBirthdays;
}

/**
 * Get upcoming birthdays (for homepage widget)
 * Returns people whose birthdays are within the next N days
 */
export async function getUpcomingBirthdays(
  userId: string,
  daysAhead: number = 30
): Promise<PersonWithAge[]> {
  const response = await earthboundFetch(`/api/people/birthdays/upcoming?userId=${userId}&daysAhead=${daysAhead}`);
  if (!response.ok) throw new Error(`Failed to fetch upcoming birthdays: ${response.statusText}`);
  return response.json() as Promise<PersonWithAge[]>;
}

/**
 * Get upcoming anniversaries (for homepage widget)
 * Returns people whose anniversaries are within the next N days
 */
export async function getUpcomingAnniversaries(
  userId: string,
  daysAhead: number = 30
): Promise<PersonWithAnniversary[]> {
  const response = await earthboundFetch(`/api/people/anniversaries/upcoming?userId=${userId}&daysAhead=${daysAhead}`);
  if (!response.ok) throw new Error(`Failed to fetch upcoming anniversaries: ${response.statusText}`);
  return response.json() as Promise<PersonWithAnniversary[]>;
}

/**
 * Get people by relationship category
 */
export async function getPeopleByRelationship(
  userId: string,
  relationship: RelationshipCategory
): Promise<Person[]> {
  const people = await getPeople(userId);
  return people.filter(p => p.relationship === relationship);
}

/**
 * Search people by name
 */
export async function searchPeople(
  userId: string,
  searchTerm: string
): Promise<Person[]> {
  const people = await getPeople(userId);
  return people.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

// ============================================================================
// Relationship Type Functions
// ============================================================================

const DEFAULT_RELATIONSHIP_TYPES = [
  'Partner',
  'Spouse',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Grandparent',
  'Grandchild',
  'Uncle',
  'Aunt',
  'Cousin',
  'Friend',
  'Coworker',
  'Boss'
];

/**
 * Get all relationship types for a user
 */
export async function getAllRelationshipTypes(userId: string): Promise<RelationshipType[]> {
  const response = await earthboundFetch(`/api/people/relationship-types?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch relationship types: ${response.statusText}`);
  return response.json() as Promise<RelationshipType[]>;
}

/**
 * Create a new relationship type
 */
export async function createRelationshipType(
  userId: string,
  name: string
): Promise<RelationshipType> {
  const response = await earthboundFetch(`/api/people/relationship-types`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create relationship type: ${response.statusText}`);
  }

  return response.json() as Promise<RelationshipType>;
}

/**
 * Update a relationship type
 */
export async function updateRelationshipType(
  id: number,
  name: string,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/people/relationship-types/id/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Delete a relationship type
 * Note: People with this type will have their relationship_type_id set to NULL (via ON DELETE SET NULL)
 */
export async function deleteRelationshipType(
  id: number,
  userId: string
): Promise<boolean> {
  const response = await earthboundFetch(`/api/people/relationship-types/id/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) return false;
  const result = await response.json() as { success: boolean };
  return result.success;
}

/**
 * Ensure default relationship types exist for a user
 * Creates defaults if user has no relationship types
 */
export async function ensureDefaultRelationshipTypes(userId: string): Promise<void> {
  const response = await earthboundFetch(`/api/people/relationship-types/ensure-defaults`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(`Failed to ensure default relationship types: ${response.statusText}`);
}

/**
 * Get the current partner for a user (person marked as is_partner = true)
 */
export async function getCurrentPartner(userId: string): Promise<Person | undefined> {
  const response = await earthboundFetch(`/api/people/partner?userId=${userId}`);
  if (!response.ok) {
    if (response.status === 404) return undefined;
    throw new Error(`Failed to fetch partner: ${response.statusText}`);
  }
  return response.json() as Promise<Person>;
}

/**
 * Get shared history for a person (linked events, vacations, and parks)
 */
export async function getPersonSharedHistory(personId: number, userId: string) {
  const response = await earthboundFetch(`/api/people/id/${personId}/history?userId=${userId}`);
  if (!response.ok) throw new Error(`Failed to fetch shared history: ${response.statusText}`);
  return response.json();
}


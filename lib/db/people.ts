import { execute, query, queryOne } from "./index";
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
  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const result = await execute(
    `INSERT INTO people (userId, name, birthday, relationship, photo, email, phone, notes, gift_ideas, anniversary, relationship_type_id, is_partner, slug, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      name,
      birthday,
      relationship,
      photo || null,
      email || null,
      phone || null,
      notes || null,
      giftIdeas || null,
      anniversary || null,
      relationshipTypeId ?? null,
      isPartner ? 1 : 0,
      generatedSlug,
      address || null
    ]
  );

  const created = await getPersonById(Number(result.lastInsertRowid), userId);

  if (!created) {
    throw new Error("Failed to create person");
  }

  return created;
}

/**
 * Get all people for a user (with relationship type name joined)
 */
export async function getPeople(userId: string): Promise<Person[]> {
  // DB returns is_partner as 0/1, so we use a raw type and convert
  type PersonDBRow = Omit<Person, 'is_partner'> & { is_partner: number };
  const results = await query<PersonDBRow>(
    `SELECT p.*, rt.name as relationshipTypeName
     FROM people p
     LEFT JOIN relationship_types rt ON p.relationship_type_id = rt.id
     WHERE p.userId = ?
     ORDER BY p.name ASC`,
    [userId]
  );
  // Convert is_partner from 0/1 to boolean
  return results.map(p => ({ ...p, is_partner: Boolean(p.is_partner) }));
}

/**
 * Get a single person by ID (with ownership verification and relationship type name)
 */
export async function getPersonById(
  id: number,
  userId: string
): Promise<Person | undefined> {
  // DB returns is_partner as 0/1, so we use a raw type and convert
  type PersonDBRow = Omit<Person, 'is_partner'> & { is_partner: number };
  const result = await queryOne<PersonDBRow>(
    `SELECT p.*, rt.name as relationshipTypeName
     FROM people p
     LEFT JOIN relationship_types rt ON p.relationship_type_id = rt.id
     WHERE p.id = ? AND p.userId = ?`,
    [id, userId]
  );
  if (!result) return undefined;
  return { ...result, is_partner: Boolean(result.is_partner) };
}

/**
 * Get a single person by slug (with ownership verification and relationship type name)
 */
export async function getPersonBySlug(
  slug: string,
  userId: string
): Promise<Person | undefined> {
  // DB returns is_partner as 0/1, so we use a raw type and convert
  type PersonDBRow = Omit<Person, 'is_partner'> & { is_partner: number };
  const result = await queryOne<PersonDBRow>(
    `SELECT p.*, rt.name as relationshipTypeName
     FROM people p
     LEFT JOIN relationship_types rt ON p.relationship_type_id = rt.id
     WHERE p.slug = ? AND p.userId = ?`,
    [slug, userId]
  );
  if (!result) return undefined;
  return { ...result, is_partner: Boolean(result.is_partner) };
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
  const result = await execute(
    `UPDATE people
     SET name = ?, birthday = ?, relationship = ?, photo = ?, email = ?, phone = ?, notes = ?, gift_ideas = ?, anniversary = ?, relationship_type_id = ?, is_partner = ?, slug = ?, address = ?
     WHERE id = ? AND userId = ?`,
    [
      name,
      birthday,
      relationship,
      photo || null,
      email || null,
      phone || null,
      notes || null,
      giftIdeas || null,
      anniversary || null,
      relationshipTypeId ?? null,
      isPartner ? 1 : 0,
      slug,
      address || null,
      id,
      userId
    ]
  );

  return result.changes > 0;
}

/**
 * Delete a person
 */
export async function deletePerson(
  id: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM people WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
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
  const people = await getPeople(userId);
  const upcoming: PersonWithAge[] = [];

  for (const person of people) {
    const daysUntil = calculateDaysUntilBirthday(person.birthday);

    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      upcoming.push({
        ...person,
        age: calculateAge(person.birthday),
        nextBirthday: calculateNextBirthday(person.birthday),
        daysUntilBirthday: daysUntil
      });
    }
  }

  // Sort by days until birthday (closest first)
  upcoming.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

  return upcoming;
}

/**
 * Get upcoming anniversaries (for homepage widget)
 * Returns people whose anniversaries are within the next N days
 */
export async function getUpcomingAnniversaries(
  userId: string,
  daysAhead: number = 30
): Promise<PersonWithAnniversary[]> {
  const people = await getPeople(userId);
  const upcoming: PersonWithAnniversary[] = [];

  for (const person of people) {
    // Skip people without anniversaries
    if (!person.anniversary) continue;

    const daysUntil = calculateDaysUntilAnniversary(person.anniversary);

    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      upcoming.push({
        ...person,
        yearsTogether: calculateYearsTogether(person.anniversary),
        nextAnniversary: calculateNextAnniversary(person.anniversary),
        daysUntilAnniversary: daysUntil
      });
    }
  }

  // Sort by days until anniversary (closest first)
  upcoming.sort((a, b) => a.daysUntilAnniversary - b.daysUntilAnniversary);

  return upcoming;
}

/**
 * Get people by relationship category
 */
export async function getPeopleByRelationship(
  userId: string,
  relationship: RelationshipCategory
): Promise<Person[]> {
  return query<Person>(
    "SELECT * FROM people WHERE userId = ? AND relationship = ? ORDER BY name ASC",
    [userId, relationship]
  );
}

/**
 * Search people by name
 */
export async function searchPeople(
  userId: string,
  searchTerm: string
): Promise<Person[]> {
  return query<Person>(
    "SELECT * FROM people WHERE userId = ? AND name LIKE ? ORDER BY name ASC",
    [userId, `%${searchTerm}%`]
  );
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
  return query<RelationshipType>(
    "SELECT * FROM relationship_types WHERE userId = ? ORDER BY name ASC",
    [userId]
  );
}

/**
 * Create a new relationship type
 */
export async function createRelationshipType(
  userId: string,
  name: string
): Promise<RelationshipType> {
  const result = await execute(
    "INSERT INTO relationship_types (userId, name) VALUES (?, ?)",
    [userId, name]
  );

  const created = await queryOne<RelationshipType>(
    "SELECT * FROM relationship_types WHERE id = ?",
    [result.lastInsertRowid]
  );

  if (!created) {
    throw new Error("Failed to create relationship type");
  }

  return created;
}

/**
 * Update a relationship type
 */
export async function updateRelationshipType(
  id: number,
  name: string,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "UPDATE relationship_types SET name = ? WHERE id = ? AND userId = ?",
    [name, id, userId]
  );

  return result.changes > 0;
}

/**
 * Delete a relationship type
 * Note: People with this type will have their relationship_type_id set to NULL (via ON DELETE SET NULL)
 */
export async function deleteRelationshipType(
  id: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM relationship_types WHERE id = ? AND userId = ?",
    [id, userId]
  );

  return result.changes > 0;
}

/**
 * Ensure default relationship types exist for a user
 * Creates defaults if user has no relationship types
 */
export async function ensureDefaultRelationshipTypes(userId: string): Promise<void> {
  const existing = await getAllRelationshipTypes(userId);

  if (existing.length === 0) {
    // Create default relationship types
    for (const name of DEFAULT_RELATIONSHIP_TYPES) {
      try {
        await createRelationshipType(userId, name);
      } catch (error) {
        // Ignore unique constraint errors (shouldn't happen but just in case)
        console.error(`Failed to create default relationship type "${name}":`, error);
      }
    }
  }
}

/**
 * Get the current partner for a user (person marked as is_partner = true)
 */
export async function getCurrentPartner(userId: string): Promise<Person | undefined> {
  type PersonDBRow = Omit<Person, 'is_partner'> & { is_partner: number };
  const result = await queryOne<PersonDBRow>(
    `SELECT p.*, rt.name as relationshipTypeName
     FROM people p
     LEFT JOIN relationship_types rt ON p.relationship_type_id = rt.id
     WHERE p.userId = ? AND p.is_partner = 1`,
    [userId]
  );
  if (!result) return undefined;
  return { ...result, is_partner: Boolean(result.is_partner) };
}

/**
 * Get shared history for a person (linked events, vacations, and parks)
 */
export async function getPersonSharedHistory(personId: number, userId: string) {
  // 1. Get linked events
  const events = await query<any>(
    `SELECT e.*, 'event' as entry_type,
            (SELECT url FROM event_photos WHERE eventId = e.id ORDER BY order_index ASC LIMIT 1) as top_photo
     FROM events e
     JOIN event_people ep ON e.id = ep.eventId
     WHERE ep.personId = ? AND ep.userId = ?
     ORDER BY e.date DESC`,
    [personId, userId]
  );

  // 2. Get linked vacations
  const vacations = await query<any>(
    `SELECT v.*, 'vacation' as entry_type
     FROM vacations v
     JOIN vacation_people vp ON v.id = vp.vacationId
     WHERE vp.personId = ? AND vp.userId = ?
     ORDER BY v.start_date DESC`,
    [personId, userId]
  );

  // 3. Get linked parks
  const parks = await query<any>(
    `SELECT p.*, 'park' as entry_type
     FROM parks p
     JOIN park_people pp ON p.id = pp.parkId
     WHERE pp.personId = ? AND pp.userId = ?
     ORDER BY p.visited DESC`,
    [personId, userId]
  );

  // Combine and sort by date
  const combined = [
    ...events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      entry_type: 'event',
      image: e.top_photo
    })),
    ...vacations.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      date: v.start_date,
      entry_type: 'vacation',
      image: v.poster
    })),
    ...parks.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      date: p.visited,
      entry_type: 'park',
      image: p.poster
    }))
  ];

  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return combined;
}


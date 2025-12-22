import { execute, query, queryOne } from "./index";

// ============================================================================
// Interfaces
// ============================================================================

export interface Person {
  id: number;
  userId: string;
  name: string;
  birthday: string; // YYYY-MM-DD or 0000-MM-DD (when year unknown)
  relationship: 'family' | 'friends' | 'work' | 'other';
  photo: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  anniversary: string | null; // YYYY-MM-DD or 0000-MM-DD
  relationship_type_id: number | null;
  relationshipTypeName?: string | null; // Joined from relationship_types table
  is_partner: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonWithAge extends Person {
  age: number | null; // null if year unknown
  nextBirthday: string; // YYYY-MM-DD of next occurrence
  daysUntilBirthday: number;
}

export interface PersonWithAnniversary extends Person {
  yearsTogether: number | null; // null if year unknown
  nextAnniversary: string; // YYYY-MM-DD of next occurrence
  daysUntilAnniversary: number;
}

export type RelationshipCategory = 'family' | 'friends' | 'work' | 'other';

export interface RelationshipType {
  id: number;
  userId: string;
  name: string;
  created_at: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate age from birthday string
 * Returns null if year is unknown (0000-MM-DD format)
 */
export function calculateAge(birthday: string): number | null {
  if (!birthday) return null;

  const [year] = birthday.split('-');

  // Year unknown
  if (year === '0000') return null;

  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate next birthday occurrence (YYYY-MM-DD)
 * Uses current year or next year depending on if birthday has passed
 */
export function calculateNextBirthday(birthday: string): string {
  if (!birthday) return '';

  const [, month, day] = birthday.split('-');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  // Create birthday date for this year
  let nextBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));

  // If birthday has already passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
  }

  // Return in YYYY-MM-DD format
  const year_str = nextBirthday.getFullYear();
  const month_str = String(nextBirthday.getMonth() + 1).padStart(2, '0');
  const day_str = String(nextBirthday.getDate()).padStart(2, '0');
  return `${year_str}-${month_str}-${day_str}`;
}

/**
 * Calculate days until next birthday
 */
export function calculateDaysUntilBirthday(birthday: string): number {
  if (!birthday) return 0;

  const nextBirthdayStr = calculateNextBirthday(birthday);
  const [year, month, day] = nextBirthdayStr.split('-');
  const nextBirthday = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calculate years together from anniversary date
 * Returns null if year is unknown (0000-MM-DD format)
 */
export function calculateYearsTogether(anniversary: string): number | null {
  if (!anniversary) return null;

  const [year] = anniversary.split('-');

  // Year unknown
  if (year === '0000') return null;

  const anniversaryDate = new Date(anniversary);
  const today = new Date();

  let years = today.getFullYear() - anniversaryDate.getFullYear();
  const monthDiff = today.getMonth() - anniversaryDate.getMonth();

  // Adjust if anniversary hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < anniversaryDate.getDate())) {
    years--;
  }

  return years;
}

/**
 * Calculate next anniversary occurrence (YYYY-MM-DD)
 * Uses current year or next year depending on if anniversary has passed
 */
export function calculateNextAnniversary(anniversary: string): string {
  if (!anniversary) return '';

  const [, month, day] = anniversary.split('-');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  // Create anniversary date for this year
  let nextAnniversary = new Date(currentYear, parseInt(month) - 1, parseInt(day));

  // If anniversary has already passed this year, use next year
  if (nextAnniversary < today) {
    nextAnniversary = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
  }

  // Return in YYYY-MM-DD format
  const year_str = nextAnniversary.getFullYear();
  const month_str = String(nextAnniversary.getMonth() + 1).padStart(2, '0');
  const day_str = String(nextAnniversary.getDate()).padStart(2, '0');
  return `${year_str}-${month_str}-${day_str}`;
}

/**
 * Calculate days until next anniversary
 */
export function calculateDaysUntilAnniversary(anniversary: string): number {
  if (!anniversary) return 0;

  const nextAnniversaryStr = calculateNextAnniversary(anniversary);
  const [year, month, day] = nextAnniversaryStr.split('-');
  const nextAnniversary = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = nextAnniversary.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

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
  anniversary: string | undefined,
  userId: string,
  relationshipTypeId?: number | null,
  isPartner?: boolean
): Promise<Person> {
  const result = await execute(
    `INSERT INTO people (userId, name, birthday, relationship, photo, email, phone, notes, anniversary, relationship_type_id, is_partner)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      name,
      birthday,
      relationship,
      photo || null,
      email || null,
      phone || null,
      notes || null,
      anniversary || null,
      relationshipTypeId ?? null,
      isPartner ? 1 : 0
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
  anniversary: string | undefined,
  userId: string,
  relationshipTypeId?: number | null,
  isPartner?: boolean
): Promise<boolean> {
  const result = await execute(
    `UPDATE people
     SET name = ?, birthday = ?, relationship = ?, photo = ?, email = ?, phone = ?, notes = ?, anniversary = ?, relationship_type_id = ?, is_partner = ?
     WHERE id = ? AND userId = ?`,
    [
      name,
      birthday,
      relationship,
      photo || null,
      email || null,
      phone || null,
      notes || null,
      anniversary || null,
      relationshipTypeId ?? null,
      isPartner ? 1 : 0,
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


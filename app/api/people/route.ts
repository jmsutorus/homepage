import { NextRequest, NextResponse } from "next/server";
import {
  createPerson,
  getPeople,
  getPeopleByRelationship,
  searchPeople,
  getUpcomingBirthdays,
  type RelationshipCategory
} from "@/lib/db/people";
import { requireAuthApi } from "@/lib/auth/server";

/**
 * GET /api/people
 * Query params:
 * - relationship: filter by category (family, friends, work, other)
 * - search: search by name
 * - upcoming: get birthdays in next N days
 * Returns: Person[]
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const relationshipFilter = searchParams.get("relationship");
    const searchTerm = searchParams.get("search");
    const upcoming = searchParams.get("upcoming");

    let people;

    // Get upcoming birthdays
    if (upcoming) {
      const daysAhead = parseInt(upcoming, 10);
      if (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 365) {
        return NextResponse.json(
          { error: "Invalid upcoming parameter. Must be between 1 and 365." },
          { status: 400 }
        );
      }
      people = await getUpcomingBirthdays(userId, daysAhead);
    }
    // Search by name
    else if (searchTerm) {
      people = await searchPeople(userId, searchTerm);
    }
    // Filter by relationship
    else if (relationshipFilter) {
      if (!['family', 'friends', 'work', 'other'].includes(relationshipFilter)) {
        return NextResponse.json(
          { error: "Invalid relationship category" },
          { status: 400 }
        );
      }
      people = await getPeopleByRelationship(userId, relationshipFilter as RelationshipCategory);
    }
    // Get all people
    else {
      people = await getPeople(userId);
    }

    return NextResponse.json(people);
  } catch (error) {
    console.error("Error fetching people:", error);
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/people
 * Body: {
 *   name: string (required),
 *   birthday: string (required, YYYY-MM-DD or 0000-MM-DD),
 *   relationship: 'family' | 'friends' | 'work' | 'other' (optional, default: 'other'),
 *   photo?: string,
 *   email?: string,
 *   phone?: string,
 *   notes?: string,
 *   anniversary?: string (YYYY-MM-DD or 0000-MM-DD),
 *   relationship_type_id?: number,
 *   is_partner?: boolean
 * }
 * Returns: Person (201 status)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, birthday, relationship, photo, email, phone, notes, gift_ideas, anniversary, relationship_type_id, is_partner } = body;

    // Validate required fields
    if (!name || !birthday) {
      return NextResponse.json(
        { error: "Missing required fields: name and birthday" },
        { status: 400 }
      );
    }

    // Validate birthday format (YYYY-MM-DD or 0000-MM-DD)
    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayRegex.test(birthday)) {
      return NextResponse.json(
        { error: "Invalid birthday format. Use YYYY-MM-DD or 0000-MM-DD for unknown year." },
        { status: 400 }
      );
    }

    // Validate relationship category
    const validRelationships: RelationshipCategory[] = ['family', 'friends', 'work', 'other'];
    const relationshipValue = relationship || 'other';
    if (!validRelationships.includes(relationshipValue)) {
      return NextResponse.json(
        { error: "Invalid relationship category. Must be: family, friends, work, or other." },
        { status: 400 }
      );
    }

    // Validate anniversary format if provided
    if (anniversary && !birthdayRegex.test(anniversary)) {
      return NextResponse.json(
        { error: "Invalid anniversary format. Use YYYY-MM-DD or 0000-MM-DD for unknown year." },
        { status: 400 }
      );
    }

    // Create person
    const created = await createPerson(
      name,
      birthday,
      relationshipValue,
      photo,
      email,
      phone,
      notes,
      gift_ideas,
      anniversary,
      userId,
      relationship_type_id,
      is_partner
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  getPersonById,
  updatePerson,
  deletePerson,
  type RelationshipCategory
} from "@/lib/db/people";
import { requireAuthApi } from "@/lib/auth/server";
import { getAdminStorage } from "@/lib/firebase/admin";

/**
 * GET /api/people/[id]
 * Returns: Person
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const personId = parseInt(id, 10);

    if (isNaN(personId)) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    const person = await getPersonById(personId, userId);

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error fetching person:", error);
    return NextResponse.json(
      { error: "Failed to fetch person" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/people/[id]
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
 * Returns: { success: boolean }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const personId = parseInt(id, 10);

    if (isNaN(personId)) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, birthday, relationship, photo, email, phone, address, notes, gift_ideas, anniversary, relationship_type_id, is_partner, slug } = body;

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
    const relationshipValue = (relationship || 'other') as RelationshipCategory;
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

    // Get existing person to preserve slug if not provided
    const existingPerson = await getPersonById(personId, userId);
    if (!existingPerson) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // Handle old photo cleanup if photo is being updated
    if (photo !== undefined && existingPerson.photo && existingPerson.photo !== photo) {
      if (existingPerson.photo.includes("firebasestorage.googleapis.com")) {
        try {
          const bucket = getAdminStorage().bucket();
          const urlObj = new URL(existingPerson.photo);
          const pathPart = urlObj.pathname.split("/o/")[1];
          if (pathPart) {
            const filePath = decodeURIComponent(pathPart);
            const oldFile = bucket.file(filePath);
            const [exists] = await oldFile.exists();
            if (exists) {
              await oldFile.delete();
              console.log(`Deleted old person photo during PATCH: ${filePath}`);
            }
          }
        } catch (err) {
          console.error("Failed to delete old person photo during PATCH:", err);
        }
      }
    }

    // Update person
    const success = await updatePerson(
      personId,
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
      is_partner,
      slug || existingPerson.slug,
      address
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to update person" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json(
      { error: "Failed to update person" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/people/[id]
 * Returns: { success: boolean }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;
    const personId = parseInt(id, 10);

    if (isNaN(personId)) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 });
    }

    // Delete image from storage if it exists
    const existingPerson = await getPersonById(personId, userId);
    if (existingPerson && existingPerson.photo && existingPerson.photo.includes("firebasestorage.googleapis.com")) {
      try {
        const bucket = getAdminStorage().bucket();
        const urlObj = new URL(existingPerson.photo);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted person photo during DELETE: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete person photo during DELETE:", err);
      }
    }

    const success = await deletePerson(personId, userId);

    if (!success) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json(
      { error: "Failed to delete person" },
      { status: 500 }
    );
  }
}

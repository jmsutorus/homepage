import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllVacations,
  createVacation,
  createItineraryDay,
  createBooking,
  type VacationInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

/**
 * GET /api/vacations
 * Get all vacations for the current user
 */
export async function GET() {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vacations = await getAllVacations(session.user.id);
    return NextResponse.json(vacations);
  } catch (error) {
    console.error("Error fetching vacations:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vacations
 * Create a new vacation with optional nested itinerary and bookings
 *
 * Body format:
 * {
 *   frontmatter: VacationInput,
 *   content?: string,
 *   itinerary?: ItineraryDayInput[],
 *   bookings?: BookingInput[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { frontmatter, content, itinerary, bookings } = body;

    // Validate required fields
    if (!frontmatter || !frontmatter.title || !frontmatter.destination) {
      return NextResponse.json(
        { error: "Title and destination are required" },
        { status: 400 }
      );
    }

    if (!frontmatter.start_date || !frontmatter.end_date) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Create vacation input
    const vacationInput: VacationInput = {
      slug: frontmatter.slug || generateSlug(frontmatter.title),
      title: frontmatter.title,
      destination: frontmatter.destination,
      type: frontmatter.type || 'other',
      start_date: frontmatter.start_date,
      end_date: frontmatter.end_date,
      description: frontmatter.description,
      poster: frontmatter.poster,
      status: frontmatter.status || 'planning',
      budget_planned: frontmatter.budget_planned,
      budget_actual: frontmatter.budget_actual,
      budget_currency: frontmatter.budget_currency || 'USD',
      tags: frontmatter.tags,
      rating: frontmatter.rating,
      featured: frontmatter.featured,
      published: frontmatter.published !== undefined ? frontmatter.published : true,
      content: content || frontmatter.content,
    };

    // Create the vacation
    const vacation = await createVacation(vacationInput, session.user.id);

    // Create nested itinerary days if provided
    if (itinerary && Array.isArray(itinerary) && itinerary.length > 0) {
      for (const day of itinerary) {
        await createItineraryDay(vacation.id, day);
      }
    }

    // Create nested bookings if provided
    if (bookings && Array.isArray(bookings) && bookings.length > 0) {
      for (const booking of bookings) {
        await createBooking(vacation.id, booking);
      }
    }

    // Check achievements
    // Wrap in try-catch to prevent achievement errors from breaking vacation creation
    try {
      await checkAchievement(session.user.id, 'vacations');
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Continue anyway - vacation was created successfully
    }

    // Revalidate the vacations page
    revalidatePath("/vacations");
    revalidatePath(`/vacations/${vacation.slug}`);

    return NextResponse.json(
      {
        success: true,
        slug: vacation.slug,
        path: `/vacations/${vacation.slug}`,
        vacation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vacation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create vacation" },
      { status: 500 }
    );
  }
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

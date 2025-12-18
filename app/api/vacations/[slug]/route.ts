import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationWithDetails,
  getVacationBySlug,
  updateVacation,
  deleteVacation,
  type VacationInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";
import { checkAchievement } from "@/lib/achievements";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/vacations/[slug]
 * Get a vacation with all its itinerary and bookings
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const vacationData = await getVacationWithDetails(slug, session.user.id);

    if (!vacationData) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    return NextResponse.json(vacationData);
  } catch (error) {
    console.error("Error fetching vacation:", error);
    return NextResponse.json(
      { error: "Failed to fetch vacation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vacations/[slug]
 * Update vacation metadata
 *
 * Body format:
 * {
 *   frontmatter?: Partial<VacationInput>,
 *   content?: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const body = await request.json();
    const { frontmatter, content } = body;

    // Build update data
    const updateData: Partial<VacationInput> = {};

    if (frontmatter) {
      if (frontmatter.slug !== undefined) updateData.slug = frontmatter.slug;
      if (frontmatter.title !== undefined) updateData.title = frontmatter.title;
      if (frontmatter.destination !== undefined) updateData.destination = frontmatter.destination;
      if (frontmatter.type !== undefined) updateData.type = frontmatter.type;
      if (frontmatter.start_date !== undefined) updateData.start_date = frontmatter.start_date;
      if (frontmatter.end_date !== undefined) updateData.end_date = frontmatter.end_date;
      if (frontmatter.description !== undefined) updateData.description = frontmatter.description;
      if (frontmatter.poster !== undefined) updateData.poster = frontmatter.poster;
      if (frontmatter.status !== undefined) updateData.status = frontmatter.status;
      if (frontmatter.budget_planned !== undefined) updateData.budget_planned = frontmatter.budget_planned;
      if (frontmatter.budget_actual !== undefined) updateData.budget_actual = frontmatter.budget_actual;
      if (frontmatter.budget_currency !== undefined) updateData.budget_currency = frontmatter.budget_currency;
      if (frontmatter.tags !== undefined) updateData.tags = frontmatter.tags;
      if (frontmatter.rating !== undefined) updateData.rating = frontmatter.rating;
      if (frontmatter.featured !== undefined) updateData.featured = frontmatter.featured;
      if (frontmatter.published !== undefined) updateData.published = frontmatter.published;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    // Update vacation
    const success = await updateVacation(vacation.id, session.user.id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update vacation" },
        { status: 500 }
      );
    }

    // Get updated vacation
    const updatedVacation = await getVacationBySlug(
      updateData.slug || slug,
      session.user.id
    );

    // Check achievements (status changes, ratings, etc.)
    // Wrap in try-catch to prevent achievement errors from breaking the vacation update
    try {
      await checkAchievement(session.user.id, 'vacations');
    } catch (achievementError) {
      console.error('Error checking achievements:', achievementError);
      // Continue anyway - vacation was saved successfully
    }

    // Revalidate paths
    revalidatePath("/vacations");
    revalidatePath(`/vacations/${slug}`);
    if (updateData.slug && updateData.slug !== slug) {
      revalidatePath(`/vacations/${updateData.slug}`);
    }

    return NextResponse.json({
      success: true,
      vacation: updatedVacation,
    });
  } catch (error) {
    console.error("Error updating vacation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update vacation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vacations/[slug]
 * Delete a vacation (cascades to itinerary and bookings)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await requireAuthApi();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const vacation = await getVacationBySlug(slug, session.user.id);

    if (!vacation) {
      return NextResponse.json({ error: "Vacation not found" }, { status: 404 });
    }

    const success = await deleteVacation(vacation.id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete vacation" },
        { status: 500 }
      );
    }

    // Revalidate paths
    revalidatePath("/vacations");
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vacation:", error);
    return NextResponse.json(
      { error: "Failed to delete vacation" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getVacationBySlug,
  createVacationPhoto,
  getVacationPhotos,
  type VacationPhotoInput,
} from "@/lib/db/vacations";
import { requireAuthApi } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/vacations/[slug]/photos
 * Get all photos for a vacation
 */
export async function GET(
  _request: NextRequest,
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

    const photos = await getVacationPhotos(vacation.id);

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vacations/[slug]/photos
 * Add a photo to a vacation
 */
export async function POST(
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

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const photoInput: VacationPhotoInput = {
      url: body.url,
      caption: body.caption,
      date_taken: body.date_taken,
      order_index: body.order_index,
    };

    const photo = await createVacationPhoto(vacation.id, photoInput);

    // Revalidate paths
    revalidatePath(`/vacations/${slug}`);

    return NextResponse.json(
      {
        success: true,
        photo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create photo" },
      { status: 500 }
    );
  }
}

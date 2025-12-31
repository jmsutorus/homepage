import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/server';
import { 
  getRestaurantBySlug,
  getRestaurantVisits,
  createVisit,
  deleteVisit,
  getVisit
} from '@/lib/db/restaurants';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/restaurants/[slug]/visits - Get all visits for a restaurant
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    
    const restaurant = await getRestaurantBySlug(slug, userId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const visits = await getRestaurantVisits(restaurant.id);
    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}

// POST /api/restaurants/[slug]/visits - Add a visit
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    const data = await request.json();

    const restaurant = await getRestaurantBySlug(slug, userId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    if (!data.visit_date) {
      return NextResponse.json(
        { error: 'Visit date is required' },
        { status: 400 }
      );
    }

    const visit = await createVisit(
      {
        restaurantId: restaurant.id,
        eventId: data.eventId,
        visit_date: data.visit_date,
        notes: data.notes,
        rating: data.rating,
      },
      userId
    );

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants/[slug]/visits - Delete a visit (via query param)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get('visitId');

    if (!visitId) {
      return NextResponse.json(
        { error: 'Visit ID is required' },
        { status: 400 }
      );
    }

    const restaurant = await getRestaurantBySlug(slug, userId);
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Verify visit belongs to this restaurant
    const visit = await getVisit(parseInt(visitId), userId);
    if (!visit || visit.restaurantId !== restaurant.id) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    const deleted = await deleteVisit(parseInt(visitId), userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete visit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting visit:', error);
    return NextResponse.json(
      { error: 'Failed to delete visit' },
      { status: 500 }
    );
  }
}

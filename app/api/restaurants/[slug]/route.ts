import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/server';
import { 
  getRestaurantWithVisits, 
  updateRestaurant, 
  deleteRestaurant,
  restaurantSlugExists,
  getRestaurantBySlug
} from '@/lib/db/restaurants';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/restaurants/[slug] - Get a restaurant with visits
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    const restaurant = await getRestaurantWithVisits(slug, userId);
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

// PUT /api/restaurants/[slug] - Update a restaurant
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    const data = await request.json();

    // Check if restaurant exists
    const existing = await getRestaurantBySlug(slug, userId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // If updating slug, ensure it's unique
    if (data.slug && data.slug !== slug) {
      const slugExists = await restaurantSlugExists(data.slug, userId, existing.id);
      if (slugExists) {
        return NextResponse.json(
          { error: 'A restaurant with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await updateRestaurant(slug, userId, data);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update restaurant' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants/[slug] - Delete a restaurant
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    
    const deleted = await deleteRestaurant(slug, userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    );
  }
}

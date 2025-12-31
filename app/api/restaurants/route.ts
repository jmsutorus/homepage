import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/server';
import { 
  getAllRestaurantsWithVisitCount, 
  createRestaurant, 
  restaurantSlugExists 
} from '@/lib/db/restaurants';

// GET /api/restaurants - List all restaurants
export async function GET() {
  try {
    const userId = await getUserId();
    const restaurants = await getAllRestaurantsWithVisitCount(userId);
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

// POST /api/restaurants - Create a new restaurant
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Restaurant name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await restaurantSlugExists(uniqueSlug, userId)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const restaurant = await createRestaurant(
      {
        ...data,
        slug: uniqueSlug,
      },
      userId
    );

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}

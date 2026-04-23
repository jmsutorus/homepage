import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/server';
import { 
  getRestaurantWithVisits, 
  updateRestaurant, 
  deleteRestaurant,
  restaurantSlugExists,
  getRestaurantBySlug
} from '@/lib/db/restaurants';
import { getAdminStorage } from '@/lib/firebase/admin';

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

// PATCH /api/restaurants/[slug] - Partial update a restaurant (with photo cleanup)
export async function PATCH(request: Request, { params }: RouteParams) {
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

    // Handle photo cleanup if poster is being updated
    if (data.poster !== undefined && existing.poster && existing.poster !== data.poster) {
      if (existing.poster.includes("firebasestorage.googleapis.com")) {
        try {
          const bucket = getAdminStorage().bucket();
          const urlObj = new URL(existing.poster);
          const pathPart = urlObj.pathname.split("/o/")[1];
          if (pathPart) {
            const filePath = decodeURIComponent(pathPart);
            const oldFile = bucket.file(filePath);
            const [exists] = await oldFile.exists();
            if (exists) {
              await oldFile.delete();
              console.log(`Deleted old restaurant photo during PATCH: ${filePath}`);
            }
          }
        } catch (err) {
          console.error("Failed to delete old restaurant photo during PATCH:", err);
        }
      }
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
    
    // Delete photo from storage if it exists
    const existing = await getRestaurantBySlug(slug, userId);
    if (existing && existing.poster && existing.poster.includes("firebasestorage.googleapis.com")) {
      try {
        const bucket = getAdminStorage().bucket();
        const urlObj = new URL(existing.poster);
        const pathPart = urlObj.pathname.split("/o/")[1];
        if (pathPart) {
          const filePath = decodeURIComponent(pathPart);
          const oldFile = bucket.file(filePath);
          const [exists] = await oldFile.exists();
          if (exists) {
            await oldFile.delete();
            console.log(`Deleted restaurant photo during DELETE: ${filePath}`);
          }
        }
      } catch (err) {
        console.error("Failed to delete restaurant photo during DELETE:", err);
      }
    }

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

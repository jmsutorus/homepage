import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/server';
import { getVisitsByEvent } from '@/lib/db/restaurants';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/events/[slug]/restaurants - Get restaurants visited at this event
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const userId = await getUserId();
    
    // First get the event to get its ID
    const { getEventBySlug } = await import('@/lib/db/events');
    const event = await getEventBySlug(slug, userId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const visits = await getVisitsByEvent(event.id);
    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching event restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants for event' },
      { status: 500 }
    );
  }
}
